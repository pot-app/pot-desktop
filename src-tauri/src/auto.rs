use crate::{config::get_config, APP};
use auto_launch::AutoLaunchBuilder;
use dunce::canonicalize;
use tauri::api::notification::Notification;
use tauri::api::version::compare;
use tauri::{utils::platform::current_exe, Manager};
use toml::Value;

pub fn set_auto_start(enable: bool) {
    let app_exe = current_exe().unwrap();
    let app_exe = canonicalize(app_exe).unwrap();
    let app_name = app_exe.file_stem().and_then(|f| f.to_str()).unwrap();
    let app_path = app_exe.as_os_str().to_str().unwrap().to_string();

    #[cfg(target_os = "windows")]
    let app_path = format!("\"{app_path}\"");

    #[cfg(target_os = "macos")]
    let app_path = (|| -> Option<String> {
        let path = std::path::PathBuf::from(&app_path);
        let path = path.parent().unwrap().parent().unwrap().parent().unwrap();
        let extension = path.extension().unwrap().to_str().unwrap();
        match extension == "app" {
            true => Some(path.as_os_str().to_str().unwrap().to_string()),
            false => None,
        }
    })()
    .unwrap_or(app_path);

    #[cfg(target_os = "linux")]
    let app_path = {
        use crate::APP;
        use tauri::Manager;

        let handle = APP.get().unwrap().app_handle();
        let appimage = handle.env().appimage;
        appimage
            .and_then(|p| p.to_str().map(|s| s.to_string()))
            .unwrap_or(app_path)
    };

    let auto = AutoLaunchBuilder::new()
        .set_app_name(app_name)
        .set_app_path(&app_path)
        .build()
        .unwrap();

    if enable {
        auto.disable().unwrap_or_default();
        auto.enable().unwrap();
    } else if !enable {
        auto.disable().unwrap_or_default();
    }
}

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
