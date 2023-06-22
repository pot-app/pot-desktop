use crate::config::get_config;
use crate::StringWrapper;
use crate::APP;
use tauri::Monitor;
use tauri::{AppHandle, Manager, Window};
use toml::Value;
#[cfg(any(target_os = "macos", target_os = "windows"))]
use window_shadows::set_shadow;

pub fn build_translate_window(
    label: &str,
    title: &str,
    handle: &AppHandle,
) -> Result<Window, String> {
    let (width, height) = get_window_size();
    // 对于Mac来说这里获取直接可用的逻辑坐标
    // 对于Windows和Linux，这里仅获取物理坐标，用于确保窗口创建在指定的显示器上
    // 获取到真实的显示器信息之后再做转换
    let (x, y) = get_mouse_location().unwrap();

    let util_window = handle.get_window("util").unwrap();
    let current_monitor = get_current_monitor(x, y, util_window).unwrap();
    let dpi = current_monitor.scale_factor();
    let physical_position = current_monitor.position();
    let position: tauri::LogicalPosition<f64> = physical_position.to_logical(dpi);

    let builder =
        tauri::WindowBuilder::new(handle, label, tauri::WindowUrl::App("index.html".into()))
            .position(position.x, position.y)
            .inner_size(width, height)
            .focused(true)
            .visible(false)
            .title(title);

    #[cfg(target_os = "macos")]
    {
        let builder = builder
            .title_bar_style(tauri::TitleBarStyle::Overlay)
            .hidden_title(true);
        let window = match label {
            "persistent" => builder.skip_taskbar(false).build().unwrap(),
            _ => builder.skip_taskbar(true).build().unwrap(),
        };
        // 获取窗口所在的显示器信息
        let _monitor = window.current_monitor().unwrap().unwrap();

        window.set_size(tauri::LogicalSize::new(width, height));
        // 获取到显示器信息之后再移动窗口，确保窗口大小正确
        match label {
            "persistent" => window.center().unwrap(),
            _ => window
                .set_position(tauri::LogicalPosition::new(x, y))
                .unwrap(),
        };
        set_shadow(&window, true).unwrap_or_default();
        Ok(window)
    }

    #[cfg(target_os = "windows")]
    {
        let builder = builder.decorations(false);
        let window = match label {
            "persistent" => builder.skip_taskbar(false).build().unwrap(),
            _ => builder.skip_taskbar(true).build().unwrap(),
        };
        // 获取窗口所在的显示器信息
        let monitor = window.current_monitor().unwrap().unwrap();
        window
            .set_size(tauri::LogicalSize::new(width, height))
            .unwrap();
        match label {
            "persistent" => window.center().unwrap(),
            _ => {
                // 用显示器信息将物理坐标做转换
                let (x, y) = convert_mouse_location((x, y), monitor).unwrap();
                // 获取到显示器信息之后再移动窗口，确保窗口大小正确
                window
                    .set_position(tauri::PhysicalPosition::new(x * dpi, y * dpi))
                    .unwrap();
            }
        }
        set_shadow(&window, true).unwrap_or_default();
        Ok(window)
    }

    #[cfg(target_os = "linux")]
    {
        let builder = builder.transparent(true).decorations(false);
        let window = match label {
            "persistent" => builder.skip_taskbar(false).build().unwrap(),
            _ => builder.skip_taskbar(true).build().unwrap(),
        };
        // 获取窗口所在的显示器信息
        let monitor = window.current_monitor().unwrap().unwrap();
        window
            .set_size(tauri::LogicalSize::new(width, height))
            .unwrap();
        match label {
            "persistent" => window.center().unwrap(),
            _ => {
                // 用显示器信息将物理坐标做转换
                let (x, y) = convert_mouse_location((x, y), monitor).unwrap();
                // 获取到显示器信息之后再移动窗口，确保窗口大小正确
                window
                    .set_position(tauri::PhysicalPosition::new(x * dpi, y * dpi))
                    .unwrap();
            }
        }
        Ok(window)
    }
}

