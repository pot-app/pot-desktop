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

// 获取选择的文本(Windows)
#[cfg(target_os = "windows")]
#[tauri::command]
pub fn get_selection_text() -> Result<String, String> {
    Ok("ToDo".to_string())
}

// 获取选择的文本(MacOS)
#[cfg(target_os = "macos")]
#[tauri::command]
pub fn get_selection_text() -> Result<String, String> {
    Ok("ToDo".to_string())
}
