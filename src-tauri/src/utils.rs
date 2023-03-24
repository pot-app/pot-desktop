use std::time::Duration;

use crate::{config::get_config, APP};
use tauri::api::notification::Notification;
use tauri::api::version::compare;
use tauri::Manager;
use toml::Value;

pub fn check_update() -> Result<(), String> {
    let enable = get_config(
        "auto_check",
        Value::Boolean(true),
        APP.get().unwrap().state(),
    );
    if enable.as_bool().unwrap() {
        let client = reqwest::blocking::ClientBuilder::default().build().unwrap();
        let res = match client
            .get("https://api.github.com/repos/Pylogmon/pot/releases/latest")
            .header("User-Agent", "reqwest")
            .timeout(Duration::from_secs(2))
            .send()
        {
            Ok(v) => v,
            Err(e) => return Err(e.to_string()),
        };
        if res.status().is_success() {
            let res = res.json::<serde_json::Value>().unwrap();
            let tag = res.get("tag_name").unwrap().as_str().unwrap();
            let handle = APP.get().unwrap();
            let version = match handle.config().package.version.clone() {
                Some(v) => v,
                None => "0.0.0".to_string(),
            };
            if compare(version.as_str(), tag).unwrap() == 1 {
                Notification::new(&handle.config().tauri.bundle.identifier)
                    .title("新版本可用")
                    .body(tag)
                    .icon("pot")
                    .show()
                    .unwrap();
            }
        } else {
            return Err(res.status().to_string());
        }
    }
    Ok(())
}

#[tauri::command]
pub fn is_macos() -> bool {
    let os = std::env::consts::OS;
    match os {
        "macos" => true,
        _ => false,
    }
}
