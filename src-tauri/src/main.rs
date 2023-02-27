#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod config;
mod shortcut;
mod trayicon;

use config::*;
use shortcut::*;
use tauri::GlobalShortcutManager;
use tauri::Manager;
use tauri::SystemTrayEvent;
use trayicon::*;

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
            // 翻译窗口默认关闭
            translator.close().unwrap();

            // 注册全局快捷键
            unsafe {
                match &CONFIG {
                    Some(c) => {
                        app.global_shortcut_manager()
                            .register(c.shortcut_translate.as_str(), translate)
                            .unwrap();
                        app.global_shortcut_manager()
                            .register(c.shortcut_open_translate.as_str(), open_translate)
                            .unwrap();
                    }
                    None => {
                        panic!()
                    }
                }
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![write_config])
        //加载托盘图标
        .system_tray(build_system_tray())
        //绑定托盘事件
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                CONFIG_TRAY_ITEM => on_config_click(app),
                QUIT_TRAY_ITEM => on_quit_click(),
                _ => {}
            },
            _ => {}
        })
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|_app_handle, event| match event {
            tauri::RunEvent::ExitRequested { api, .. } => {
                api.prevent_exit();
            }
            _ => {}
        });
}