pub fn build_ocr_window(handle: &AppHandle) -> Result<Window, String> {
    let (x, y) = get_mouse_location().unwrap();
    let util_window = handle.get_window("util").unwrap();
    let current_monitor = get_current_monitor(x, y, util_window).unwrap();
    let physical_position = current_monitor.position();
    let mut builder =
        tauri::WindowBuilder::new(handle, "ocr", tauri::WindowUrl::App("index.html".into()))
            .inner_size(800.0, 400.0)
            .min_inner_size(600.0, 400.0)
            .focused(true)
            .title("OCR")
            .visible(false);

    #[cfg(target_os = "linux")]
    {
        builder = builder.transparent(true);
    }
    #[cfg(target_os = "macos")]
    {
        builder = builder
            .title_bar_style(tauri::TitleBarStyle::Overlay)
            .hidden_title(true);
    }
    #[cfg(not(target_os = "macos"))]
    {
        builder = builder.decorations(false);
    }

    let window = builder.build().unwrap();
    window.set_position(*physical_position).unwrap();
    window.center().unwrap();
    #[cfg(not(target_os = "linux"))]
    set_shadow(&window, true).unwrap_or_default();
    Ok(window)
}

fn get_current_monitor(x: f64, y: f64, util: Window) -> Result<Monitor, ()> {
    let monitors = util.available_monitors().unwrap();
    for m in monitors {
        let size = m.size();
        let position = m.position();

        #[cfg(target_os = "macos")]
        let position = {
            let dpi = m.scale_factor();
            let position: tauri::LogicalPosition<f64> = position.to_logical(dpi);
            position
        };
        #[cfg(target_os = "macos")]
        let size = {
            let dpi = m.scale_factor();
            let size: tauri::LogicalSize<f64> = size.to_logical(dpi);
            size
        };

        if x >= position.x as f64 && x <= (position.x as f64 + size.width as f64) {
            if y >= position.y as f64 && y <= (position.y as f64 + size.height as f64) {
                return Ok(m);
            }
        }
    }
    Err(())
}

