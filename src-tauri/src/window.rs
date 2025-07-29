use std::fs;

use crate::config::get;
use crate::config::set;
use crate::StringWrapper;
use crate::APP;
use dirs::cache_dir;
use log::{info, warn};
use tauri::Manager;
use tauri::Monitor;
use tauri::Window;
use tauri::WindowBuilder;
#[cfg(any(target_os = "macos", target_os = "windows"))]
use window_shadows::set_shadow;

// Get daemon window instance
fn get_daemon_window() -> Window {
    let app_handle = APP.get().unwrap();
    match app_handle.get_window("daemon") {
        Some(v) => v,
        None => {
            warn!("Daemon window not found, create new daemon window!");
            WindowBuilder::new(
                app_handle,
                "daemon",
                tauri::WindowUrl::App("daemon.html".into()),
            )
            .title("Daemon")
            .additional_browser_args("--disable-web-security")
            .visible(false)
            .build()
            .unwrap()
        }
    }
}

// Get monitor where the mouse is currently located
fn get_current_monitor(x: i32, y: i32) -> Monitor {
    info!("Mouse position: {}, {}", x, y);
    let daemon_window = get_daemon_window();
    let monitors = daemon_window.available_monitors().unwrap();

    for m in monitors {
        let size = m.size();
        let position = m.position();

        if x >= position.x
            && x <= (position.x + size.width as i32)
            && y >= position.y
            && y <= (position.y + size.height as i32)
        {
            info!("Current Monitor: {:?}", m);
            return m;
        }
    }
    warn!("Current Monitor not found, using primary monitor");
    daemon_window.primary_monitor().unwrap().unwrap()
}

// Creating a window on the mouse monitor
fn build_window(label: &str, title: &str) -> (Window, bool) {
    use mouse_position::mouse_position::{Mouse, Position};

    let mouse_position = match Mouse::get_mouse_position() {
        Mouse::Position { x, y } => Position { x, y },
        Mouse::Error => {
            warn!("Mouse position not found, using (0, 0) as default");
            Position { x: 0, y: 0 }
        }
    };
    let current_monitor = get_current_monitor(mouse_position.x, mouse_position.y);
    let position = current_monitor.position();

    let app_handle = APP.get().unwrap();
    match app_handle.get_window(label) {
        Some(v) => {
            info!("Window existence: {}", label);
            v.set_focus().unwrap();
            (v, true)
        }
        None => {
            info!("Window not existence, Creating new window: {}", label);
            let mut builder = tauri::WindowBuilder::new(
                app_handle,
                label,
                tauri::WindowUrl::App("index.html".into()),
            )
            .position(position.x.into(), position.y.into())
            .additional_browser_args("--disable-web-security")
            .focused(true)
            .title(title)
            .visible(false);

            #[cfg(target_os = "macos")]
            {
                builder = builder
                    .title_bar_style(tauri::TitleBarStyle::Overlay)
                    .hidden_title(true);
            }
            #[cfg(not(target_os = "macos"))]
            {
                builder = builder.transparent(true).decorations(false);
            }
            let window = builder.build().unwrap();

            if label != "screenshot" {
                #[cfg(not(target_os = "linux"))]
                set_shadow(&window, true).unwrap_or_default();
            }
            let _ = window.current_monitor();
            (window, false)
        }
    }
}

pub fn config_window() {
    let (window, _exists) = build_window("config", "Config");
    window
        .set_min_size(Some(tauri::LogicalSize::new(800, 400)))
        .unwrap();
    window.set_size(tauri::LogicalSize::new(800, 600)).unwrap();
    window.center().unwrap();
}

