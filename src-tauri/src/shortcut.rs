use crate::config::CONFIG;
use crate::APP;
use tauri::{GlobalShortcutManager, Manager};

// 划词翻译
fn translate() {
    let handle = APP.get().unwrap();
    match handle.get_window("translator") {
        Some(window) => {
            window.close().unwrap();
        }
        None => {
            let _window = tauri::WindowBuilder::new(
                handle,
                "translator",
                tauri::WindowUrl::App("index_translator.html".into()),
            )
            .inner_size(400.0, 400.0)
            .min_inner_size(400.0, 400.0)
            .always_on_top(true)
            .transparent(true)
            .decorations(false)
            .skip_taskbar(true)
            .center()
            .title("Translator")
            .build()
            .unwrap();
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
            let _window = tauri::WindowBuilder::new(
                handle,
                "persistent",
                tauri::WindowUrl::App("index_persistent_translator.html".into()),
            )
            .inner_size(400.0, 400.0)
            .min_inner_size(400.0, 400.0)
            .always_on_top(true)
            .transparent(true)
            .decorations(false)
            .skip_taskbar(true)
            .center()
            .title("Translator")
            .build()
            .unwrap();
        }
    };
}

pub fn register_shortcut() {
    let handle = APP.get().unwrap();
    // 注册全局快捷键
    match CONFIG.get() {
        Some(v) => {
            handle
                .global_shortcut_manager()
                .register(v.shortcut_translate.as_str(), translate)
                .unwrap();
            handle
                .global_shortcut_manager()
                .register(v.shortcut_open_translate.as_str(), persistent_window)
                .unwrap();
        }
        None => {
            panic!()
        }
    }
}
