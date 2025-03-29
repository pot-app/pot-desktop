use crate::{error::Error, APP};
use dirs::config_dir;
use log::{info, warn};
use serde_json::{json, Value};
use std::sync::Mutex;
use tauri::{Manager, Wry};
use tauri_plugin_store::{Store, StoreBuilder};

pub struct StoreWrapper(pub Mutex<Store<Wry>>);

pub fn init_config(app: &mut tauri::App) {
    let config_path = config_dir().unwrap();
    let config_path = config_path.join(app.config().tauri.bundle.identifier.clone());
    let config_path = config_path.join("config.json");
    info!("Load config from: {:?}", config_path);
    let mut store = StoreBuilder::new(app.handle(), config_path).build();

    match store.load() {
        Ok(_) => info!("Config loaded"),
        Err(e) => {
            warn!("Config load error: {:?}", e);
            info!("Config not found, creating new config");
        }
    }
    app.manage(StoreWrapper(Mutex::new(store)));
    let _ = check_service_available();
}

fn check_available(list: Vec<String>, builtin: &[&str], plugin: &[String], key: &str) {
    let origin_length = list.len();
    let new_list: Vec<_> = list
        .into_iter()
        .filter(|e| {
            let name = e.split("@").next();
            if name.is_none() {
                return true;
            }
            let name = name.expect("checked by `name.is_none()` before");
            return if name.starts_with("plugin") {
                plugin.iter().any(|e| e == name)
            } else {
                builtin.iter().any(|&e| e == name)
            };
        })
        .collect();
    if new_list.len() != origin_length {
        set(key, new_list);
    }
}

pub fn check_service_available() -> Result<(), Error> {
    const BUILTIN_RECOGNIZE_LIST: [&str; 15] = [
        "baidu_ocr",
        "baidu_accurate_ocr",
        "baidu_img_ocr",
        "iflytek_ocr",
        "iflytek_intsig_ocr",
        "iflytek_latex_ocr",
        "qrcode",
        "simple_latex_ocr",
        "system",
        "tencent_ocr",
        "tencent_accurate_ocr",
        "tencent_img_ocr",
        "tesseract",
        "volcengine_ocr",
        "volcengine_multi_lang_ocr",
    ];
    const BUILTIN_TRANSLATE_LIST: [&str; 21] = [
        "alibaba",
        "baidu",
        "baidu_field",
        "bing",
        "bing_dict",
        "caiyun",
        "cambridge_dict",
        "chatglm",
        "deepl",
        "ecdict",
        "lingva",
        "geminipro",
        "niutrans",
        "ollama",
        "openai",
        "google",
        "tencent",
        "transmart",
        "volcengine",
        "yandex",
        "youdao",
    ];
    const BUILTIN_TTS_LIST: [&str; 2] = ["lingva_tts", "edge_tts"];
    const BUILTIN_COLLECTION_LIST: [&str; 2] = ["anki", "eudic"];

    let plugin_recognize_list: Vec<String> = get_plugin_list("recognize").unwrap_or_default();
    let plugin_translate_list: Vec<String> = get_plugin_list("translate").unwrap_or_default();
    let plugin_tts_list: Vec<String> = get_plugin_list("tts").unwrap_or_default();
    let plugin_collection_list: Vec<String> = get_plugin_list("collection").unwrap_or_default();
    if let Some(recognize_service_list) = get("recognize_service_list") {
        let recognize_service_list: Vec<String> = serde_json::from_value(recognize_service_list)?;
        check_available(
            recognize_service_list,
            &BUILTIN_RECOGNIZE_LIST,
            &plugin_recognize_list,
            "recognize_service_list",
        );
    }
    if let Some(translate_service_list) = get("translate_service_list") {
        let translate_service_list: Vec<String> = serde_json::from_value(translate_service_list)?;
        check_available(
            translate_service_list,
            &BUILTIN_TRANSLATE_LIST,
            &plugin_translate_list,
            "translate_service_list",
        );
    }
    if let Some(tts_service_list) = get("tts_service_list") {
        let tts_service_list: Vec<String> = serde_json::from_value(tts_service_list)?;
        info!("tts_service_list: {:?}", tts_service_list);
        check_available(
            tts_service_list,
            &BUILTIN_TTS_LIST,
            &plugin_tts_list,
            "tts_service_list",
        );
    }
    if let Some(collection_service_list) = get("collection_service_list") {
        let collection_service_list: Vec<String> = serde_json::from_value(collection_service_list)?;
        check_available(
            collection_service_list,
            &BUILTIN_COLLECTION_LIST,
            &plugin_collection_list,
            "collection_service_list",
        );
    }
    Ok(())
}

pub fn get_plugin_list(plugin_type: &str) -> Option<Vec<String>> {
    let app_handle = APP.get().expect("get global app handle never failed");
    let config_dir = dirs::config_dir()?;
    let config_dir = config_dir.join(app_handle.config().tauri.bundle.identifier.clone());
    let plugin_dir = config_dir.join("plugins");
    let plugin_dir = plugin_dir.join(plugin_type);

    // dirs in plugin_dir
    let mut plugin_list = vec![];
    if plugin_dir.exists() {
        let read_dir = std::fs::read_dir(plugin_dir).ok()?;
        for entry in read_dir {
            let entry = entry.ok()?;

            if entry.path().is_dir() {
                let name = entry.file_name().to_str()?.to_string();
                if name.starts_with("plugin") {
                    plugin_list.push(name);
                } else {
                    // Remove old plugin
                    let _ = std::fs::remove_dir_all(entry.path());
                }
            }
        }
    }
    Some(plugin_list)
}

pub fn get(key: &str) -> Option<Value> {
    let state = APP
        .get()
        .expect("APP get nerver failed")
        .state::<StoreWrapper>();
    let store = state.0.lock().expect("Store lock never failed");
    store.get(key).cloned()
}

pub fn set<T: serde::ser::Serialize>(key: &str, value: T) {
    let state = APP
        .get()
        .expect("App get nerver failed")
        .state::<StoreWrapper>();
    let mut store = state.0.lock().expect("Store lock never failed");
    store
        .insert(key.to_string(), json!(value))
        .expect("Store Insert never failed");
    store.save().expect("Store save never failed");
}

pub fn is_first_run() -> bool {
    let state = APP.get().unwrap().state::<StoreWrapper>();
    let store = state.0.lock().unwrap();
    store.is_empty()
}
