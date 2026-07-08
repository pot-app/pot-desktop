use crate::config::{get, set};
use crate::mouse_hotkey;
use crate::window::{input_translate, ocr_recognize, ocr_translate, selection_translate};
use crate::APP;
use log::{info, warn};
use tauri::{AppHandle, GlobalShortcutManager};

fn register<F>(app_handle: &AppHandle, name: &str, handler: F, key: &str) -> Result<(), String>
where
    F: Fn() + Send + 'static,
{
    let hotkey = {
        if key.is_empty() {
            match get(name) {
                Some(v) => v.as_str().unwrap().to_string(),
                None => {
                    set(name, "");
                    String::new()
                }
            }
        } else {
            key.to_string()
        }
    };

    if !hotkey.is_empty() {
        if mouse_hotkey::is_mouse_shortcut(&hotkey) {
            return mouse_hotkey::register(name, &hotkey);
        }
        match app_handle
            .global_shortcut_manager()
            .register(hotkey.as_str(), handler)
        {
            Ok(()) => {
                info!("Registered global shortcut: {} for {}", hotkey, name);
            }
            Err(e) => {
                warn!("Failed to register global shortcut: {} {:?}", hotkey, e);
                return Err(e.to_string());
            }
        };
    }
    Ok(())
}

// Register global shortcuts
pub fn register_shortcut(shortcut: &str) -> Result<(), String> {
    let app_handle = APP.get().unwrap();
    match shortcut {
        "hotkey_selection_translate" => register(
            app_handle,
            "hotkey_selection_translate",
            selection_translate,
            "",
        )?,
        "hotkey_input_translate" => {
            register(app_handle, "hotkey_input_translate", input_translate, "")?
        }
        "hotkey_ocr_recognize" => register(app_handle, "hotkey_ocr_recognize", ocr_recognize, "")?,
        "hotkey_ocr_translate" => register(app_handle, "hotkey_ocr_translate", ocr_translate, "")?,
        "all" => {
            register(
                app_handle,
                "hotkey_selection_translate",
                selection_translate,
                "",
            )?;
            register(app_handle, "hotkey_input_translate", input_translate, "")?;
            register(app_handle, "hotkey_ocr_recognize", ocr_recognize, "")?;
            register(app_handle, "hotkey_ocr_translate", ocr_translate, "")?;
        }
        _ => {}
    }
    Ok(())
}

#[tauri::command]
pub fn register_shortcut_by_frontend(name: &str, shortcut: &str) -> Result<(), String> {
    let app_handle = APP.get().unwrap();
    match name {
        "hotkey_selection_translate" => register(
            app_handle,
            "hotkey_selection_translate",
            selection_translate,
            shortcut,
        )?,
        "hotkey_input_translate" => register(
            app_handle,
            "hotkey_input_translate",
            input_translate,
            shortcut,
        )?,
        "hotkey_ocr_recognize" => {
            register(app_handle, "hotkey_ocr_recognize", ocr_recognize, shortcut)?
        }
        "hotkey_ocr_translate" => {
            register(app_handle, "hotkey_ocr_translate", ocr_translate, shortcut)?
        }
        _ => return Err("Unknown hotkey action".to_string()),
    }
    Ok(())
}

#[tauri::command]
pub fn is_shortcut_registered(shortcut: &str) -> Result<bool, String> {
    if shortcut.is_empty() {
        return Ok(false);
    }
    if mouse_hotkey::is_mouse_shortcut(shortcut) {
        return Ok(mouse_hotkey::is_registered(shortcut));
    }
    APP.get()
        .unwrap()
        .global_shortcut_manager()
        .is_registered(shortcut)
        .map_err(|error| error.to_string())
}

#[tauri::command]
pub fn unregister_shortcut(shortcut: &str) -> Result<(), String> {
    if shortcut.is_empty() {
        return Ok(());
    }
    if mouse_hotkey::is_mouse_shortcut(shortcut) {
        mouse_hotkey::unregister(shortcut);
        return Ok(());
    }
    APP.get()
        .unwrap()
        .global_shortcut_manager()
        .unregister(shortcut)
        .map_err(|error| error.to_string())
}
