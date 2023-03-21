#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod auto;
mod config;
mod selection;
mod shortcut;
mod trayicon;
mod window;

use config::*;
use once_cell::sync::OnceCell;
use selection::get_translate_text;
use shortcut::register_shortcut;
use std::sync::Mutex;
use tauri::api::notification::Notification;
use tauri::AppHandle;
use tauri::Manager;
use tauri::SystemTrayEvent;
use trayicon::*;
use window::*;

// 全局AppHandle
pub static APP: OnceCell<AppHandle> = OnceCell::new();
// 存待翻译文本
pub struct StringWrapper(pub Mutex<String>);
fn main() {
    tauri::Builder::default()
        // 单例运行
        .plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
            if argv.contains(&"popclip".to_string()) {
                popclip_window(argv.last().unwrap().to_owned());
            } else if argv.contains(&"translate".to_string()) {
                translate_window();
            } else if argv.contains(&"persistent".to_string()) {
                persistent_window();
            } else {
                Notification::new(&app.config().tauri.bundle.identifier)
                    .title("程序已经在运行 请勿重复启动！")
                    .body(cwd)
                    .icon("pot")
                    .show()
                    .unwrap();
            }
        }))
        .setup(|app| {
            // 初始化AppHandel
            APP.get_or_init(|| app.handle());
            let handle = APP.get().unwrap();
            // 初始化设置
            let is_first = !Config::init_config();
            // 首次启动打开设置页面
            if is_first {
                on_config_click(handle);
            }
            handle.manage(StringWrapper(Mutex::new("".to_string())));
            // 注册全局快捷键
            match register_shortcut() {
                Ok(_) => {}
                Err(e) => {
                    Notification::new(&app.config().tauri.bundle.identifier)
                        .title("快捷键注册失败")
                        .body(e.to_string())
                        .icon("pot")
                        .show()
                        .unwrap();
                }
            }
            Ok(())
        })
        // 注册Tauri Command
        .invoke_handler(tauri::generate_handler![
            get_translate_text,
            get_config_str,
            set_config,
            write_config
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
