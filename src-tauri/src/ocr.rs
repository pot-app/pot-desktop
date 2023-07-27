use dirs::cache_dir;

#[tauri::command(async)]
#[cfg(target_os = "windows")]
pub fn system_ocr(app_handle: tauri::AppHandle) -> Result<String, String> {
    use win_ocr::ocr;
    let mut app_cache_dir_path = cache_dir().expect("Get Cache Dir Failed");
    app_cache_dir_path.push(&app_handle.config().tauri.bundle.identifier);
    app_cache_dir_path.push("pot_screenshot_cut.png");

    match ocr(app_cache_dir_path.to_str().unwrap()) {
        Ok(v) => return Ok(v),
        Err(e) => return Err(e.to_string()),
    }
}

#[tauri::command]
#[cfg(target_os = "macos")]
pub fn system_ocr(app_handle: tauri::AppHandle) -> Result<String, String> {
    let mut app_cache_dir_path = cache_dir().expect("Get Cache Dir Failed");
    app_cache_dir_path.push(&app_handle.config().tauri.bundle.identifier);
    app_cache_dir_path.push("pot_screenshot_cut.png");
    Ok(app_cache_dir_path.to_str().unwrap().to_string())
}

#[tauri::command(async)]
#[cfg(target_os = "linux")]
pub fn system_ocr(app_handle: tauri::AppHandle, lang: &str) -> Result<String, String> {
    let mut app_cache_dir_path = cache_dir().expect("Get Cache Dir Failed");
    app_cache_dir_path.push(&app_handle.config().tauri.bundle.identifier);
    app_cache_dir_path.push("pot_screenshot_cut.png");
    let output = match std::process::Command::new("tesseract")
        .arg(app_cache_dir_path.to_str().unwrap())
        .arg("stdout")
        .arg("-l")
        .arg(lang)
        .output()
    {
        Ok(v) => v,
        Err(e) => return Err(e.to_string()),
    };

    match String::from_utf8(output.stdout) {
        Ok(v) => Ok(v),
        Err(e) => Err(e.to_string()),
    }
}
