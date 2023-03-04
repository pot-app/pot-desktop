use once_cell::sync::OnceCell;
use serde::{Deserialize, Serialize};
use std::{fs, io::Read, io::Write};
use tauri::api::path::config_dir;
// 全局配置
pub static CONFIG_STR: OnceCell<String> = OnceCell::new();
pub static CONFIG: OnceCell<Config> = OnceCell::new();
static APPID: &str = "cn.pylogmon.pot";

// 配置文件结构体
#[derive(Deserialize, Debug, Serialize)]
#[allow(dead_code)]
pub struct Config {
    pub shortcut_translate: String,
    pub shortcut_persistent: String,
    pub target_language: String,
    pub interface: String,
}

// 检查配置文件是否存在
fn check_config() -> Result<(fs::File, bool), String> {
    // 配置文件路径
    let mut app_config_dir_path = match config_dir() {
        Some(v) => v,
        None => todo!(),
    };
    app_config_dir_path.push(APPID);
    let mut app_config_file_path = app_config_dir_path.clone();
    app_config_file_path.push("config.json");
    // 检查文件
    if !app_config_file_path.exists() {
        // 检查目录
        if !app_config_dir_path.exists() {
            fs::create_dir_all(app_config_dir_path).unwrap();
        }
        // 创建文件
        let mut config_file = fs::File::create(&app_config_file_path).unwrap();
        // 写入默认配置
        let default_config = Config {
            shortcut_translate: "CommandOrControl+D".to_owned(),
            shortcut_persistent: "CommandOrControl+Shift+D".to_owned(),
            target_language: "zh-cn".to_owned(),
            interface: "youdao_free".to_owned(),
        };
        config_file
            .write_all(serde_json::to_string(&default_config).unwrap().as_bytes())
            .unwrap();
        let config_file = fs::File::open(&app_config_file_path).unwrap();
        return Ok((config_file, false));
    }

    let config_file = fs::File::open(&app_config_file_path).unwrap();
    Ok((config_file, true))
}

// 从文件读取配置
fn read_config(mut file: fs::File) {
    // 从文件读取配置
    let mut contents = String::new();
    file.read_to_string(&mut contents).unwrap();
    CONFIG_STR.get_or_init(|| contents.clone());
    // 对配置反序列化
    let config: Config = serde_json::from_str(contents.as_str()).unwrap();
    // 写入全局变量
    CONFIG.get_or_init(|| config);
}

// 初始化配置
pub fn init_config() -> bool {
    // 获取配置文件
    let (file, flag) = match check_config() {
        Ok(v) => v,
        Err(_) => {
            panic!("panic")
        }
    };
    // 读取配置文件
    read_config(file);

    !flag
}

// 前端获取配置
#[tauri::command]
pub fn get_config() -> Result<String, String> {
    Ok(CONFIG_STR.get().unwrap().to_string())
}
