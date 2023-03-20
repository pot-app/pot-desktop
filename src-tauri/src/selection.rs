// 获取选择的文本(Linux)
#[cfg(target_os = "linux")]
#[tauri::command]
pub fn get_selection_text() -> Result<String, String> {
    use std::process::Command;
    match Command::new("xsel").output() {
        Ok(v) => return Ok(String::from_utf8(v.stdout).unwrap()),
        Err(e) => return Err(format!("xsel执行出错{}", e.to_string())),
    };
}

// 获取选择的文本(Windows,MacOS)
#[cfg(any(target_os = "windows", target_os = "macos"))]
#[tauri::command]
pub fn get_selection_text() -> Result<String, String> {
    use cli_clipboard::{ClipboardContext, ClipboardProvider};
    let mut ctx: ClipboardContext = ClipboardProvider::new().unwrap();
    match ctx.get_contents() {
        Ok(v) => return Ok(v),
        Err(e) => return Err(format!("剪切板读取出错{}", e.to_string())),
    }
}

// macos 复制操作
#[cfg(target_os = "macos")]
pub fn copy() {
    use enigo::*;
    let mut enigo = Enigo::new();
    // 先释放按键
    enigo.key_up(Key::Meta);
    enigo.key_up(Key::Alt);
    enigo.key_up(Key::Shift);
    enigo.key_up(Key::Space);
    // 发送CtrlC
    enigo.key_down(Key::Meta);
    enigo.key_click(Key::Layout('c'));
    enigo.key_up(Key::Meta);
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
