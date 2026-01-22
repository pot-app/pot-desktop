use crate::window::text_translate;
use selection::get_text;
use std::sync::Mutex;
use tauri::{ClipboardManager, Manager};
use log::{info, warn};

pub struct ClipboardMonitorEnableWrapper(pub Mutex<String>);
pub struct RealTimeTranslateEnableWrapper(pub Mutex<String>);

pub fn start_clipboard_monitor(app_handle: tauri::AppHandle) {
    tauri::async_runtime::spawn(async move {
        let mut pre_text = "".to_string();
        loop {
            let handle = app_handle.app_handle();
            let state = handle.state::<ClipboardMonitorEnableWrapper>();
            if let Ok(clipboard_monitor) = state.0.try_lock() {
                if clipboard_monitor.contains("true") {
                    if let Ok(result) = app_handle.clipboard_manager().read_text() {
                        match result {
                            Some(v) => {
                                if v != pre_text {
                                    text_translate(v.clone());
                                    pre_text = v;
                                }
                            }
                            None => {}
                        }
                    }
                } else {
                    break;
                }
            }
            std::thread::sleep(std::time::Duration::from_millis(500));
        }
    });
}

pub fn start_realtime_translate_monitor(app_handle: tauri::AppHandle) {
    tauri::async_runtime::spawn(async move {
        let mut pre_text = "".to_string();
        info!("实时翻译监控已启动");
        loop {
            let handle = app_handle.app_handle();
            let state = handle.state::<RealTimeTranslateEnableWrapper>();
            if let Ok(realtime_translate) = state.0.try_lock() {
                info!("实时翻译状态: {}", realtime_translate);
                if realtime_translate.contains("true") {
                    info!("正在尝试获取选中的文本...");
                    // 直接获取文本
                    let text = selection::get_text();
                    
                    // 修复：正确转义字符串中的引号
                    if text.trim().is_empty() {
                        info!("未检测到选中的文本");
                    } else {
                        info!("检测到选中的文本: \"{}\" (长度: {})
", text, text.len());
                    }
                    
                    // 只有在文本不为空且与之前不同时才进行翻译
                    if !text.trim().is_empty() && text != pre_text {
                        info!("正在处理选中的文本进行翻译");
                        text_translate(text.clone());
                        pre_text = text;
                    }
                } else {
                    info!("实时翻译已禁用，退出循环");
                    break;
                }
            }
            std::thread::sleep(std::time::Duration::from_millis(2000));
        }
    });
}