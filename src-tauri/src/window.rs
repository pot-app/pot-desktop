use crate::config::get_config;
use crate::selection::get_selection_text;
use crate::StringWrapper;
use crate::APP;
#[cfg(any(target_os = "linux", target_os = "windows"))]
use tauri::PhysicalPosition;
use tauri::{AppHandle, Manager, Window, WindowEvent};
use toml::Value;
#[cfg(any(target_os = "macos", target_os = "windows"))]
use window_shadows::set_shadow;

pub fn build_window(label: &str, title: &str, handle: &AppHandle) -> Result<Window, String> {
    let (width, height) = get_window_size();
    let (x, y) = get_mouse_location().unwrap();
    let builder = tauri::WindowBuilder::new(
        handle,
        label,
        tauri::WindowUrl::App("index_translator.html".into()),
    )
    .inner_size(width, height)
    .always_on_top(true)
    .focused(true)
    .title(title);

    #[cfg(target_os = "macos")]
    {
        let builder = builder
            .title_bar_style(tauri::TitleBarStyle::Overlay)
            .hidden_title(true);
        let window = match label {
            "persistent" => builder.center().skip_taskbar(false).build().unwrap(),
            _ => builder
                .position(x as f64, y as f64)
                .skip_taskbar(true)
                .build()
                .unwrap(),
        };
        set_shadow(&window, true).unwrap_or_default();
        window.set_focus().unwrap();
        match label {
            "persistent" => {}
            _ => {
                window.on_window_event(on_lose_focus);
            }
        };
        Ok(window)
    }

    #[cfg(target_os = "windows")]
    {
        let builder = builder.decorations(false);
        let window = match label {
            "persistent" => builder.skip_taskbar(false).build().unwrap(),
            _ => builder.skip_taskbar(true).build().unwrap(),
        };
        set_shadow(&window, true).unwrap_or_default();
        window.set_focus().unwrap();
        match label {
            "persistent" => {
                window.center().unwrap();
            }
            _ => {
                window.on_window_event(on_lose_focus);
                window.set_position(PhysicalPosition::new(x, y)).unwrap();
            }
        };
        Ok(window)
    }

    #[cfg(target_os = "linux")]
    {
        let builder = builder.transparent(true).decorations(false);
        let window = match label {
            "persistent" => builder.skip_taskbar(false).build().unwrap(),
            _ => builder.skip_taskbar(true).build().unwrap(),
        };

        window.set_focus().unwrap();
        match label {
            "persistent" => {
                window.center().unwrap();
            }
            _ => {
                window.on_window_event(on_lose_focus);
                window.set_position(PhysicalPosition::new(x, y)).unwrap();
            }
        };
        Ok(window)
    }
}

// 获取默认窗口大小
fn get_window_size() -> (f64, f64) {
    let width: f64 = get_config("window_width", Value::from(400), APP.get().unwrap().state())
        .as_integer()
        .unwrap() as f64;
    let height: f64 = get_config(
        "window_height",
        Value::from(500),
        APP.get().unwrap().state(),
    )
    .as_integer()
    .unwrap() as f64;
    (width, height)
}

// 失去焦点自动关闭窗口
// Gnome 下存在焦点捕获失败bug，windows下拖动窗口会失去焦点
// #[cfg(any(target_os = "macos", target_os = "linux"))]
fn on_lose_focus(event: &WindowEvent) {
    if let WindowEvent::Focused(v) = event {
        if !v {
            let handle = APP.get().unwrap();
            if let Some(window) = handle.get_window("translator") {
                window.close().unwrap();
            }
            if let Some(window) = handle.get_window("popclip") {
                window.close().unwrap();
            }
        }
    }
}

