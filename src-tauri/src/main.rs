#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod config;
mod selection;
mod shortcut;
mod trayicon;

use config::*;
use once_cell::sync::OnceCell;
use selection::get_selection_text;
use shortcut::register_shortcut;
use tauri::api::notification::Notification;
use tauri::AppHandle;
use tauri::Manager;
use tauri::SystemTrayEvent;
use trayicon::*;

// 全局AppHandle
pub static APP: OnceCell<AppHandle> = OnceCell::new();

#[derive(Clone, serde::Serialize)]
struct Payload {
    args: Vec<String>,
    cwd: String,
}

fn main() {
    tauri::Builder::default()
        // 单例运行
        .plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
            println!("{}, {argv:?}, {cwd}", app.package_info().name);
            Notification::new(&app.config().tauri.bundle.identifier)
                .title("程序已运行")
                .body("程序已经在运行 请勿重复启动！")
                .icon("pot")
                .show()
                .unwrap();
            app.emit_all("single-instance", Payload { args: argv, cwd })
                .unwrap();
        }))
        .setup(|app| {
            // 初始化AppHandel
            APP.get_or_init(|| app.handle());
            let handle = APP.get().unwrap();
            // 初始化设置
            let is_first = init_config();
            // 首次启动打开设置页面
            if is_first {
                on_config_click(handle);
            }
            // 注册全局快捷键
            register_shortcut();
            Ok(())
        })
        // 注册Tauri Command
        .invoke_handler(tauri::generate_handler![
            write_config,
            get_selection_text,
            get_config
        ])
        //加载托盘图标
        .system_tray(build_system_tray())
        //绑定托盘事件
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                PERSISTENT_WINDOW => on_persistent_click(app),
                CONFIG_TRAY_ITEM => on_config_click(app),
                QUIT_TRAY_ITEM => on_quit_click(),
                _ => {}
            },
            _ => {}
        })
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        // 窗口关闭不退出
        .run(|_app_handle, event| match event {
            tauri::RunEvent::ExitRequested { api, .. } => {
                api.prevent_exit();
            }
            _ => {}
        });
}
