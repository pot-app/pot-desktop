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

#[tauri::command]
pub fn is_wayland() -> bool {
    use std::env::var;
    if let Ok(session_type) = var("XDG_SESSION_TYPE") {
        if session_type == "wayland" {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}
