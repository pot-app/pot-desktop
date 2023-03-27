use crate::StringWrapper;

// 获取选择的文本(Linux)
#[cfg(target_os = "linux")]
pub fn get_selection_text() -> Result<String, String> {
    match std::process::Command::new("xsel").output() {
        Ok(v) => Ok(String::from_utf8(v.stdout).unwrap()),
        Err(e) => Err(format!("xsel执行出错{e}")),
    }
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