fn translate_window() -> Window {
    use mouse_position::mouse_position::{Mouse, Position};
    // Mouse physical position
    let mut mouse_position = match Mouse::get_mouse_position() {
        Mouse::Position { x, y } => Position { x, y },
        Mouse::Error => {
            warn!("Mouse position not found, using (0, 0) as default");
            Position { x: 0, y: 0 }
        }
    };
    let (window, exists) = build_window("translate", "Translate");
    if exists {
        return window;
    }
    window.set_skip_taskbar(true).unwrap();
    // Get Translate Window Size
    let width = match get("translate_window_width") {
        Some(v) => v.as_i64().unwrap(),
        None => {
            set("translate_window_width", 350);
            350
        }
    };
    let height = match get("translate_window_height") {
        Some(v) => v.as_i64().unwrap(),
        None => {
            set("translate_window_height", 420);
            420
        }
    };

    let monitor = window.current_monitor().unwrap().unwrap();
    let dpi = monitor.scale_factor();

    window
        .set_size(tauri::PhysicalSize::new(
            (width as f64) * dpi,
            (height as f64) * dpi,
        ))
        .unwrap();

    let position_type = match get("translate_window_position") {
        Some(v) => v.as_str().unwrap().to_string(),
        None => "mouse".to_string(),
    };

    match position_type.as_str() {
        "mouse" => {
            // Adjust window position
            let monitor_size = monitor.size();
            let monitor_size_width = monitor_size.width as f64;
            let monitor_size_height = monitor_size.height as f64;
            let monitor_position = monitor.position();
            let monitor_position_x = monitor_position.x as f64;
            let monitor_position_y = monitor_position.y as f64;

            if mouse_position.x as f64 + width as f64 * dpi
                > monitor_position_x + monitor_size_width
            {
                mouse_position.x -= (width as f64 * dpi) as i32;
                if (mouse_position.x as f64) < monitor_position_x {
                    mouse_position.x = monitor_position_x as i32;
                }
            }
            if mouse_position.y as f64 + height as f64 * dpi
                > monitor_position_y + monitor_size_height
            {
                mouse_position.y -= (height as f64 * dpi) as i32;
                if (mouse_position.y as f64) < monitor_position_y {
                    mouse_position.y = monitor_position_y as i32;
                }
            }

            window
                .set_position(tauri::PhysicalPosition::new(
                    mouse_position.x,
                    mouse_position.y,
                ))
                .unwrap();
        }
        _ => {
            let position_x = match get("translate_window_position_x") {
                Some(v) => v.as_i64().unwrap(),
                None => 0,
            };
            let position_y = match get("translate_window_position_y") {
                Some(v) => v.as_i64().unwrap(),
                None => 0,
            };
            window
                .set_position(tauri::PhysicalPosition::new(
                    (position_x as f64) * dpi,
                    (position_y as f64) * dpi,
                ))
                .unwrap();
        }
    }

    window
}

pub fn selection_translate() {
    use selection::get_text;
    // Get Selected Text
    let text = get_text();
    if !text.trim().is_empty() {
        let app_handle = APP.get().unwrap();
        // Write into State
        let state: tauri::State<StringWrapper> = app_handle.state();
        state.0.lock().unwrap().replace_range(.., &text);
    }

    let window = translate_window();
    window.emit("new_text", text).unwrap();
}

pub fn input_translate() {
    let app_handle = APP.get().unwrap();
    // Clear State
    let state: tauri::State<StringWrapper> = app_handle.state();
    state
        .0
        .lock()
        .unwrap()
        .replace_range(.., "[INPUT_TRANSLATE]");
    let window = translate_window();
    let position_type = match get("translate_window_position") {
        Some(v) => v.as_str().unwrap().to_string(),
        None => "mouse".to_string(),
    };
    if position_type == "mouse" {
        window.center().unwrap();
    }

    window.emit("new_text", "[INPUT_TRANSLATE]").unwrap();
}

pub fn text_translate(text: String) {
    let app_handle = APP.get().unwrap();
    // Clear State
    let state: tauri::State<StringWrapper> = app_handle.state();
    state.0.lock().unwrap().replace_range(.., &text);
    let window = translate_window();
    window.emit("new_text", text).unwrap();
}

pub fn slide_translate(text: String) {
    let app_handle = APP.get().unwrap();
    // Clear State
    let state: tauri::State<StringWrapper> = app_handle.state();
    state.0.lock().unwrap().replace_range(.., &text);
    let window = translateicon_window();

    window.emit("new_text", text).unwrap();
}

pub fn image_translate() {
    let app_handle = APP.get().unwrap();
    let state: tauri::State<StringWrapper> = app_handle.state();
    state
        .0
        .lock()
        .unwrap()
        .replace_range(.., "[IMAGE_TRANSLATE]");
    let window = translate_window();
    window.emit("new_text", "[IMAGE_TRANSLATE]").unwrap();
}

