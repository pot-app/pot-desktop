use crate::config::CONFIG;
use crate::APP;
#[cfg(target_os = "linux")]
use tauri::WindowEvent;
#[cfg(target_os = "macos")]
use tauri::WindowEvent;
use tauri::{GlobalShortcutManager, Manager, PhysicalPosition, PhysicalSize};
#[cfg(target_os = "windows")]
use window_shadows::set_shadow;
#[cfg(target_os = "macos")]
use window_shadows::set_shadow;

// 失去焦点自动关闭窗口
// Gnome 下存在焦点捕获失败bug，windows下拖动窗口会失去焦点
#[cfg(all(unix))]
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
            }
        }
        _ => {}
    }
}

// windows 复制操作
#[cfg(target_os = "windows")]
fn copy() {
    use enigo::*;
    let mut enigo = Enigo::new();
    // 先释放按键
    enigo.key_up(Key::Control);
    enigo.key_up(Key::Alt);
    enigo.key_up(Key::Shift);
    enigo.key_up(Key::Space);
    // 发送CtrlC
    enigo.key_down(Key::Control);
    enigo.key_click(Key::Layout('c'));
    enigo.key_up(Key::Control);
}
// 获取鼠标坐标
#[cfg(target_os = "linux")]
fn get_mouse_location() -> Result<(i32, i32), String> {
    use std::process::Command;
    let output: String = match Command::new("xdotool").arg("getmouselocation").output() {
        Ok(v) => String::from_utf8(v.stdout).unwrap(),
        Err(e) => return Err(format!("xsel执行出错{}", e.to_string())),
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
            let mut x = point.x;
            let mut y = point.y;
            // 获取桌面窗口的句柄
            let hwnd = GetDesktopWindow();
            if GetWindowRect(hwnd, &mut rect).as_bool() {
                if point.x + 400 > rect.right {
                    x = rect.right - 400;
                }
                if point.y + 500 > rect.bottom {
                    y = rect.bottom - 500;
                }
            }
            return Ok((x, y));
        } else {
            return Err("error".to_string());
        }
    }
}
// 划词翻译
fn translate() {
    #[cfg(target_os = "windows")]
    let (x, y) = get_mouse_location().unwrap();
    #[cfg(target_os = "linux")]
    let (x, y) = get_mouse_location().unwrap();
    // 复制操作必须在拉起窗口之前，否则焦点会丢失
    #[cfg(target_os = "windows")]
    copy();
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
            .always_on_top(true)
            .decorations(false)
            .skip_taskbar(true)
            .center()
            .focused(true)
            .title("Translator");

            #[cfg(target_os = "macos")]
            {
                let window = builder.build().unwrap();
                window.set_size(PhysicalSize::new(400, 500)).unwrap();
                window
                    .set_min_size(Some(PhysicalSize::new(400, 400)))
                    .unwrap();
                set_shadow(&window, true).unwrap_or_default();

                window.on_window_event(on_lose_focus);
            }

            #[cfg(target_os = "windows")]
            {
                let window = builder.build().unwrap();
                window.set_size(PhysicalSize::new(400, 500)).unwrap();
                window
                    .set_min_size(Some(PhysicalSize::new(400, 400)))
                    .unwrap();
                set_shadow(&window, true).unwrap_or_default();

                window.set_position(PhysicalPosition::new(x, y)).unwrap();
            }
            #[cfg(target_os = "linux")]
            {
                let window = builder
                    .transparent(true)
                    // x11根据inner_size这个初始值来判断窗口是否超出屏幕
                    // 不设置的话会有一个默认尺寸，导致窗口出现位置不对
                    .inner_size(400.0, 500.0)
                    .build()
                    .unwrap();
                window.set_size(PhysicalSize::new(400, 500)).unwrap();
                window
                    .set_min_size(Some(PhysicalSize::new(400, 400)))
                    .unwrap();
                // Windows 下拖动窗口会失去焦点,此方法不适用
                window.on_window_event(on_lose_focus);
                window.set_position(PhysicalPosition::new(x, y)).unwrap();
            }
        }
    };
}

// 持久窗口
fn persistent_window() {
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
            .always_on_top(true)
            .decorations(false)
            .center()
            .title("Translator");

            #[cfg(target_os = "macos")]
            {
                let window = builder.build().unwrap();
                window.set_size(PhysicalSize::new(400, 500)).unwrap();
                window
                    .set_min_size(Some(PhysicalSize::new(400, 400)))
                    .unwrap();
                set_shadow(&window, true).unwrap_or_default();
            }

            #[cfg(target_os = "windows")]
            {
                let window = builder.build().unwrap();
                window.set_size(PhysicalSize::new(400, 500)).unwrap();
                window
                    .set_min_size(Some(PhysicalSize::new(400, 400)))
                    .unwrap();
                set_shadow(&window, true).unwrap_or_default();
            }

            #[cfg(target_os = "linux")]
            {
                let window = builder.transparent(true).build().unwrap();
                window.set_size(PhysicalSize::new(400, 500)).unwrap();
                window
                    .set_min_size(Some(PhysicalSize::new(400, 400)))
                    .unwrap();
            }
        }
    };
}

// 注册全局快捷键
pub fn register_shortcut() {
    let handle = APP.get().unwrap();

    match CONFIG.get() {
        Some(v) => {
            handle
                .global_shortcut_manager()
                .register(v.shortcut_translate.as_str(), translate)
                .unwrap();
            handle
                .global_shortcut_manager()
                .register(v.shortcut_persistent.as_str(), persistent_window)
                .unwrap();
        }
        None => {
            panic!()
        }
    }
}