// 获取鼠标坐标
#[cfg(target_os = "linux")]
fn get_mouse_location() -> Result<(i32, i32), String> {
    use crate::config::get_monitor_info;
    use mouse_rs::Mouse;

    let mouse = Mouse::new();
    let pos = mouse.get_position().unwrap();
    let mut x = pos.x as f64;
    let mut y = pos.y as f64;

    let (width, height) = get_window_size();
    let handle = APP.get().unwrap();
    let (size_width, size_height, dpi) = get_monitor_info(handle.state());

    if x + width * dpi > size_width as f64 {
        x -= width * dpi;
        if x < 0.0 {
            x = 0.0;
        }
    }
    if y + height * dpi > size_height as f64 {
        y -= height * dpi;
        if y < 0.0 {
            y = 0.0;
        }
    }

    Ok((x as i32, y as i32))
}

#[cfg(target_os = "windows")]
fn get_mouse_location() -> Result<(i32, i32), String> {
    use crate::config::get_monitor_info;
    use windows::Win32::Foundation::POINT;
    use windows::Win32::UI::WindowsAndMessaging::GetCursorPos;

    let (width, height) = get_window_size();
    let handle = APP.get().unwrap();
    let (size_width, size_height, dpi) = get_monitor_info(handle.state());
    let mut point = POINT { x: 0, y: 0 };

    unsafe {
        if GetCursorPos(&mut point).as_bool() {
            let mut x = point.x as f64;
            let mut y = point.y as f64;
            // 由于获取到的屏幕大小以及鼠标坐标为物理像素，所以需要转换
            if x + width * dpi > size_width as f64 {
                x -= width * dpi;
                if x < 0.0 {
                    x = 0.0;
                }
            }
            if y + height * dpi > size_height as f64 {
                y -= height * dpi;
                if y < 0.0 {
                    y = 0.0;
                }
            }

            Ok((x as i32, y as i32))
        } else {
            Err("get cursorpos error".to_string())
        }
    }
}

#[cfg(target_os = "macos")]
fn get_mouse_location() -> Result<(i32, i32), String> {
    use core_graphics::display::CGDisplay;
    use core_graphics::event::CGEvent;
    use core_graphics::event_source::{CGEventSource, CGEventSourceStateID};
    let display = CGDisplay::main();
    let mode = display.display_mode().unwrap();
    let event =
        CGEvent::new(CGEventSource::new(CGEventSourceStateID::CombinedSessionState).unwrap());
    let point = event.unwrap().location();
    let mut x = point.x;
    let mut y = point.y;
    let (width, height) = get_window_size();
    if x + width > mode.width() as f64 {
        x = x - width;
        if x < 0.0 {
            x = 0.0;
        }
    }
    if y + height > mode.height() as f64 {
        y = y - height;
        if y < 0.0 {
            y = 0.0;
        }
    }
    return Ok((x as i32, y as i32));
}

// 划词翻译
pub fn translate_window() {
    // 获取选择文本
    let text = get_selection_text().unwrap();
    let handle = APP.get().unwrap();
    // 写入状态备用
    let state: tauri::State<StringWrapper> = handle.state();
    state.0.lock().unwrap().replace_range(.., &text);
    // 创建窗口
    match handle.get_window("translator") {
        Some(window) => {
            window.close().unwrap();
        }
        None => {
            let _window = build_window("translator", "Translator", handle).unwrap();
        }
    };
}

// 持久窗口
pub fn persistent_window() {
    let handle = APP.get().unwrap();
    match handle.get_window("persistent") {
        Some(window) => {
            window.close().unwrap();
        }
        None => {
            let _window = build_window("persistent", "Persistent", handle).unwrap();
        }
    };
}

// popclip划词翻译
pub fn popclip_window(text: String) {
    let handle = APP.get().unwrap();

    let state: tauri::State<StringWrapper> = handle.state();
    state.0.lock().unwrap().replace_range(.., &text);

    match handle.get_window("popclip") {
        Some(window) => {
            window.close().unwrap();
        }
        None => {
            let _window = build_window("popclip", "PopClip", handle).unwrap();
        }
    };
}