pub fn recognize_window() {
    let (window, exists) = build_window("recognize", "Recognize");
    if exists {
        window.emit("new_image", "").unwrap();
        return;
    }
    let width = match get("recognize_window_width") {
        Some(v) => v.as_i64().unwrap(),
        None => {
            set("recognize_window_width", 800);
            800
        }
    };
    let height = match get("recognize_window_height") {
        Some(v) => v.as_i64().unwrap(),
        None => {
            set("recognize_window_height", 400);
            400
        }
    };
    let monitor = window.current_monitor().unwrap().unwrap();
    let dpi = monitor.scale_factor();
    window
        .set_size(tauri::PhysicalSize::new(
            (width as f64) * dpi,
            (height as f64) * dpi,
        ))
        .unwrap();
    window.center().unwrap();
    window.emit("new_image", "").unwrap();
}

#[cfg(not(target_os = "macos"))]
fn screenshot_window() -> Window {
    let (window, _exists) = build_window("screenshot", "Screenshot");

    window.set_skip_taskbar(true).unwrap();
    #[cfg(target_os = "macos")]
    {
        let monitor = window.current_monitor().unwrap().unwrap();
        let size = monitor.size();
        window.set_decorations(false).unwrap();
        window.set_size(*size).unwrap();
    }

    #[cfg(not(target_os = "macos"))]
    window.set_fullscreen(true).unwrap();

    window.set_always_on_top(true).unwrap();
    window
}

pub fn ocr_recognize() {
    #[cfg(target_os = "macos")]
    {
        let app_handle = APP.get().unwrap();
        let mut app_cache_dir_path = cache_dir().expect("Get Cache Dir Failed");
        app_cache_dir_path.push(&app_handle.config().tauri.bundle.identifier);
        if !app_cache_dir_path.exists() {
            // 创建目录
            fs::create_dir_all(&app_cache_dir_path).expect("Create Cache Dir Failed");
        }
        app_cache_dir_path.push("pot_screenshot_cut.png");

        let path = app_cache_dir_path.to_string_lossy().replace("\\\\?\\", "");
        println!("Screenshot path: {}", path);
        if let Ok(_output) = std::process::Command::new("/usr/sbin/screencapture")
            .arg("-i")
            .arg("-r")
            .arg(path)
            .output()
        {
            recognize_window();
        }
    }
    #[cfg(not(target_os = "macos"))]
    {
        let window = screenshot_window();
        let window_ = window.clone();
        window.listen("success", move |event| {
            recognize_window();
            window_.unlisten(event.id())
        });
    }
}
pub fn ocr_translate() {
    #[cfg(target_os = "macos")]
    {
        let app_handle = APP.get().unwrap();
        let mut app_cache_dir_path = cache_dir().expect("Get Cache Dir Failed");
        app_cache_dir_path.push(&app_handle.config().tauri.bundle.identifier);
        if !app_cache_dir_path.exists() {
            // 创建目录
            fs::create_dir_all(&app_cache_dir_path).expect("Create Cache Dir Failed");
        }
        app_cache_dir_path.push("pot_screenshot_cut.png");

        let path = app_cache_dir_path.to_string_lossy().replace("\\\\?\\", "");
        println!("Screenshot path: {}", path);
        if let Ok(_output) = std::process::Command::new("/usr/sbin/screencapture")
            .arg("-i")
            .arg("-r")
            .arg(path)
            .output()
        {
            image_translate();
            ();
        }
    }
    #[cfg(not(target_os = "macos"))]
    {
        let window = screenshot_window();
        let window_ = window.clone();
        window.listen("success", move |event| {
            image_translate();
            window_.unlisten(event.id())
        });
    }
}

#[tauri::command(async)]
pub fn updater_window() {
    let (window, _exists) = build_window("updater", "Updater");
    window
        .set_min_size(Some(tauri::LogicalSize::new(600, 400)))
        .unwrap();
    window.set_size(tauri::LogicalSize::new(600, 400)).unwrap();
    window.center().unwrap();
}

use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;