pub fn build_screenshot_window(handle: &AppHandle, label: &str) -> Result<Window, String> {
    let (x, y) = get_mouse_location().unwrap();
    let util_window = handle.get_window("util").unwrap();
    let current_monitor = get_current_monitor(x, y, util_window).unwrap();
    let dpi = current_monitor.scale_factor();
    let physical_position = current_monitor.position();
    let position: tauri::LogicalPosition<f64> = physical_position.to_logical(dpi);
    #[cfg(target_os = "macos")]
    let size = current_monitor.size();
    let window =
        tauri::WindowBuilder::new(handle, label, tauri::WindowUrl::App("index.html".into()))
            .position(position.x, position.y)
            .decorations(false)
            .focused(true)
            .title("Screenshot")
            .skip_taskbar(true)
            .visible(false)
            .build()
            .unwrap();
    #[cfg(target_os = "macos")]
    window.set_size(*size).unwrap();
    #[cfg(not(target_os = "macos"))]
    window.set_fullscreen(true).unwrap();
    window.set_always_on_top(true).unwrap();
    Ok(window)
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

#[cfg(any(target_os = "linux", target_os = "windows"))]
fn convert_mouse_location(
    location: (f64, f64),
    monitor: tauri::Monitor,
) -> Result<(f64, f64), String> {
    let (mut x, mut y) = location;
    let (width, height) = get_window_size();
    let monitor_size = monitor.size();
    let monitor_position = monitor.position();
    let monitor_position_x = monitor_position.x as f64;
    let monitor_position_y = monitor_position.y as f64;
    let dpi = monitor.scale_factor();
    x /= dpi;
    y /= dpi;
    if x + width > monitor_position_x + monitor_size.width as f64 / dpi {
        x -= width;
        if x < monitor_position_x {
            x = monitor_position_x;
        }
    }
    if y + height > monitor_position_y + monitor_size.height as f64 / dpi {
        y -= height;
        if y < monitor_position_y {
            y = monitor_position_y;
        }
    }

    Ok((x, y))
}
// 获取鼠标物理坐标
#[cfg(target_os = "linux")]
fn get_mouse_location() -> Result<(f64, f64), String> {
    use mouse_position::mouse_position::Mouse;

    let position = Mouse::get_mouse_position();
    if let Mouse::Position { x: pos_x, y: pos_y } = position {
        Ok((pos_x as f64, pos_y as f64))
    } else {
        Err("get cursorpos error".to_string())
    }
}
// 获取鼠标物理坐标
#[cfg(target_os = "windows")]
fn get_mouse_location() -> Result<(f64, f64), String> {
    use windows::Win32::Foundation::POINT;
    use windows::Win32::UI::WindowsAndMessaging::GetCursorPos;

    let mut point = POINT { x: 0, y: 0 };

    unsafe {
        if GetCursorPos(&mut point).as_bool() {
            Ok((point.x as f64, point.y as f64))
        } else {
            Err("get cursorpos error".to_string())
        }
    }
}
// 获取鼠标逻辑坐标
#[cfg(target_os = "macos")]
fn get_mouse_location() -> Result<(f64, f64), String> {
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
    return Ok((x, y));
}

// 划词翻译
pub fn translate_window() {
    use selection::get_text;
    // 获取选择文本
    let text = get_text();

    let handle = APP.get().unwrap();
    // 写入状态备用
    let state: tauri::State<StringWrapper> = handle.state();
    state.0.lock().unwrap().replace_range(.., &text);
    // 创建窗口
    match handle.get_window("translator") {
        Some(window) => {
            window.set_focus().unwrap();
            window.emit("new_selection", text).unwrap();
        }
        None => {
            let _window = build_translate_window("translator", "Translator", handle).unwrap();
        }
    };
}

// 持久窗口
pub fn persistent_window() {
    let handle = APP.get().unwrap();
    match handle.get_window("persistent") {
        Some(window) => {
            window.set_focus().unwrap();
        }
        None => {
            let _window = build_translate_window("persistent", "Persistent", handle).unwrap();
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
            window.set_focus().unwrap();
            window.emit("new_selection", text).unwrap();
        }
        None => {
            let _window = build_translate_window("popclip", "PopClip", handle).unwrap();
        }
    };
}

// 截图翻译
pub fn popclip_ocr_window() {
    let handle = APP.get().unwrap();

    match handle.get_window("popclip_ocr") {
        Some(window) => {
            window.set_focus().unwrap();
            window.emit("new_screenshot", "").unwrap();
        }
        None => {
            let _window =
                build_translate_window("popclip_ocr", "Screenshot Translate", handle).unwrap();
        }
    };
}

// OCR
pub fn ocr_window() {
    let handle = APP.get().unwrap();
    match handle.get_window("ocr") {
        Some(window) => {
            window.set_focus().unwrap();
        }
        None => {
            let window = build_ocr_window(handle).unwrap();
            window.listen("translate_from_ocr", |e| {
                let raw_str = e.payload().unwrap().to_string();
                let text = raw_str.trim_matches('"');
                let text = text.replace("\\n", "\n");
                popclip_window(text);
            });
        }
    };
}

// Screenshot
pub fn screenshot_ocr_window() {
    let handle = APP.get().unwrap();

    match handle.get_window("screenshot_ocr") {
        Some(window) => {
            window.close().unwrap();
        }
        None => {
            let window = build_screenshot_window(handle, "screenshot_ocr").unwrap();
            window.listen("ocr", |_| ocr_window());
        }
    };
}

// Screenshot
pub fn screenshot_translate_window() {
    let handle = APP.get().unwrap();

    match handle.get_window("screenshot_translate") {
        Some(window) => {
            window.close().unwrap();
        }
        None => {
            let window = build_screenshot_window(handle, "screenshot_translate").unwrap();
            window.listen("translate", |_| popclip_ocr_window());
        }
    };
}
