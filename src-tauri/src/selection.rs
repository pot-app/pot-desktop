use crate::StringWrapper;

// 获取选择的文本(Linux)
#[cfg(target_os = "linux")]
pub fn get_selection_text() -> Result<String, String> {
    // use std::env::var;
    // if let Ok(session_type) = var("XDG_SESSION_TYPE") {
    //     match session_type.as_str() {
    //         "x11" => {
    use std::time::Duration;
    use x11_clipboard::Clipboard;

    if let Ok(clipboard) = Clipboard::new() {
        if let Ok(v) = clipboard.load(
            clipboard.getter.atoms.primary,
            clipboard.getter.atoms.utf8_string,
            clipboard.getter.atoms.property,
            Duration::from_millis(100),
        ) {
            let v = String::from_utf8_lossy(&v)
                .trim_matches('\u{0}')
                .trim()
                .to_string();
            clipboard
                .store(
                    clipboard.getter.atoms.primary,
                    clipboard.getter.atoms.utf8_string,
                    "",
                )
                .unwrap();
            return Ok(v);
        } else {
            return Err("Clipboard Read Failed".to_string());
        }
    } else {
        return Err("Clipboard Create Failed".to_string());
    }
    //         }
    //         "wayland" => {
    //             use std::io::Read;
    //             use wl_clipboard_rs::paste::{get_contents, ClipboardType, Error, MimeType, Seat};

    //             let result =
    //                 get_contents(ClipboardType::Primary, Seat::Unspecified, MimeType::Text);

    //             match result {
    //                 Ok((mut pipe, _)) => {
    //                     let mut contents = vec![];
    //                     pipe.read_to_end(&mut contents).unwrap();
    //                     let contents = String::from_utf8_lossy(&contents)
    //                         .trim_matches('\u{0}')
    //                         .trim()
    //                         .to_string();
    //                     return Ok(contents);
    //                 }

    //                 Err(Error::NoSeats) | Err(Error::ClipboardEmpty) | Err(Error::NoMimeType) => {
    //                     return Ok("".to_string());
    //                 }

    //                 Err(err) => return Err(err.to_string()),
    //             }
    //         }
    //         _ => {
    //             return Err(format!("Unknown Session Type: {session_type}").to_string());
    //         }
    //     }
    // } else {
    //     return Err("Get Session Type Failed".to_string());
    // }
}

// 获取选择的文本(Windows)
#[cfg(any(target_os = "windows", target_os = "macos"))]
pub fn get_selection_text() -> Result<String, String> {
    use arboard::Clipboard;

    // Reads old content and stores it in a tuple
    let old_clipboard = (
        Clipboard::new().unwrap().get_text(),
        Clipboard::new().unwrap().get_image(),
    );
    copy();

    // Reads new content
    let new_text = Clipboard::new().unwrap().get_text();

    // Writes old content back to clipboard before returning
    let mut write_clipboard = Clipboard::new().unwrap();
    match old_clipboard {
        (Ok(text), _) => {
            write_clipboard.set_text(text.clone()).unwrap();
            if let Ok(new) = new_text {
                if new.trim() == text.trim() {
                    Ok("".to_string())
                } else {
                    Ok(new)
                }
            } else {
                Ok("".to_string())
            }
        }
        (_, Ok(image)) => {
            write_clipboard.set_image(image).unwrap();
            Ok("".to_string())
        }
        _ => Ok("".to_string()),
    }
}

// windows 复制操作
#[cfg(target_os = "windows")]
pub fn copy() {
    use enigo::*;
    let mut enigo = Enigo::new();
    // 先释放按键
    enigo.key_up(Key::Control);
    enigo.key_up(Key::Alt);
    enigo.key_up(Key::Shift);
    enigo.key_up(Key::Space);
    // 发送CtrlC
    enigo.key_down(Key::Control);
    enigo.key_click(Key::Layout('c'));
    enigo.key_up(Key::Control);
}

// macos 复制操作
#[cfg(target_os = "macos")]
pub fn copy() {
    use enigo::*;
    let mut enigo = Enigo::new();
    std::thread::sleep(std::time::Duration::from_millis(200));
    // 先释放按键
    enigo.key_up(Key::Control);
    enigo.key_up(Key::Meta);
    enigo.key_up(Key::Option);
    enigo.key_up(Key::Alt);
    enigo.key_up(Key::Shift);
    enigo.key_up(Key::Space);
    // 发送CtrlC
    enigo.key_down(Key::Meta);
    enigo.key_click(Key::Layout('c'));
    enigo.key_up(Key::Meta);
    std::thread::sleep(std::time::Duration::from_millis(200));
}

#[tauri::command]
pub fn get_translate_text(state: tauri::State<StringWrapper>) -> String {
    return state.0.lock().unwrap().to_string();
}
