#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod config;
mod selection;
mod shortcut;
mod trayicon;
mod utils;
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
use tauri_plugin_autostart::MacosLauncher;
use trayicon::*;
use utils::*;
use window::*;

// 全局AppHandle
pub static APP: OnceCell<AppHandle> = OnceCell::new();
// 存待翻译文本
pub struct StringWrapper(pub Mutex<String>);

fn main() {
    #[cfg(target_os = "linux")]
    std::env::set_var("GDK_BACKEND", "x11");
    use std::thread;
    use tiny_http::{Response, Server};
    thread::spawn(move || {
        let server = Server::http("127.0.0.1:60828").unwrap();
        for mut request in server.incoming_requests() {
            let mut content = String::new();
            request.as_reader().read_to_string(&mut content).unwrap();
            popclip_window(content);
            let response = Response::from_string("success");
            request.respond(response).unwrap();
        }
    });
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
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec![]),
        ))
        //加载托盘图标
        .system_tray(build_system_tray())
        .setup(|app| {
            #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);
            // 初始化AppHandel
            APP.get_or_init(|| app.handle());
            let app_handle = APP.get().unwrap();
            // 初始化设置
            let is_first = !Config::init_config();
            // 初始化翻译内容
            app_handle.manage(StringWrapper(Mutex::new("".to_string())));
            // 创建驻留窗口，防止后续创建窗口时闪烁
            create_background_window();
            // 首次启动打开设置页面
            if is_first {
                on_config_click(app_handle);
            }
            // 注册全局快捷键
            match register_shortcut("all") {
                Ok(_) => {}
                Err(e) => {
                    Notification::new(&app.config().tauri.bundle.identifier)
                        .title("快捷键注册失败")
                        .body(e)
                        .icon("pot")
                        .show()
                        .unwrap();
                }
            }
            let copy_mode = get_config("auto_copy", toml::Value::Integer(4), app_handle.state())
                .as_integer()
                .unwrap();
            update_tray(app_handle, copy_mode);
            // 设置代理
            let proxy = get_config(
                "proxy",
                toml::Value::String(String::from("")),
                app_handle.state(),
            );
            std::env::set_var("http_proxy", proxy.as_str().unwrap());
            std::env::set_var("https_proxy", proxy.as_str().unwrap());
            std::env::set_var("all_proxy", proxy.as_str().unwrap());
            // 检查更新
            let enable = get_config("auto_check", toml::Value::Boolean(true), app_handle.state());
            let handle = app.handle();

            if enable.as_bool().unwrap() {
                tauri::async_runtime::spawn(async move {
                    match tauri::updater::builder(handle).check().await {
                        Ok(update) => {
                            if update.is_update_available() {
                                let window = app_handle.get_window("util").unwrap();
                                let update_ = update.clone();
                                tauri::api::dialog::ask(
                                    Some(&window),
                                    "新版本可用,是否更新？",
                                    update.body().unwrap(),
                                    |isok| {
                                        if isok {
                                            let app_handle = app_handle.clone();
                                            Notification::new(
                                                &app_handle.config().tauri.bundle.identifier,
                                            )
                                            .title("正在下载更新，请耐心等待")
                                            .icon("pot")
                                            .show()
                                            .unwrap();
                                            tauri::async_runtime::block_on(async move {
                                                match update_.download_and_install().await {
                                                    Ok(_) => {}
                                                    Err(e) => {
                                                        Notification::new(
                                                            &app_handle
                                                                .config()
                                                                .tauri
                                                                .bundle
                                                                .identifier,
                                                        )
                                                        .title("更新出错")
                                                        .body(e.to_string())
                                                        .icon("pot")
                                                        .show()
                                                        .unwrap();
                                                    }
                                                }
                                            });
                                        }
                                    },
                                );
                            }
                        }
                        Err(e) => {
                            println!("failed to get update: {}", e);
                        }
                    }
                });
            }
            Ok(())
        })
        // 注册Tauri Command
        .invoke_handler(tauri::generate_handler![
            get_translate_text,
            get_config_str,
            set_config,
            write_config,
            is_macos
        ])
        //绑定托盘事件
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::LeftClick { .. } => on_tray_click(app),
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                PERSISTENT_WINDOW => on_persistent_click(app),
                CONFIG_TRAY_ITEM => on_config_click(app),
                QUIT_TRAY_ITEM => on_quit_click(),
                OCR_WINDOW => on_ocr_click(app),
                COPY_SOURCE => on_auto_copy_click(app, 1),
                COPY_TARGET => on_auto_copy_click(app, 2),
                COPY_SOURCE_TARGET => on_auto_copy_click(app, 3),
                COPY_CLOSE => on_auto_copy_click(app, 4),
                _ => {}
            },
            _ => {}
        })
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        // 窗口关闭不退出
        .run(|_app_handle, event| {
            if let tauri::RunEvent::ExitRequested { api, .. } = event {
                api.prevent_exit();
            }
        });
}
