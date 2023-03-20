use crate::StringWrapper;
use crate::APP;
#[cfg(any(target_os = "macos", target_os = "linux"))]
use tauri::WindowEvent;
use tauri::{Manager, PhysicalPosition};
#[cfg(any(target_os = "macos", target_os = "windows"))]
use window_shadows::set_shadow;

// 后续从设置读取
const WIDTH: f64 = 400.0;
const HEIGHT: f64 = 500.0;

// 失去焦点自动关闭窗口
// Gnome 下存在焦点捕获失败bug，windows下拖动窗口会失去焦点
#[cfg(any(target_os = "macos", target_os = "linux"))]
fn on_lose_focus(event: &WindowEvent) {
    match event {
        WindowEvent::Focused(v) => {
            if !v {
                let handle = APP.get().unwrap();
                match handle.get_window("translator") {
                    Some(window) => {
                        window.close().unwrap();
                    }
                    None => {}
                }
                match handle.get_window("popclip") {
                    Some(window) => {
                        window.close().unwrap();
                    }
                    None => {}
                }
            }
        }
        _ => {}
    }
}

// 获取鼠标坐标
#[cfg(target_os = "linux")]
fn get_mouse_location() -> Result<(i32, i32), String> {
    use std::process::Command;
    let output: String = match Command::new("xdotool").arg("getmouselocation").output() {
        Ok(v) => String::from_utf8(v.stdout).unwrap(),
        Err(e) => return Err(format!("xdotool执行出错{}", e.to_string())),
    };
    let output: Vec<&str> = output.split_whitespace().collect();
    let x = output
        .get(0)
        .unwrap()
        .replace("x:", "")
        .parse::<i32>()
        .unwrap();
    let y = output
        .get(1)
        .unwrap()
        .replace("y:", "")
        .parse::<i32>()
        .unwrap();
    return Ok((x, y));
}

#[cfg(target_os = "windows")]
fn get_mouse_location() -> Result<(i32, i32), String> {
    use windows::Win32::Foundation::POINT;
    use windows::Win32::Foundation::RECT;
    use windows::Win32::UI::HiDpi::GetDpiForWindow;
    use windows::Win32::UI::WindowsAndMessaging::GetWindowRect;
    use windows::Win32::UI::WindowsAndMessaging::{GetCursorPos, GetDesktopWindow};
    let mut point = POINT { x: 0, y: 0 };
    let mut rect = RECT {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
    };

    unsafe {
        if GetCursorPos(&mut point).as_bool() {
            let mut x = point.x as f64;
            let mut y = point.y as f64;
            // 获取桌面窗口的句柄
            let hwnd = GetDesktopWindow();
            let dpi = GetDpiForWindow(hwnd) as f64;
            if GetWindowRect(hwnd, &mut rect).as_bool() {
                // 由于获取到的屏幕大小以及鼠标坐标为物理像素，所以需要转换
                if point.x as f64 + WIDTH * (dpi / 100.0) > (rect.right - rect.left) as f64 {
                    x = (rect.right - rect.left) as f64 - WIDTH * (dpi / 100.0);
                }
                if point.y as f64 + HEIGHT * (dpi / 100.0) > (rect.bottom - rect.top) as f64 {
                    y = (rect.bottom - rect.top) as f64 - HEIGHT * (dpi / 100.0);
                }
            }
            return Ok((x as i32, y as i32));
        } else {
            return Err("error".to_string());
        }
    }
}

#[cfg(target_os = "macos")]
fn get_mouse_location() -> Result<(i32, i32), String> {
    use core_graphics::display::CGDisplay;
    use core_graphics::event::CGEvent;
    use core_graphics::event_source::{CGEventSource, CGEventSourceStateID};
    let display = CGDisplay::main();
    let rect = display.bounds();
    let event =
        CGEvent::new(CGEventSource::new(CGEventSourceStateID::CombinedSessionState).unwrap());
    let point = event.unwrap().location();
    let mut x = point.x;
    let mut y = point.y;
    // if point.x + WIDTH > rect.size.width {
    //     x = rect.size.width - WIDTH;
    // }
    // if point.y + HEIGHT > rect.size.height {
    //     y = rect.size.height - HEIGHT;
    // }
    return Ok((x as i32, y as i32));
}

