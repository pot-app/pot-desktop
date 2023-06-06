use crate::config::get_config;
use crate::window::screenshot_window;
use crate::window::{persistent_window, translate_window};
use crate::APP;
use tauri::{AppHandle, GlobalShortcutManager, Manager};
use toml::Value;

fn register_translate(handle: &AppHandle) -> Result<(), String> {
    let shortcut_translate = get_config(
        "shortcut_translate",
        Value::from(""),
        APP.get().unwrap().state(),
    );

    if shortcut_translate.as_str().unwrap() != "" {
        match handle
            .global_shortcut_manager()
            .register(shortcut_translate.as_str().unwrap(), translate_window)
        {
            Ok(()) => {}
            Err(e) => return Err(e.to_string()),
        };
    }
    Ok(())
}
fn register_persistent(handle: &AppHandle) -> Result<(), String> {
    let shortcut_persistent = get_config(
        "shortcut_persistent",
        Value::from(""),
        APP.get().unwrap().state(),
    );
    if shortcut_persistent.as_str().unwrap() != "" {
        match handle
            .global_shortcut_manager()
            .register(shortcut_persistent.as_str().unwrap(), persistent_window)
        {
            Ok(()) => {}
            Err(e) => return Err(e.to_string()),
        };
    }
    Ok(())
}
fn register_screenshot(handle: &AppHandle) -> Result<(), String> {
    let shortcut_screenshot = get_config(
        "shortcut_screenshot",
        Value::from(""),
        APP.get().unwrap().state(),
    );
    if shortcut_screenshot.as_str().unwrap() != "" {
        match handle
            .global_shortcut_manager()
            .register(shortcut_screenshot.as_str().unwrap(), screenshot_window)
        {
            Ok(()) => {}
            Err(e) => return Err(e.to_string()),
        };
    }
    Ok(())
}
// 注册全局快捷键
pub fn register_shortcut(shortcut: &str) -> Result<(), String> {
    let handle = APP.get().unwrap();
    // // 释放所有快捷键 linux下会导致快捷键注册失效 https://github.com/tauri-apps/tauri/issues/6487
    // #[cfg(any(target_os = "macos", target_os = "windows"))]
    // handle.global_shortcut_manager().unregister_all().unwrap();
    // 依次注册快捷键
    match shortcut {
        "shortcut_translate" => register_translate(handle)?,
        "shortcut_persistent" => register_persistent(handle)?,
        "shortcut_screenshot" => register_screenshot(handle)?,
        "all" => {
            register_translate(handle)?;
            register_persistent(handle)?;
            register_screenshot(handle)?;
        }
        _ => {}
    }
    Ok(())
}
