use crate::StringWrapper;

// 获取选择的文本(Linux)
#[cfg(target_os = "linux")]
pub fn get_selection_text() -> Result<String, String> {
    match std::process::Command::new("xsel").output() {
        Ok(v) => return Ok(String::from_utf8(v.stdout).unwrap()),
        Err(e) => return Err(format!("xsel执行出错{}", e.to_string())),
    };
}

// 获取选择的文本(Windows)
#[cfg(any(target_os = "windows", target_os = "macos"))]
pub fn get_selection_text() -> Result<String, String> {
    use arboard::Clipboard;
    // 读取旧内容
    let mut old_clipboard1 = Clipboard::new().unwrap();
    let mut old_clipboard2 = Clipboard::new().unwrap();
    let old_text = old_clipboard1.get_text();
    let old_image = old_clipboard2.get_image();
    copy();
    // 读取新内容
    let mut new_clipboard = Clipboard::new().unwrap();
    let new_data = new_clipboard.get_text();
    // 回写旧内容
    let mut write_clipboard = Clipboard::new().unwrap();
    let old = match old_text {
        Ok(text) => {
            write_clipboard.set_text(text.clone()).unwrap();
            text
        }
        _ => {
            match old_image {
                Ok(image) => write_clipboard.set_image(image).unwrap(),
                _ => {}
            };
            "".to_string()
        }
    };

    // 获取所需内容
    match new_data {
        Ok(new) => {
            if new.trim() == old.trim() {
                Ok("".to_string())
            } else {
                Ok(new)
            }
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
    enigo.key_up(Key::Command);
    enigo.key_up(Key::Option);
    enigo.key_up(Key::Alt);
    enigo.key_up(Key::Shift);
    enigo.key_up(Key::Space);
    // 发送CtrlC
    enigo.key_down(Key::Command);
    enigo.key_click(Key::Layout('c'));
    enigo.key_up(Key::Command);
    std::thread::sleep(std::time::Duration::from_millis(200));
}

#[tauri::command]
pub fn get_translate_text(state: tauri::State<StringWrapper>) -> String {
    return state.0.lock().unwrap().to_string();
}
