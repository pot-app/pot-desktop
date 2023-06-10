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
            if !app_cache_dir_path.exists() {
                // 创建目录
                fs::create_dir_all(&app_cache_dir_path).expect("Create Cache Dir Failed");
            }
            app_cache_dir_path.push("pot_screenshot.png");

            let image = screen.capture().unwrap();
            let buffer = image.to_png().unwrap();
            fs::write(app_cache_dir_path, buffer).unwrap();
            break;
        }
    }
}

#[tauri::command]
pub fn cut_screenshot(left: u32, top: u32, right: u32, bottom: u32, app_handle: tauri::AppHandle) {
    use dirs::cache_dir;
    use image::GenericImage;
    let mut app_cache_dir_path = cache_dir().expect("Get Cache Dir Failed");
    app_cache_dir_path.push(&app_handle.config().tauri.bundle.identifier);
    app_cache_dir_path.push("pot_screenshot.png");

    let mut img = image::open(&app_cache_dir_path).unwrap();
    let img2 = img.sub_image(left, top, right - left, bottom - top);
    app_cache_dir_path.pop();
    app_cache_dir_path.push("pot_screenshot_cut.png");
    match img2.to_image().save(&app_cache_dir_path) {
        Ok(_) => {}
        Err(e) => {
            println!("{}", e.to_string());
        }
    }
}

#[tauri::command]
pub fn print(msg: String) {
    println!("{}", msg);
}

#[tauri::command]
pub fn get_base64(app_handle: tauri::AppHandle) -> String {
    use base64::{engine::general_purpose, Engine as _};
    use dirs::cache_dir;
    use std::fs::File;
    use std::io::Read;
    let mut app_cache_dir_path = cache_dir().expect("Get Cache Dir Failed");
    app_cache_dir_path.push(&app_handle.config().tauri.bundle.identifier);
    app_cache_dir_path.push("pot_screenshot_cut.png");
    let mut file = File::open(app_cache_dir_path).unwrap();
    let mut vec = Vec::new();
    file.read_to_end(&mut vec).unwrap();
    let base64 = general_purpose::STANDARD.encode(&vec);
    base64.replace("\r\n", "")
}
