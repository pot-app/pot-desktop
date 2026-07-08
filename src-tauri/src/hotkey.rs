use crate::config::{get, set};
use crate::window::{input_translate, ocr_recognize, ocr_translate, selection_translate};
use crate::APP;
use log::{info, warn};
use tauri::{AppHandle, GlobalShortcutManager};

fn register<F>(app_handle: &AppHandle, name: &str, handler: F, key: &str) -> Result<(), String>
where
    F: Fn() + Send + Clone + 'static,
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
        let mut manager = app_handle.global_shortcut_manager();
        // Register with retries. Before every attempt we force an `unregister`
        // (ignoring its result) for two reasons:
        //   1. A previous attempt that the OS rejected can leave Tauri's manager
        //      stuck reporting `AcceleratorAlreadyRegistered` even though the OS
        //      never actually bound the combo — clearing it lets `register` work.
        //   2. Re-registering after a config change / stale binding from a prior
        //      run would otherwise fail with "already registered".
        // The short delay between attempts also lets a transient conflict at
        // login clear (another autostart app may briefly hold the combo before
        // releasing it).
        const MAX_ATTEMPTS: u32 = 4;
        let mut last_err = None;
        for attempt in 0..MAX_ATTEMPTS {
            let _ = manager.unregister(hotkey.as_str());
            match manager.register(hotkey.as_str(), handler.clone()) {
                Ok(()) => {
                    info!("Registered global shortcut: {} for {}", hotkey, name);
                    return Ok(());
                }
                Err(e) => {
                    warn!(
                        "Failed to register global shortcut '{}' for {} (attempt {}/{}): {:?}",
                        hotkey,
                        name,
                        attempt + 1,
                        MAX_ATTEMPTS,
                        e
                    );
                    last_err = Some(e);
                    if attempt + 1 < MAX_ATTEMPTS {
                        std::thread::sleep(std::time::Duration::from_millis(300));
                    }
                }
            }
        }
        // Every attempt failed — surface an actionable error (action name + the
        // actual key combination + the reason).
        let e = last_err.unwrap();
        let base = format!("{} [{}]: {}", name, hotkey, e);
        // On Windows, probe the system for extra context and, for known system
        // shortcuts, name the owner.
        #[cfg(windows)]
        {
            let detail = crate::hotkey_owner::describe_conflict(hotkey.as_str());
            if !detail.is_empty() {
                return Err(format!("{}\n{}", base, detail));
            }
        }
        return Err(base);
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
            // Clear any shortcuts left over from a previous registration before
            // (re-)registering everything. This is the bulk entry point used at
            // startup and whenever all hotkeys are refreshed; wiping first avoids
            // a desync where a shortcut is still tracked as registered (e.g. after
            // an unclean shutdown, a restart that did not unregister, or a failed
            // attempt that the underlying library left half-recorded) and every
            // subsequent attempt then fails with "already registered".
            if let Err(e) = app_handle.global_shortcut_manager().unregister_all() {
                warn!("Failed to clear existing global shortcuts before re-register: {:?}", e);
            }
            // Register each hotkey independently and collect failures, so that a
            // single conflicting/invalid binding does NOT prevent the remaining
            // hotkeys from being registered (previously the `?` operator aborted
            // the whole batch on the first error, silently disabling the rest).
            let mut errors = Vec::new();
            for (name, handler) in [
                (
                    "hotkey_selection_translate",
                    selection_translate as fn(),
                ),
                ("hotkey_input_translate", input_translate as fn()),
                ("hotkey_ocr_recognize", ocr_recognize as fn()),
                ("hotkey_ocr_translate", ocr_translate as fn()),
            ] {
                if let Err(e) = register(app_handle, name, handler, "") {
                    errors.push(e);
                }
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
        _ => {}
    }
    Ok(())
}
