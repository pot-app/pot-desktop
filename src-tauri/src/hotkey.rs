use crate::config::{get, set};
use crate::window::{input_translate, ocr_recognize, ocr_translate, selection_translate};
use crate::APP;
use log::{info, warn};
use tauri::{AppHandle, GlobalShortcutManager};

fn get_hotkey_from_store(name: &str) -> String {
    match get(name) {
        Some(v) => v.as_str().unwrap_or_default().to_string(),
        None => {
            set(name, "");
            String::new()
        }
    }
}

fn register<F>(app_handle: &AppHandle, name: &str, handler: F, key: &str) -> Result<(), String>
where
    F: Fn() + Send + 'static,
{
    let hotkey = if key.is_empty() {
        get_hotkey_from_store(name)
    } else {
        key.to_string()
    };

    let old_hotkey = get_hotkey_from_store(name);
    if !old_hotkey.is_empty() {
        // Always try to unregister old key first to avoid depending on frontend order.
        if let Err(e) = app_handle.global_shortcut_manager().unregister(&old_hotkey) {
            warn!(
                "Failed to unregister old shortcut: {} for {} {:?}",
                old_hotkey, name, e
            );
        }
    }

    if !hotkey.is_empty() {
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
    } else {
        info!("Cleared global shortcut for {}", name);
    }

    // Persist only when backend registration flow succeeds.
    set(name, hotkey);
    Ok(())
}

// Register global shortcuts
pub fn register_shortcut(shortcut: &str) -> Result<(), String> {
    let app_handle = APP.get().unwrap();
    match shortcut {
        "hotkey_selection_translate" => {
            register(app_handle, "hotkey_selection_translate", selection_translate, "")?
        }
        "hotkey_input_translate" => {
            register(app_handle, "hotkey_input_translate", input_translate, "")?
        }
        "hotkey_ocr_recognize" => {
            register(app_handle, "hotkey_ocr_recognize", ocr_recognize, "")?
        }
        "hotkey_ocr_translate" => {
            register(app_handle, "hotkey_ocr_translate", ocr_translate, "")?
        }
        "all" => {
            let mut errors = vec![];

            if let Err(e) = register(
                app_handle,
                "hotkey_selection_translate",
                selection_translate,
                "",
            ) {
                errors.push(format!("hotkey_selection_translate: {}", e));
            }
            if let Err(e) = register(app_handle, "hotkey_input_translate", input_translate, "") {
                errors.push(format!("hotkey_input_translate: {}", e));
            }
            if let Err(e) = register(app_handle, "hotkey_ocr_recognize", ocr_recognize, "") {
                errors.push(format!("hotkey_ocr_recognize: {}", e));
            }
            if let Err(e) = register(app_handle, "hotkey_ocr_translate", ocr_translate, "") {
                errors.push(format!("hotkey_ocr_translate: {}", e));
            }

            if !errors.is_empty() {
                return Err(errors.join("\n"));
            }
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
        _ => return Err(format!("Unknown hotkey name: {}", name)),
    }
    Ok(())
}
