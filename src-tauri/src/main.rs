#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // 根据label获取窗口实例
            let config = app.get_window("config").unwrap();
            let translator = app.get_window("translator").unwrap();
            //设置页面默认居中
            config.center().unwrap();
            //翻译窗口默认关闭
            translator.close().unwrap();
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
