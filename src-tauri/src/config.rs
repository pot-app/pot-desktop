use crate::shortcut::register_shortcut;
use crate::trayicon::update_tray;
use crate::APP;
use dirs::config_dir;
use std::sync::Mutex;
use std::{fs, io::Read, path::PathBuf};
use tauri::api::notification::Notification;
use tauri::utils::platform::current_exe;
use tauri::{GlobalShortcutManager, Manager};
use toml::{Table, Value};

fn get_app_config_dir() -> PathBuf {
    let handle = APP.get().unwrap();
    let mut app_config_dir_path = config_dir().expect("Get Config Dir Failed");
    app_config_dir_path.push(&handle.config().tauri.bundle.identifier);
    app_config_dir_path
}

fn get_app_config_file() -> PathBuf {
    let exe_path = current_exe().expect("Get Exe Path Failed");
    let exe_dir_path = exe_path.parent().expect("Get Exe Dir Failed");
    let mut exe_config_path = exe_dir_path.to_path_buf();
    exe_config_path = dunce::canonicalize(exe_config_path).unwrap();
    exe_config_path.push("config.toml");

    if exe_config_path.exists() {
        return exe_config_path;
    }
    let mut app_config_file_path = get_app_config_dir();
    app_config_file_path.push("config.toml");
    app_config_file_path
}

fn check_config() -> bool {
    // 配置目录路径
    let app_config_dir_path = get_app_config_dir();
    // 配置文件路径
    let app_config_file_path = get_app_config_file();

    if !app_config_file_path.exists() {
        if !app_config_dir_path.exists() {
            // 创建目录
            fs::create_dir_all(app_config_dir_path).expect("Create Config Dir Failed");
        }
        // 创建文件
        fs::File::create(app_config_file_path).expect("Create Config File Failed");
        return false;
    }
    true
}

pub struct ConfigWrapper(pub Mutex<Config>);
// 配置文件结构体
pub struct Config {
    pub config_toml: Table,
}

impl Config {
    pub fn init_config() -> bool {
        // 配置文件路径
        let app_config_file_path = get_app_config_file();
        // 检查配置文件
        let flag = check_config();
        // 读取配置文件
        let mut config_file =
            fs::File::open(app_config_file_path).expect("Open Config File Failed");
        let mut contents = String::new();
        config_file
            .read_to_string(&mut contents)
            .expect("Read Config File Failed");
        // 构造配置结构体
        let config = ConfigWrapper(Mutex::new(Config {
            config_toml: contents.parse::<Table>().expect("Parse Config File Failed"),
        }));
        // 写入状态
        APP.get().unwrap().manage(config);
        flag
    }
    pub fn get(&self, key: &str, default: Value) -> Value {
        match self.config_toml.get(key) {
            Some(v) => v.to_owned(),
            None => default,
        }
    }
    pub fn set(&mut self, key: &str, value: Value) {
        self.config_toml.insert(key.to_string(), value);
    }
    pub fn write(&self) -> Result<(), String> {
        let app_config_file_path = get_app_config_file();
        let contents = self.config_toml.to_string();
        match fs::write(app_config_file_path, contents) {
            Ok(_) => Ok(()),
            Err(e) => Err(e.to_string()),
        }
    }
}

pub fn get_config(key: &str, default: Value, state: tauri::State<ConfigWrapper>) -> Value {
    state.0.lock().unwrap().get(key, default)
}

#[tauri::command]
pub fn set_config(key: &str, value: Value, state: tauri::State<ConfigWrapper>) {
    if key == "auto_copy" {
        let copy_mode = value.clone().as_integer().unwrap();
        update_tray(APP.get().unwrap(), copy_mode);
    }
    if key.starts_with("shortcut") {
        let handle = APP.get().unwrap();
        let old_shortcut = get_config(key, Value::from(""), APP.get().unwrap().state());
        handle
            .global_shortcut_manager()
            .unregister(old_shortcut.as_str().unwrap())
            .unwrap();
        state.0.lock().unwrap().set(key, value);
        match register_shortcut(key) {
            Ok(_) => {
                Notification::new(&handle.config().tauri.bundle.identifier)
                    .title("快捷键设置成功")
                    .icon("pot")
                    .show()
                    .unwrap();
            }
            Err(e) => {
                Notification::new(&handle.config().tauri.bundle.identifier)
                    .title("快捷键注册失败")
                    .body(e)
                    .icon("pot")
                    .show()
                    .unwrap();
            }
        }
    } else {
        state.0.lock().unwrap().set(key, value);
    }
    if key == "auto_copy" {
        let _ = write_config(state);
    }
}

#[tauri::command]
pub fn write_config(state: tauri::State<ConfigWrapper>) -> Result<(), String> {
    state.0.lock().unwrap().write()
}

#[tauri::command]
pub fn get_config_str(state: tauri::State<ConfigWrapper>) -> Table {
    return state.0.lock().unwrap().config_toml.clone();
}

#[cfg(any(target_os = "windows", target_os = "linux"))]
pub struct MonitorWrapper(pub Mutex<(u32, u32, f64)>);

pub fn set_monitor_info() {
    let handle = APP.get().unwrap();
    let util_window = match handle.get_window("util") {
        Some(v) => v,
        None => {
            tauri::WindowBuilder::new(handle, "util", tauri::WindowUrl::App("index.html".into()))
                .skip_taskbar(true)
                .visible(false)
                .build()
                .unwrap()
        }
    };
    let monitor = util_window.current_monitor().unwrap().unwrap();
    let size = monitor.size();
    let dpi = monitor.scale_factor();
    APP.get()
        .unwrap()
        .manage(MonitorWrapper(Mutex::new((size.width, size.height, dpi))));
}

pub fn get_monitor_info(state: tauri::State<MonitorWrapper>) -> (u32, u32, f64) {
    state.0.lock().unwrap().to_owned()
}
