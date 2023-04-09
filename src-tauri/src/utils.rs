use crate::{config::get_config, APP};
use std::time::Duration;
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
        let client = reqwest::blocking::ClientBuilder::default()
            .build()
            .unwrap_or_default();
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
            let res = res.json::<serde_json::Value>().unwrap_or_default();
            if !res.as_object().unwrap().contains_key("tag_name") {
                return Err("Check Update Failed".to_string());
            }
            let tag = res["tag_name"].as_str().unwrap_or_default();
            let body = res["body"]
                .as_str()
                .unwrap_or_default()
                .replace("#", "")
                .replace("\n\n", "\n");
            let handle = APP.get().unwrap();
            let version = handle
                .config()
                .package
                .version
                .clone()
                .unwrap_or_else(|| "0.0.0".to_string());
            if compare(version.as_str(), tag).unwrap_or_default() == 1 {
                Notification::new(&handle.config().tauri.bundle.identifier)
                    .title(format!("新版本可用 {tag}"))
                    .body(body)
                    .icon("pot")
                    .show()
                    .unwrap_or_else(|e| println!("Error creating notification: {e}"));
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
    matches!(os, "macos")
}
