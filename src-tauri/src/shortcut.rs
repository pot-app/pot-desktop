use crate::APP;
use crate::{config::get_config, window::persistent_window, window::translate_window};
use tauri::{GlobalShortcutManager, Manager};
use toml::Value;

// 注册全局快捷键
pub fn register_shortcut() -> Result<(), String> {
    let handle = APP.get().unwrap();
    // 释放所有快捷键
    handle.global_shortcut_manager().unregister_all().unwrap();
    // 依次注册快捷键
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
