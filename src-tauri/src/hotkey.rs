use crate::config::{get, set};
use crate::window::{input_translate, ocr_recognize, ocr_translate, selection_translate};
use crate::APP;
use log::{info, warn};
use tauri::{AppHandle, GlobalShortcutManager};

fn register<F>(app_handle: &AppHandle, name: &str, handler: F) -> Result<(), String>
where
    F: Fn() + Send + 'static,
{
    let hotkey = match get(name) {
        Some(v) => v.as_str().unwrap().to_string(),
        None => {
            set(name, "");
            String::new()
        }
    };
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
        )?,
        "hotkey_input_translate" => {
            register(app_handle, "hotkey_input_translate", input_translate)?
        }
        "hotkey_ocr_recognize" => register(app_handle, "hotkey_ocr_recognize", ocr_recognize)?,
        "hotkey_ocr_translate" => register(app_handle, "hotkey_ocr_translate", ocr_translate)?,
        "all" => {
            register(
                app_handle,
                "hotkey_selection_translate",
                selection_translate,
            )?;
            register(app_handle, "hotkey_input_translate", input_translate)?;
            register(app_handle, "hotkey_ocr_recognize", ocr_recognize)?;
            register(app_handle, "hotkey_ocr_translate", ocr_translate)?;
        }
        _ => {}
    }
    Ok(())
}
