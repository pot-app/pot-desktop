use tauri::{AppHandle, CustomMenuItem, Manager, SystemTray, SystemTrayMenu};
#[cfg(target_os = "windows")]
use window_shadows::set_shadow;

pub const CONFIG_TRAY_ITEM: &str = "config";
pub const QUIT_TRAY_ITEM: &str = "quit";
pub const PERSISTENT_WINDOW: &str = "persistent";

// 创建托盘菜单
pub fn build_system_tray() -> SystemTray {
    let persistent = CustomMenuItem::new(PERSISTENT_WINDOW.to_string(), "翻译");
    let config = CustomMenuItem::new(CONFIG_TRAY_ITEM.to_string(), "设置");
    let quit = CustomMenuItem::new(QUIT_TRAY_ITEM.to_string(), "退出");
    let tray_menu = SystemTrayMenu::new()
        .add_item(persistent)
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
            let _window = tauri::WindowBuilder::new(
                app,
                "persistent",
                tauri::WindowUrl::App("index_persistent.html".into()),
            )
            .inner_size(400.0, 500.0)
            .min_inner_size(400.0, 400.0)
            .always_on_top(true)
            .transparent(true)
            .decorations(false)
            .center()
            .title("Translator")
            .build()
            .unwrap();
            // css圆角对windows无效，需要单独设置
            #[cfg(target_os = "windows")]
            set_shadow(&_window, true).unwrap();
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
            let _main_window = tauri::WindowBuilder::new(
                app,
                "config",
                tauri::WindowUrl::App("index.html".into()),
            )
            .inner_size(800.0, 600.0)
            .min_inner_size(800.0, 600.0)
            .center()
            .title("Config")
            .build()
            .unwrap();
        }
    }
}

// 退出程序
pub fn on_quit_click() {
    std::process::exit(0);
}
