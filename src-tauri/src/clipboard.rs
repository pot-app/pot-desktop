use crate::window::text_translate;
use crate::window::slide_translate;
use std::sync::Mutex;
use tauri::{ClipboardManager, Manager};

pub struct ClipboardMonitorEnableWrapper(pub Mutex<String>);
pub struct SlideTranslateEnableWrapper(pub Mutex<String>);

use rdev::{listen, Event, EventType, Button};
use std::sync::Arc;

pub fn start_slide_translate(app_handle: tauri::AppHandle) {
    let mouse_down_pos = Arc::new(Mutex::new(None::<(f64, f64)>));
    let mouse_up_pos = Arc::new(Mutex::new(None::<(f64, f64)>));
    let last_mouse_pos = Arc::new(Mutex::new((0.0, 0.0)));

    std::thread::spawn({
        let mouse_down_pos = mouse_down_pos.clone();
        let mouse_up_pos = mouse_up_pos.clone();
        let last_mouse_pos = last_mouse_pos.clone();

        move || {
            if let Err(error) = listen(move |event: Event| {
                // Check if stroke translation is enabled
                let state = app_handle.state::<SlideTranslateEnableWrapper>();
                if let Ok(slide_enable) = state.0.lock() {
                    if slide_enable.contains("false") {
                        return;
                    }
                }
                match event.event_type {
                    EventType::MouseMove { x, y } => {
                        // Record the current coordinates of the mouse
                        let mut pos = last_mouse_pos.lock().unwrap();
                        *pos = (x, y);
                    }
                    EventType::ButtonPress(Button::Left) => {
                        let pos = last_mouse_pos.lock().unwrap();
                        *mouse_down_pos.lock().unwrap() = Some(*pos);
                    }
                    EventType::ButtonRelease(Button::Left) => {
                        let pos = last_mouse_pos.lock().unwrap();
                        *mouse_up_pos.lock().unwrap() = Some(*pos);

                        let down = mouse_down_pos.lock().unwrap();
                        let up = mouse_up_pos.lock().unwrap();

                        if let (Some((dx, dy)), Some((ux, uy))) = (*down, *up) {
                            if (dx - ux).abs() > 1.0 || (dy - uy).abs() > 1.0 {
                                std::thread::spawn(move || {
                                    use selection::get_text;
                                    // Get Selected Text
                                    let selected = get_text();
                                    if !selected.trim().is_empty() {
                                        slide_translate(selected);
                                    }
                                });
                            } 
                            // else click no drag, ignore.
                        }
                    }
                    _ => {}
                }
            }) {
                eprintln!("Error: {:?}", error);
            }
        }
    });
}
pub fn start_clipboard_monitor(app_handle: tauri::AppHandle) {
    tauri::async_runtime::spawn(async move {
        let mut pre_text = "".to_string();
        loop {
            let handle = app_handle.app_handle();
            let state = handle.state::<ClipboardMonitorEnableWrapper>();
            if let Ok(clipboard_monitor) = state.0.try_lock() {
                if clipboard_monitor.contains("true") {
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
                } else {
                    break;
                }
            }
            std::thread::sleep(std::time::Duration::from_millis(500));
        }
    });
}
