use crate::config::get;
use crate::config::StoreWrapper;
use crate::StringWrapper;
use crate::APP;
use log::info;
use tauri::Manager;

#[tauri::command]
pub fn get_text(state: tauri::State<StringWrapper>) -> String {
    return state.0.lock().unwrap().to_string();
}

#[tauri::command]
pub fn reload_store() {
    let state = APP.get().unwrap().state::<StoreWrapper>();
    let mut store = state.0.lock().unwrap();
    store.load().unwrap();
}

#[tauri::command]
pub fn cut_image(left: u32, top: u32, right: u32, bottom: u32, app_handle: tauri::AppHandle) {
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
            println!("{:?}", e.to_string());
        }
    }
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

#[tauri::command]
pub fn copy_img(app_handle: tauri::AppHandle, width: usize, height: usize) {
    use arboard::{Clipboard, ImageData};
    use dirs::cache_dir;
    use image::io::Reader as ImageReader;
    use std::borrow::Cow;

    let mut app_cache_dir_path = cache_dir().expect("Get Cache Dir Failed");
    app_cache_dir_path.push(&app_handle.config().tauri.bundle.identifier);
    app_cache_dir_path.push("pot_screenshot_cut.png");
    let data = ImageReader::open(app_cache_dir_path)
        .unwrap()
        .decode()
        .unwrap();

    let img = ImageData {
        width,
        height,
        bytes: Cow::from(data.as_bytes()),
    };
    Clipboard::new().unwrap().set_image(img).unwrap();
}

#[tauri::command(async)]
pub fn invoke_translate_plugin(
    app_handle: tauri::AppHandle,
    name: &str,
    text: &str,
    from: &str,
    to: &str,
    needs: &str,
) -> Result<String, String> {
    use dirs::config_dir;
    use libloading;
    use std::env::consts::OS;
    let proxy = match get("proxy") {
        Some(v) => v.as_str().unwrap().to_string(),
        None => "".to_string(),
    };
    let ext_name = match OS {
        "linux" => ".so",
        "macos" => ".dylib",
        "windows" => ".dll",
        _ => {
            panic!("Unknown OS")
        }
    };
    let config_path = config_dir().unwrap();
    let config_path = config_path.join(app_handle.config().tauri.bundle.identifier.clone());
    let config_path = config_path.join("plugins");
    let config_path = config_path.join("translate");
    let config_path = config_path.join(name);
    let plugin_path = config_path.join(format!("{name}{ext_name}"));
    info!("Load plugin from: {:?}", plugin_path);
    unsafe {
        let lib = libloading::Library::new(plugin_path).unwrap();
        let func: libloading::Symbol<fn(&str, &str, &str, &str, &str) -> Result<String, String>> =
            lib.get(b"translate").unwrap();
        return func(text, from, to, needs, &proxy);
    };
}
