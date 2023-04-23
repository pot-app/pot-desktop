use crate::config::{set_config, write_config};
use crate::window::{build_ocr_window, build_translate_window};
use crate::APP;
use tauri::api::notification::Notification;
use tauri::{
    AppHandle, CustomMenuItem, Manager, SystemTray, SystemTrayMenu, SystemTrayMenuItem,
    SystemTraySubmenu, WindowEvent,
};
use toml::Value;

pub const CONFIG_TRAY_ITEM: &str = "config";
pub const QUIT_TRAY_ITEM: &str = "quit";
pub const PERSISTENT_WINDOW: &str = "persistent";
pub const OCR_WINDOW: &str = "ocr";
pub const COPY_SOURCE: &str = "copy_source";
pub const COPY_TARGET: &str = "copy_target";
pub const COPY_SOURCE_TARGET: &str = "copy_source_target";
pub const COPY_CLOSE: &str = "copy_close";

// 创建托盘菜单
pub fn build_system_tray() -> SystemTray {
    let persistent = CustomMenuItem::new(PERSISTENT_WINDOW.to_string(), "翻译");
    // let ocr = CustomMenuItem::new(OCR_WINDOW.to_string(), "OCR");
    let config = CustomMenuItem::new(CONFIG_TRAY_ITEM.to_string(), "设置");
    let quit = CustomMenuItem::new(QUIT_TRAY_ITEM.to_string(), "退出");

    let tray_menu = SystemTrayMenu::new()
        .add_item(persistent)
        .add_submenu(SystemTraySubmenu::new(
            "自动复制",
            SystemTrayMenu::new()
                .add_item(CustomMenuItem::new(COPY_SOURCE.to_string(), "原文"))
                .add_item(CustomMenuItem::new(COPY_TARGET.to_string(), "译文"))
                .add_item(CustomMenuItem::new(
                    COPY_SOURCE_TARGET.to_string(),
                    "原文+译文",
                ))
                .add_item(CustomMenuItem::new(COPY_CLOSE.to_string(), "关闭")),
        ))
        // .add_native_item(SystemTrayMenuItem::Separator)
        // .add_item(ocr)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(config)
        .add_item(quit);
    SystemTray::new().with_menu(tray_menu)
}

// 启动独立翻译窗口
pub fn on_persistent_click(app: &AppHandle) {
    match app.get_window("persistent") {
        Some(window) => {
            window.close().unwrap();
        }
        None => {
            let _window = build_translate_window("persistent", "Persistent", app).unwrap();
        }
    }
}

fn on_window_close(event: &WindowEvent) {
    let handle = APP.get().unwrap();
    if let WindowEvent::CloseRequested { .. } = event {
        if let Err(e) = write_config(handle.state()) {
            Notification::new(&handle.config().tauri.bundle.identifier)
                .title("配置写入失败")
                .body(e)
                .icon("pot")
                .show()
                .unwrap();
        }
    }
}
// 打开设置
pub fn on_config_click(app: &AppHandle) {
    match app.get_window("config") {
        Some(window) => {
            window.set_focus().unwrap();
        }
        None => {
            let config_window = tauri::WindowBuilder::new(
                app,
                "config",
                tauri::WindowUrl::App("index.html".into()),
            )
            .inner_size(600.0, 400.0)
            .min_inner_size(400.0, 400.0)
            .center()
            .focused(true)
            .title("设置")
            .build()
            .unwrap();
            config_window.on_window_event(on_window_close);
        }
    }
}

pub fn on_ocr_click(app: &AppHandle) {
    match app.get_window("ocr") {
        Some(window) => {
            window.close().unwrap();
        }
        None => {
            let _window = build_ocr_window(app).unwrap();
        }
    }
}
// 退出程序
pub fn on_quit_click() {
    std::process::exit(0);
}

pub fn on_auto_copy_click(app: &AppHandle, mode: i64) {
    set_config("auto_copy", Value::Integer(mode), app.state());
}

pub fn update_tray(app: &AppHandle, mode: i64) {
    let tray = app.tray_handle();
    let _ = tray.get_item(COPY_SOURCE).set_selected(mode == 1);
    let _ = tray.get_item(COPY_TARGET).set_selected(mode == 2);
    let _ = tray.get_item(COPY_SOURCE_TARGET).set_selected(mode == 3);
    let _ = tray.get_item(COPY_CLOSE).set_selected(mode == 4);
}
