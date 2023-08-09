use crate::config::{get, set};
use crate::window::config_window;
use crate::window::input_translate;
use crate::window::ocr_recognize;
use crate::window::ocr_translate;
use crate::window::updater_window;
use log::info;
use tauri::AppHandle;
use tauri::CustomMenuItem;
use tauri::GlobalShortcutManager;
use tauri::SystemTrayEvent;
use tauri::SystemTrayMenu;
use tauri::SystemTrayMenuItem;
use tauri::SystemTraySubmenu;

pub fn update_tray(app: &tauri::AppHandle) {
    let tray_handle = app.tray_handle();
    // ISO-639-1 + Country Code (Option)
    // https://zh.wikipedia.org/wiki/ISO_639-1%E4%BB%A3%E7%A0%81%E8%A1%A8
    let language = match get("app_language") {
        Some(v) => v.as_str().unwrap().to_string(),
        None => {
            set("app_language", "en");
            "en".to_string()
        }
    };
    let copy_mode = match get("auto_copy") {
        Some(v) => v.as_str().unwrap().to_string(),
        None => {
            set("auto_copy", "disable");
            "disable".to_string()
        }
    };
    info!(
        "Update tray with language: {}, copy mode: {}",
        language, copy_mode
    );
    tray_handle
        .set_menu(match language.as_str() {
            "en" => tray_menu_en(),
            "zh_cn" => tray_menu_zh_cn(),
            _ => tray_menu_en(),
        })
        .unwrap();
    #[cfg(not(target_os = "linux"))]
    tray_handle
        .set_tooltip(&format!("pot {}", app.package_info().version))
        .unwrap();
    match copy_mode.as_str() {
        "source" => tray_handle
            .get_item("copy_source")
            .set_selected(true)
            .unwrap(),
        "target" => tray_handle
            .get_item("copy_target")
            .set_selected(true)
            .unwrap(),
        "source_target" => tray_handle
            .get_item("copy_source_target")
            .set_selected(true)
            .unwrap(),
        "disable" => tray_handle
            .get_item("copy_disable")
            .set_selected(true)
            .unwrap(),
        _ => {}
    }
}

pub fn tray_event_handler<'a>(app: &'a AppHandle, event: SystemTrayEvent) {
    match event {
        SystemTrayEvent::LeftClick { .. } => on_tray_click(),
        SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
            "input_translate" => on_input_translate_click(),
            "copy_source" => on_auto_copy_click(app, "source"),
            "copy_target" => on_auto_copy_click(app, "target"),
            "copy_source_target" => on_auto_copy_click(app, "source_target"),
            "copy_disable" => on_auto_copy_click(app, "disable"),
            "ocr_recognize" => on_ocr_recognize_click(),
            "ocr_translate" => on_ocr_translate_click(),
            "config" => on_config_click(),
            "check_update" => on_check_update_click(),
            "restart" => on_restart_click(app),
            "quit" => on_quit_click(app),
            _ => {}
        },
        _ => {}
    }
}

fn on_tray_click() {
    let event = match get("tray_click_event") {
        Some(v) => v.as_str().unwrap().to_string(),
        None => {
            set("tray_click_event", "config");
            "config".to_string()
        }
    };
    match event.as_str() {
        "config" => config_window(),
        "translate" => input_translate(),
        "ocr_recognize" => ocr_recognize(),
        "ocr_translate" => ocr_translate(),
        "disable" => {}
        _ => config_window(),
    }
}
fn on_input_translate_click() {
    input_translate();
}
fn on_auto_copy_click(app: &AppHandle, mode: &str) {
    info!("Set copy mode to: {}", mode);
    set("auto_copy", mode);
    update_tray(app);
}
fn on_ocr_recognize_click() {
    ocr_recognize();
}
fn on_ocr_translate_click() {
    ocr_translate();
}

fn on_config_click() {
    config_window();
}

fn on_check_update_click() {
    updater_window();
}
fn on_restart_click(app: &AppHandle) {
    info!("============== Restart App ==============");
    app.restart();
}
fn on_quit_click(app: &AppHandle) {
    app.global_shortcut_manager().unregister_all().unwrap();
    info!("============== Quit App ==============");
    app.exit(0);
}

fn tray_menu_en() -> tauri::SystemTrayMenu {
    let input_translate = CustomMenuItem::new("input_translate", "Input Translate");
    let copy_source = CustomMenuItem::new("copy_source", "Source");
    let copy_target = CustomMenuItem::new("copy_target", "Target");

    let copy_source_target = CustomMenuItem::new("copy_source_target", "Source+Target");
    let copy_disable = CustomMenuItem::new("copy_disable", "Disable");
    let ocr_recognize = CustomMenuItem::new("ocr_recognize", "OCR Recognize");
    let ocr_translate = CustomMenuItem::new("ocr_translate", "OCR Translate");
    let config = CustomMenuItem::new("config", "Config");
    let check_update = CustomMenuItem::new("check_update", "Check Update");
    let restart = CustomMenuItem::new("restart", "Restart");
    let quit = CustomMenuItem::new("quit", "Quit");
    SystemTrayMenu::new()
        .add_item(input_translate)
        .add_submenu(SystemTraySubmenu::new(
            "Auto Copy",
            SystemTrayMenu::new()
                .add_item(copy_source)
                .add_item(copy_target)
                .add_item(copy_source_target)
                .add_native_item(SystemTrayMenuItem::Separator)
                .add_item(copy_disable),
        ))
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(ocr_recognize)
        .add_item(ocr_translate)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(config)
        .add_item(check_update)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(restart)
        .add_item(quit)
}

fn tray_menu_zh_cn() -> tauri::SystemTrayMenu {
    let input_translate = CustomMenuItem::new("input_translate", "输入翻译");
    let copy_source = CustomMenuItem::new("copy_source", "原文");
    let copy_target = CustomMenuItem::new("copy_target", "译文");

    let copy_source_target = CustomMenuItem::new("copy_source_target", "原文+译文");
    let copy_disable = CustomMenuItem::new("copy_disable", "关闭");
    let ocr_recognize = CustomMenuItem::new("ocr_recognize", "文字识别");
    let ocr_translate = CustomMenuItem::new("ocr_translate", "截图翻译");
    let config = CustomMenuItem::new("config", "偏好设置");
    let check_update = CustomMenuItem::new("check_update", "检查更新");
    let restart = CustomMenuItem::new("restart", "重启应用");
    let quit = CustomMenuItem::new("quit", "退出");
    SystemTrayMenu::new()
        .add_item(input_translate)
        .add_submenu(SystemTraySubmenu::new(
            "自动复制",
            SystemTrayMenu::new()
                .add_item(copy_source)
                .add_item(copy_target)
                .add_item(copy_source_target)
                .add_native_item(SystemTrayMenuItem::Separator)
                .add_item(copy_disable),
        ))
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(ocr_recognize)
        .add_item(ocr_translate)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(config)
        .add_item(check_update)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(restart)
        .add_item(quit)
}
