use auto_launch::AutoLaunchBuilder;
use dunce::canonicalize;
use tauri::utils::platform::current_exe;
pub fn set_auto_start(enable: bool) {
    let app_exe = current_exe().unwrap();
    let app_exe = canonicalize(app_exe).unwrap();
    println!("{:?}", app_exe);
    let app_name = app_exe.file_stem().and_then(|f| f.to_str()).unwrap();
    println!("{}", app_name);
    let app_path = app_exe.as_os_str().to_str().unwrap().to_string();
    println!("{}", app_path);

    #[cfg(target_os = "windows")]
    let app_path = format!("\"{app_path}\"");
    println!("{}", app_path);
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
