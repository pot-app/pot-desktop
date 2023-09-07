use crate::config::{get, set};
use crate::window::text_translate;
use tauri::ClipboardManager;

pub fn start_clipboard_monitor(app_handle: tauri::AppHandle) {
    tauri::async_runtime::spawn(async move {
        let mut pre_text = "".to_string();
        loop {
            let clipboard_monitor = match get("clipboard_monitor") {
                Some(v) => v.as_bool().unwrap(),
                None => {
                    set("clipboard_monitor", false);
                    false
                }
            };
            if clipboard_monitor {
                if let Ok(result) = app_handle.clipboard_manager().read_text() {
                    match result {
                        Some(v) => {
                            if v != pre_text {
                                text_translate(v.clone());
                                pre_text = v;
                            }
                        }
                        None => {}
                    }
                }
            }

            std::thread::sleep(std::time::Duration::from_millis(500));
        }
    });
}
