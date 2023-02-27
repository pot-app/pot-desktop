use once_cell::sync::OnceCell;
use serde::{Deserialize, Serialize};
use std::{fs, io::Read, io::Write};
use tauri::api::path::config_dir;

pub static CONFIG: OnceCell<Config> = OnceCell::new();
static APPID: &str = "cn.pylogmon.pot";

#[derive(Deserialize, Debug, Serialize)]
#[allow(dead_code)]
pub struct Config {
    pub shortcut_translate: String,
    pub shortcut_open_translate: String,
}

fn check_config() -> Result<(fs::File, bool), String> {
    let default_config = Config {
        shortcut_translate: "CommandOrControl+D".to_owned(),
        shortcut_open_translate: "CommandOrControl+Shift+D".to_owned(),
    };
    // 检查文件是否存在,不存在的话创建并写入默认配置
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
        config_file
            .write_all(serde_json::to_string(&default_config).unwrap().as_bytes())
            .unwrap();
        let config_file = fs::File::open(&app_config_file_path).unwrap();
        return Ok((config_file, false));
    }
    #[allow(unused_mut)]
    let config_file = fs::File::open(&app_config_file_path).unwrap();
    Ok((config_file, true))
}

fn read_config(mut file: fs::File) {
    // 从文件读取配置
    let mut contents = String::new();
    file.read_to_string(&mut contents).unwrap();
    // 对配置反序列化
    let config: Config = serde_json::from_str(contents.as_str()).unwrap();
    // 创建全局变量
    CONFIG.get_or_init(|| config);
}

pub fn init_config() -> bool {
    let (file, flag) = match check_config() {
        Ok(v) => v,
        Err(_) => {
            panic!("panic")
        }
    };
    read_config(file);

    !flag
}

#[tauri::command]
pub fn write_config(config_str: &str) -> Result<(), String> {
    // 将新的配置写入文件
    let mut app_config_dir_path = match config_dir() {
        Some(v) => v,
        None => todo!(),
    };
    app_config_dir_path.push(APPID);
    let mut app_config_file_path = app_config_dir_path.clone();
    app_config_file_path.push("config.json");
    let mut config_file = fs::File::open(app_config_file_path).unwrap();
    config_file.write_all(config_str.as_bytes()).unwrap();

    // 重新加载配置
    init_config();

    Ok(())
}
