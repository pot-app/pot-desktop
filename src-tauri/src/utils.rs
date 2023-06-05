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
        session_type == "wayland"
    } else {
        false
    }
}

use crate::StringWrapper;
#[tauri::command]
pub fn get_translate_text(state: tauri::State<StringWrapper>) -> String {
    return state.0.lock().unwrap().to_string();
}

#[tauri::command]
pub fn screenshot(x: i32, y: i32) {
    use crate::APP;
    use dirs::cache_dir;
    use screenshots::Screen;
    use std::fs;
    let screens = Screen::all().unwrap();
    for screen in screens {
        let info = screen.display_info;
        if info.x == x && info.y == y {
            let handle = APP.get().unwrap();
            let mut app_cache_dir_path = cache_dir().expect("Get Cache Dir Failed");
            app_cache_dir_path.push(&handle.config().tauri.bundle.identifier);
            app_cache_dir_path.push("pot_screenshot.png");

            let image = screen.capture().unwrap();
            let buffer = image.to_png().unwrap();
            fs::write(app_cache_dir_path, buffer).unwrap();
            break;
        }
    }
}

#[tauri::command]
pub fn print(msg: String) {
    println!("{}", msg);
}