pub fn translateicon_window() -> Window {
    use mouse_position::mouse_position::{Mouse, Position};
    
    // Mouse physical position
    let mut mouse_position = match Mouse::get_mouse_position() {
        Mouse::Position { x, y } => Position { x, y },
        Mouse::Error => {
            warn!("Mouse position not found, using (0, 0) as default");
            Position { x: 0, y: 0 }
        }
    };

    // Add offsets to avoid direct mouse triggered hovering
    const OFFSET: i32 = 10;
    mouse_position.x += OFFSET;
    mouse_position.y += OFFSET;

    let (window, exists) = build_window("translateicon", "TranslateIcon");
    if exists {
        // Initial small size (35x42)
        let initial_width = 35.0;
        let initial_height = 42.0;

        // Get monitor info
        let monitor = window.current_monitor().unwrap().unwrap();
        let dpi = monitor.scale_factor();
        // Adjust window position based on monitor boundaries
        let monitor_size = monitor.size();
        let monitor_size_width = monitor_size.width as f64;
        let monitor_size_height = monitor_size.height as f64;
        let monitor_position = monitor.position();
        let monitor_position_x = monitor_position.x as f64;
        let monitor_position_y = monitor_position.y as f64;

        // Use initial size for positioning
        if mouse_position.x as f64 + initial_width * dpi > monitor_position_x + monitor_size_width {
            mouse_position.x -= (initial_width * dpi) as i32;
            if (mouse_position.x as f64) < monitor_position_x {
                mouse_position.x = monitor_position_x as i32;
            }
        }
        if mouse_position.y as f64 + initial_height * dpi > monitor_position_y + monitor_size_height {
            mouse_position.y -= (initial_height * dpi) as i32;
            if (mouse_position.y as f64) < monitor_position_y {
                mouse_position.y = monitor_position_y as i32;
            }
        }

         window
        .set_size(tauri::PhysicalSize::new(
            initial_width * dpi,
            initial_height * dpi,
        ))
        .unwrap();
        window
            .set_position(tauri::PhysicalPosition::new(
                mouse_position.x,
                mouse_position.y,
            ))
            .unwrap();
        return window;
    }
    // Register for out-of-focus events and close when out of focus
    let cloned = window.clone();
    // window.on_window_event(move |event| {
    //     if let tauri::WindowEvent::Focused(false) = event {
    //         cloned.hide().unwrap(); // or close()?
    //     }
    // });

    // Get monitor info
    let monitor = window.current_monitor().unwrap().unwrap();
    let dpi = monitor.scale_factor();

    // Initial small size (35x42)
    let initial_width = 35.0;
    let initial_height = 42.0;
    
    // Full size when expanded
    let full_width = match get("translate_window_width") {
        Some(v) => v.as_i64().unwrap() as f64,
        None => {
            set("translate_window_width", 350);
            350.0
        }
    };
    let full_height = match get("translate_window_height") {
        Some(v) => v.as_i64().unwrap() as f64,
        None => {
            set("translate_window_height", 420);
            420.0
        }
    };

    // Set initial small size
    window
        .set_size(tauri::PhysicalSize::new(
            initial_width * dpi,
            initial_height * dpi,
        ))
        .unwrap();

    // Position the window
    let position_type = match get("translate_window_position") {
        Some(v) => v.as_str().unwrap().to_string(),
        None => "mouse".to_string(),
    };

    match position_type.as_str() {
        "mouse" => {
            // Adjust window position based on monitor boundaries
            let monitor_size = monitor.size();
            let monitor_size_width = monitor_size.width as f64;
            let monitor_size_height = monitor_size.height as f64;
            let monitor_position = monitor.position();
            let monitor_position_x = monitor_position.x as f64;
            let monitor_position_y = monitor_position.y as f64;

            // Use initial size for positioning
            if mouse_position.x as f64 + initial_width * dpi > monitor_position_x + monitor_size_width {
                mouse_position.x -= (initial_width * dpi) as i32;
                if (mouse_position.x as f64) < monitor_position_x {
                    mouse_position.x = monitor_position_x as i32;
                }
            }
            if mouse_position.y as f64 + initial_height * dpi > monitor_position_y + monitor_size_height {
                mouse_position.y -= (initial_height * dpi) as i32;
                if (mouse_position.y as f64) < monitor_position_y {
                    mouse_position.y = monitor_position_y as i32;
                }
            }

            window
                .set_position(tauri::PhysicalPosition::new(
                    mouse_position.x,
                    mouse_position.y,
                ))
                .unwrap();
        }
        _ => {
            let position_x = match get("translate_window_position_x") {
                Some(v) => v.as_i64().unwrap(),
                None => 0,
            };
            let position_y = match get("translate_window_position_y") {
                Some(v) => v.as_i64().unwrap(),
                None => 0,
            };
            window
                .set_position(tauri::PhysicalPosition::new(
                    (position_x as f64) * dpi,
                    (position_y as f64) * dpi,
                ))
                .unwrap();
        }
    }
    window.show().unwrap();
    window.set_focus().ok();

    // Ensure that the window is visible and has focus when the setup is complete
    // window.set_focus().unwrap_or_else(|e| {
    //     eprintln!("Failed to set focus: {}", e);
    // });
    // Set up mouse hover detection thread
    let window_clone = window.clone();
    let is_expanded = Arc::new(Mutex::new(false));
    let is_expanded_clone = is_expanded.clone();
    
    thread::spawn(move || {
        loop {
            thread::sleep(Duration::from_millis(50)); // Check every 50ms
            
            // Get current mouse position
            let current_mouse_pos = match Mouse::get_mouse_position() {
                Mouse::Position { x, y } => Position { x, y },
                Mouse::Error => continue,
            };
            
            // Get current window position and size
            let window_pos = match window_clone.outer_position() {
                Ok(pos) => pos,
                Err(_) => continue,
            };
            
            let window_size = match window_clone.outer_size() {
                Ok(size) => size,
                Err(_) => continue,
            };
            
            // Check if mouse is within window bounds
            let mouse_in_window = current_mouse_pos.x >= window_pos.x
                && current_mouse_pos.x <= window_pos.x + window_size.width as i32
                && current_mouse_pos.y >= window_pos.y
                && current_mouse_pos.y <= window_pos.y + window_size.height as i32;
            
            let mut expanded = is_expanded_clone.lock().unwrap();
            
            if mouse_in_window && !*expanded {
                // Mouse entered, expand window
                *expanded = true;
                drop(expanded); // Release lock before window operations
                
                let monitor = match window_clone.current_monitor() {
                    Ok(Some(m)) => m,
                    _ => continue,
                };
                let dpi = monitor.scale_factor();
                
                // Expand to full size
                let _ = window_clone.set_size(tauri::PhysicalSize::new(
                    full_width * dpi,
                    full_height * dpi,
                ));
                
                // Adjust position to keep window on screen
                let current_pos = match window_clone.outer_position() {
                    Ok(pos) => pos,
                    Err(_) => continue,
                };
                
                let monitor_size = monitor.size();
                let monitor_pos = monitor.position();
                
                let mut new_x = current_pos.x;
                let mut new_y = current_pos.y;
                
                // Check if expanded window goes off screen and adjust
                if current_pos.x + (full_width * dpi) as i32 > monitor_pos.x + monitor_size.width as i32 {
                    new_x = monitor_pos.x + monitor_size.width as i32 - (full_width * dpi) as i32;
                }
                if current_pos.y + (full_height * dpi) as i32 > monitor_pos.y + monitor_size.height as i32 {
                    new_y = monitor_pos.y + monitor_size.height as i32 - (full_height * dpi) as i32;
                }
                
                if new_x != current_pos.x || new_y != current_pos.y {
                    let _ = window_clone.set_position(tauri::PhysicalPosition::new(new_x, new_y));
                }
                window_clone.show().unwrap();
                window_clone.set_focus().ok();
            } else if !mouse_in_window && *expanded {
                // Mouse left, shrink window
                *expanded = false;
                drop(expanded); // Release lock before window operations
                
                let monitor = match window_clone.current_monitor() {
                    Ok(Some(m)) => m,
                    _ => continue,
                };
                let dpi = monitor.scale_factor();
                
                // Shrink back to small size
                let _ = window_clone.set_size(tauri::PhysicalSize::new(
                    initial_width * dpi,
                    initial_height * dpi,
                ));
                    // Set window to visible
                window_clone.show().unwrap();
                window_clone.set_focus().ok();
            }
        }
    });

    window
}
