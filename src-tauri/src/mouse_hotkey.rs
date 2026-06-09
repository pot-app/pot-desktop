#[cfg(target_os = "windows")]
mod platform {
    use crate::window::{input_translate, ocr_recognize, ocr_translate, selection_translate};
    use log::{info, warn};
    use once_cell::sync::Lazy;
    use std::collections::HashMap;
    use std::sync::Mutex;
    use std::thread;
    use windows::Win32::Foundation::{HINSTANCE, LPARAM, LRESULT, WPARAM};
    use windows::Win32::UI::WindowsAndMessaging::{
        CallNextHookEx, GetMessageW, PostThreadMessageW, SetWindowsHookExW, HHOOK, MSG,
        MSLLHOOKSTRUCT, WH_MOUSE_LL, WM_QUIT, WM_XBUTTONDBLCLK, WM_XBUTTONDOWN, WM_XBUTTONUP,
        XBUTTON1, XBUTTON2,
    };

    static BINDINGS: Lazy<Mutex<HashMap<String, String>>> =
        Lazy::new(|| Mutex::new(HashMap::new()));
    static LISTENER_STARTED: Lazy<Mutex<bool>> = Lazy::new(|| Mutex::new(false));
    static LISTENER_THREAD_ID: Lazy<Mutex<Option<u32>>> = Lazy::new(|| Mutex::new(None));

    fn mouse_button(mouse_data: u32) -> Option<&'static str> {
        match (mouse_data >> 16) as u16 {
            XBUTTON1 => Some("Mouse4"),
            XBUTTON2 => Some("Mouse5"),
            _ => None,
        }
    }

    fn trigger(name: String) {
        thread::spawn(move || match name.as_str() {
            "hotkey_selection_translate" => selection_translate(),
            "hotkey_input_translate" => input_translate(),
            "hotkey_ocr_recognize" => ocr_recognize(),
            "hotkey_ocr_translate" => ocr_translate(),
            _ => {}
        });
    }

    unsafe extern "system" fn mouse_hook(code: i32, w_param: WPARAM, l_param: LPARAM) -> LRESULT {
        if code >= 0 {
            let message = w_param.0 as u32;
            if matches!(message, WM_XBUTTONDOWN | WM_XBUTTONUP | WM_XBUTTONDBLCLK) {
                let hook_data = &*(l_param.0 as *const MSLLHOOKSTRUCT);
                if let Some(shortcut) = mouse_button(hook_data.mouseData) {
                    let binding = BINDINGS.lock().unwrap().get(shortcut).cloned();
                    if binding.is_some() {
                        if matches!(message, WM_XBUTTONDOWN | WM_XBUTTONDBLCLK) {
                            trigger(binding.unwrap());
                        }
                        return LRESULT(1);
                    }
                }
            }
        }
        CallNextHookEx(HHOOK::default(), code, w_param, l_param)
    }

    fn ensure_listener() -> Result<(), String> {
        let mut started = LISTENER_STARTED.lock().unwrap();
        if *started {
            return Ok(());
        }

        let (sender, receiver) = std::sync::mpsc::channel();
        thread::spawn(move || unsafe {
            *LISTENER_THREAD_ID.lock().unwrap() =
                Some(windows::Win32::System::Threading::GetCurrentThreadId());
            match SetWindowsHookExW(WH_MOUSE_LL, Some(mouse_hook), HINSTANCE::default(), 0) {
                Ok(hook) => {
                    let _ = sender.send(Ok(()));
                    info!("Started global mouse hotkey listener");
                    let mut message = MSG::default();
                    while GetMessageW(&mut message, None, 0, 0).as_bool() {}
                    if let Err(error) =
                        windows::Win32::UI::WindowsAndMessaging::UnhookWindowsHookEx(hook)
                    {
                        warn!(
                            "Failed to release global mouse hotkey listener: {:?}",
                            error
                        );
                    }
                }
                Err(error) => {
                    *LISTENER_THREAD_ID.lock().unwrap() = None;
                    let _ = sender.send(Err(error.to_string()));
                }
            }
        });

        receiver.recv().map_err(|error| error.to_string())??;
        *started = true;
        Ok(())
    }

    pub fn register(name: &str, shortcut: &str) -> Result<(), String> {
        if is_registered(shortcut) {
            return Err("The hotkey is already registered".to_string());
        }
        ensure_listener()?;
        BINDINGS
            .lock()
            .unwrap()
            .insert(shortcut.to_string(), name.to_string());
        info!(
            "Registered global mouse shortcut: {} for {}",
            shortcut, name
        );
        Ok(())
    }

    pub fn unregister(shortcut: &str) {
        BINDINGS.lock().unwrap().remove(shortcut);
    }

    pub fn is_registered(shortcut: &str) -> bool {
        BINDINGS.lock().unwrap().contains_key(shortcut)
    }

    pub fn shutdown() {
        if let Some(thread_id) = *LISTENER_THREAD_ID.lock().unwrap() {
            unsafe {
                let _ =
                    PostThreadMessageW(thread_id, WM_QUIT, WPARAM::default(), LPARAM::default());
            }
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        #[test]
        fn installs_listener_and_manages_mouse_binding() {
            assert_eq!(mouse_button((XBUTTON1 as u32) << 16), Some("Mouse4"));
            assert_eq!(mouse_button((XBUTTON2 as u32) << 16), Some("Mouse5"));

            register("hotkey_selection_translate", "Mouse4").unwrap();
            assert!(is_registered("Mouse4"));
            assert!(register("hotkey_input_translate", "Mouse4").is_err());

            unregister("Mouse4");
            assert!(!is_registered("Mouse4"));
            shutdown();
        }
    }
}

pub fn is_mouse_shortcut(shortcut: &str) -> bool {
    matches!(shortcut, "Mouse4" | "Mouse5")
}

#[cfg(target_os = "windows")]
pub use platform::{is_registered, register, shutdown, unregister};

#[cfg(not(target_os = "windows"))]
pub fn register(_name: &str, _shortcut: &str) -> Result<(), String> {
    Err("Mouse shortcuts are only supported on Windows".to_string())
}

#[cfg(not(target_os = "windows"))]
pub fn unregister(_shortcut: &str) {}

#[cfg(not(target_os = "windows"))]
pub fn is_registered(_shortcut: &str) -> bool {
    false
}

#[cfg(not(target_os = "windows"))]
pub fn shutdown() {}
