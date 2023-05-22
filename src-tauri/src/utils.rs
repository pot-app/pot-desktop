#[tauri::command]
pub fn is_macos() -> bool {
    let os = std::env::consts::OS;
    matches!(os, "macos")
}

#[tauri::command]
pub fn is_linux() -> bool {
    let os = std::env::consts::OS;
    matches!(os, "linux")
}