#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod config;

use config::*;
use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // 初始化设置
            let is_first = init_config();

            // 根据label获取窗口实例
            let config = app.get_window("config").unwrap();
            let translator = app.get_window("translator").unwrap();

            if is_first {
                // 设置页面默认居中
                config.center().unwrap();
            } else {
                // 不是首次打开默认关闭窗口
                config.close().unwrap();
            }

            //翻译窗口默认关闭
            translator.close().unwrap();
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![write_config])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
