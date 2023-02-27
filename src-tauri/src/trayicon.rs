use tauri::{AppHandle, CustomMenuItem, Manager, SystemTray, SystemTrayMenu};

pub const CONFIG_TRAY_ITEM: &str = "config";
pub const QUIT_TRAY_ITEM: &str = "quit";

pub fn build_system_tray() -> SystemTray {
    let config = CustomMenuItem::new(CONFIG_TRAY_ITEM.to_string(), "设置");
    let quit = CustomMenuItem::new(QUIT_TRAY_ITEM.to_string(), "退出");
    let tray_menu = SystemTrayMenu::new().add_item(config).add_item(quit);
    SystemTray::new().with_menu(tray_menu)
}

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
            .title("Config")
            .build()
            .unwrap();
        }
    }
}

pub fn on_quit_click() {
    std::process::exit(0);
}
