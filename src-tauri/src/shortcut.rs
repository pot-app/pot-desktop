use crate::APP;
use tauri::{Manager, PhysicalPosition};

pub fn translate() {
    match APP.get() {
        Some(handle) => match handle.get_window("translator") {
            Some(window) => {
                window.close().unwrap();
            }
            None => {
                let window = tauri::WindowBuilder::new(
                    handle,
                    "translator",
                    tauri::WindowUrl::App("index_translator.html".into()),
                )
                .inner_size(400.0, 200.0)
                .min_inner_size(400.0, 200.0)
                .title("Translator")
                .build()
                .unwrap();
                window.set_always_on_top(true).unwrap();
                window
                    .set_position(PhysicalPosition::new(100, 100))
                    .unwrap();
            }
        },
        None => {
            panic!()
        }
    };
}
pub fn open_translate() {
    match APP.get() {
        Some(handle) => match handle.get_window("translator") {
            Some(window) => {
                window.close().unwrap();
            }
            None => {
                let window = tauri::WindowBuilder::new(
                    handle,
                    "translator",
                    tauri::WindowUrl::App("index_translator.html".into()),
                )
                .inner_size(400.0, 200.0)
                .min_inner_size(400.0, 200.0)
                .title("Translator")
                .build()
                .unwrap();
                window.set_always_on_top(true).unwrap();
                window
                    .set_position(PhysicalPosition::new(100, 100))
                    .unwrap();
            }
        },
        None => {
            panic!()
        }
    };
}