// 划词翻译
pub fn translate_window() {
    #[cfg(any(target_os = "windows", target_os = "macos"))]
    {
        // 复制操作必须在拉起窗口之前，否则焦点会丢失
        use crate::selection::copy;
        copy();
    }
    let (x, y) = get_mouse_location().unwrap();

    let handle = APP.get().unwrap();
    match handle.get_window("translator") {
        Some(window) => {
            window.close().unwrap();
        }
        None => {
            let builder = tauri::WindowBuilder::new(
                handle,
                "translator",
                tauri::WindowUrl::App("index_translator.html".into()),
            )
            .inner_size(WIDTH, HEIGHT)
            .always_on_top(true)
            .decorations(false)
            .skip_taskbar(true)
            .focused(true)
            .title("Translator");

            #[cfg(target_os = "macos")]
            {
                let window = builder.build().unwrap();
                set_shadow(&window, true).unwrap_or_default();
                window.on_window_event(on_lose_focus);
                window.set_position(PhysicalPosition::new(x, y)).unwrap();
            }

            #[cfg(target_os = "windows")]
            {
                let window = builder.build().unwrap();
                set_shadow(&window, true).unwrap_or_default();
                window.set_position(PhysicalPosition::new(x, y)).unwrap();
            }

            #[cfg(target_os = "linux")]
            {
                let window = builder.transparent(true).build().unwrap();
                window.on_window_event(on_lose_focus);
                window.set_position(PhysicalPosition::new(x, y)).unwrap();
            }
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
            let builder = tauri::WindowBuilder::new(
                handle,
                "persistent",
                tauri::WindowUrl::App("index_translator.html".into()),
            )
            .inner_size(WIDTH, HEIGHT)
            .always_on_top(true)
            .decorations(false)
            .center()
            .title("Translator");

            #[cfg(target_os = "macos")]
            {
                let window = builder.build().unwrap();
                set_shadow(&window, true).unwrap_or_default();
            }

            #[cfg(target_os = "windows")]
            {
                let window = builder.build().unwrap();
                set_shadow(&window, true).unwrap_or_default();
            }

            #[cfg(target_os = "linux")]
            {
                let _window = builder.transparent(true).build().unwrap();
            }
        }
    };
}

// popclip划词翻译
pub fn popclip_window(text: String) {
    let (x, y) = get_mouse_location().unwrap();

    let handle = APP.get().unwrap();
    match handle.get_window("popclip") {
        Some(window) => {
            window.close().unwrap();
        }
        None => {
            let builder = tauri::WindowBuilder::new(
                handle,
                "popclip",
                tauri::WindowUrl::App("index_translator.html".into()),
            )
            .inner_size(WIDTH, HEIGHT)
            .always_on_top(true)
            .decorations(false)
            .skip_taskbar(true)
            .focused(true)
            .title("PopClip");

            #[cfg(target_os = "macos")]
            {
                let window = builder.build().unwrap();
                set_shadow(&window, true).unwrap_or_default();
                window.on_window_event(on_lose_focus);
                window.set_position(PhysicalPosition::new(x, y)).unwrap();
            }

            #[cfg(target_os = "windows")]
            {
                let window = builder.build().unwrap();
                set_shadow(&window, true).unwrap_or_default();
                window.set_position(PhysicalPosition::new(x, y)).unwrap();
            }

            #[cfg(target_os = "linux")]
            {
                let window = builder.transparent(true).build().unwrap();
                window.on_window_event(on_lose_focus);
                window.set_position(PhysicalPosition::new(x, y)).unwrap();
            }
            let state: tauri::State<StringWrapper> = handle.state();
            state.0.lock().unwrap().replace_range(.., &text);
        }
    };
}

#[tauri::command]
pub fn get_popclip_str(state: tauri::State<StringWrapper>) -> String {
    return state.0.lock().unwrap().to_string();
}
