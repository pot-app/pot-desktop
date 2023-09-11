use crate::config::get;
use crate::config::StoreWrapper;
use crate::error::Error;
use crate::StringWrapper;
use crate::APP;
use log::{error, info};
use serde_json::Value;
use std::collections::HashMap;
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
pub fn cut_image(left: u32, top: u32, width: u32, height: u32, app_handle: tauri::AppHandle) {
    use dirs::cache_dir;
    use image::GenericImage;
    info!("Cut image: {}x{}+{}+{}", width, height, left, top);
    let mut app_cache_dir_path = cache_dir().expect("Get Cache Dir Failed");
    app_cache_dir_path.push(&app_handle.config().tauri.bundle.identifier);
    app_cache_dir_path.push("pot_screenshot.png");
    if !app_cache_dir_path.exists() {
        return;
    }
    let mut img = image::open(&app_cache_dir_path).unwrap();
    let img2 = img.sub_image(left, top, width, height);
    app_cache_dir_path.pop();
    app_cache_dir_path.push("pot_screenshot_cut.png");
    match img2.to_image().save(&app_cache_dir_path) {
        Ok(_) => {}
        Err(e) => {
            error!("{:?}", e.to_string());
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
    if !app_cache_dir_path.exists() {
        return "".to_string();
    }
    let mut file = File::open(app_cache_dir_path).unwrap();
    let mut vec = Vec::new();
    file.read_to_end(&mut vec).unwrap();
    let base64 = general_purpose::STANDARD.encode(&vec);
    base64.replace("\r\n", "")
}

#[tauri::command]
pub fn copy_img(app_handle: tauri::AppHandle, width: usize, height: usize) -> Result<(), Error> {
    use arboard::{Clipboard, ImageData};
    use dirs::cache_dir;
    use image::io::Reader as ImageReader;
    use std::borrow::Cow;

    let mut app_cache_dir_path = cache_dir().expect("Get Cache Dir Failed");
    app_cache_dir_path.push(&app_handle.config().tauri.bundle.identifier);
    app_cache_dir_path.push("pot_screenshot_cut.png");
    let data = ImageReader::open(app_cache_dir_path)?.decode()?;

    let img = ImageData {
        width,
        height,
        bytes: Cow::from(data.as_bytes()),
    };
    let result = Clipboard::new()?.set_image(img)?;
    Ok(result)
}

#[tauri::command(async)]
pub fn invoke_plugin(
    app_handle: tauri::AppHandle,
    plugin_type: &str,
    name: &str,
    text: Option<&str>,
    base64: Option<&str>,
    from: Option<&str>,
    to: Option<&str>,
    lang: Option<&str>,
    needs: HashMap<String, String>,
) -> Result<Value, String> {
    use dirs::config_dir;
    use libloading;
    use std::env::consts::OS;

    let ext_name = match OS {
        "linux" => ".so",
        "macos" => ".dylib",
        "windows" => ".dll",
        _ => return Err("Unknown OS".to_string()),
    };
    let config_path = config_dir().unwrap();
    let config_path = config_path.join(app_handle.config().tauri.bundle.identifier.clone());
    let config_path = config_path.join("plugins");
    let config_path = config_path.join(plugin_type);
    let config_path = config_path.join(name);
    let plugin_path = config_path.join(format!("plugin{ext_name}"));
    info!("Load plugin from: {:?}", plugin_path);
    unsafe {
        let lib = libloading::Library::new(plugin_path).unwrap();
        match plugin_type {
            "translate" => {
                let func: libloading::Symbol<
                    fn(
                        &str,
                        &str,
                        &str,
                        HashMap<String, String>,
                    ) -> Result<Value, Box<dyn std::error::Error>>,
                > = match lib.get(b"translate") {
                    Ok(v) => v,
                    Err(e) => return Err(e.to_string()),
                };
                match func(text.unwrap(), from.unwrap(), to.unwrap(), needs) {
                    Ok(v) => Ok(v),
                    Err(e) => Err(e.to_string()),
                }
            }
            "tts" => {
                let func: libloading::Symbol<
                    fn(
                        &str,
                        &str,
                        HashMap<String, String>,
                    ) -> Result<Value, Box<dyn std::error::Error>>,
                > = match lib.get(b"tts") {
                    Ok(v) => v,
                    Err(e) => return Err(e.to_string()),
                };
                match func(text.unwrap(), lang.unwrap(), needs) {
                    Ok(v) => Ok(v),
                    Err(e) => Err(e.to_string()),
                }
            }
            "recognize" => {
                let func: libloading::Symbol<
                    fn(
                        &str,
                        &str,
                        HashMap<String, String>,
                    ) -> Result<Value, Box<dyn std::error::Error>>,
                > = match lib.get(b"recognize") {
                    Ok(v) => v,
                    Err(e) => return Err(e.to_string()),
                };
                match func(base64.unwrap(), lang.unwrap(), needs) {
                    Ok(v) => Ok(v),
                    Err(e) => Err(e.to_string()),
                }
            }
            "collection" => {
                let func: libloading::Symbol<
                    fn(
                        &str,
                        &str,
                        HashMap<String, String>,
                    ) -> Result<Value, Box<dyn std::error::Error>>,
                > = match lib.get(b"collection") {
                    Ok(v) => v,
                    Err(e) => return Err(e.to_string()),
                };
                match func(from.unwrap(), to.unwrap(), needs) {
                    Ok(v) => Ok(v),
                    Err(e) => Err(e.to_string()),
                }
            }
            _ => {
                return Err("Unknown Plugin Type".to_string());
            }
        }
    }
}

#[tauri::command]
pub fn set_proxy() -> Result<bool, ()> {
    let host = match get("proxy_host") {
        Some(v) => v.as_str().unwrap().to_string(),
        None => return Err(()),
    };
    let port = match get("proxy_port") {
        Some(v) => v.as_i64().unwrap(),
        None => return Err(()),
    };
    let proxy = format!("http://{}:{}", host, port);

    std::env::set_var("http_proxy", &proxy);
    std::env::set_var("https_proxy", &proxy);
    std::env::set_var("all_proxy", &proxy);
    std::env::set_var("no_proxy", "127.0.0.1,localhost,aliyuncs.com");
    Ok(true)
}

#[tauri::command]
pub fn unset_proxy() -> Result<bool, ()> {
    std::env::remove_var("http_proxy");
    std::env::remove_var("https_proxy");
    std::env::remove_var("all_proxy");
    std::env::remove_var("no_proxy");
    Ok(true)
}

#[tauri::command]
pub fn install_plugin(path_list: Vec<String>, plugin_type: &str) -> Result<i32, Error> {
    let mut success_count = 0;
    use std::env::consts::OS;

    let ext_name = match OS {
        "linux" => ".so",
        "macos" => ".dylib",
        "windows" => ".dll",
        _ => return Err(Error::Error("Unknown OS".into())),
    };
    for path in path_list {
        if !path.ends_with("potext") {
            continue;
        }
        let path = std::path::Path::new(&path);
        let file_name = path.file_name().unwrap().to_str().unwrap();
        let file_name = file_name.replace(".potext", "");
        if !file_name.starts_with("[plugin]") {
            return Err(Error::Error(
                "Invalid Plugin: file name must start with [plugin]".into(),
            ));
        }
        let config_path = dirs::config_dir().unwrap();
        let config_path =
            config_path.join(APP.get().unwrap().config().tauri.bundle.identifier.clone());
        let config_path = config_path.join("plugins");
        let config_path = config_path.join(plugin_type);
        let plugin_path = config_path.join(file_name);
        std::fs::create_dir_all(&config_path)?;
        let mut zip = zip::ZipArchive::new(std::fs::File::open(path)?)?;
        if zip.by_name("info.json").is_err() {
            return Err(Error::Error("Invalid Plugin: miss info.json".into()));
        }
        if zip.by_name(format!("plugin{ext_name}").as_str()).is_err() {
            return Err(Error::Error(
                format!("Invalid Plugin: miss plugin{ext_name}").into(),
            ));
        }
        zip.extract(plugin_path)?;
        success_count += 1;
    }
    Ok(success_count)
}
