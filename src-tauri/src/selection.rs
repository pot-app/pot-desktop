use crate::StringWrapper;

// 获取选择的文本(Linux)
#[cfg(target_os = "linux")]
pub fn get_selection_text() -> Result<String, String> {
    // use std::env::var;
    // if let Ok(session_type) = var("XDG_SESSION_TYPE") {
    //     match session_type.as_str() {
    //         "x11" => {
    use std::time::Duration;
    use tauri::Manager;
    use x11_clipboard::Clipboard;
    use crate::APP;

    if let Ok(clipboard) = Clipboard::new() {
        if let Ok(primary) = clipboard.load(
            clipboard.getter.atoms.primary,
            clipboard.getter.atoms.utf8_string,
            clipboard.getter.atoms.property,
            Duration::from_millis(100),
        ) {
            let mut result = String::from_utf8_lossy(&primary)
                .trim_matches('\u{0}')
                .trim()
                .to_string();

            let app_handle = APP.get().unwrap();
            let last = get_translate_text(app_handle.state());
            // 如果Primary没有变化，就尝试复制一次
            if result.is_empty() || result == last {
                copy();
                std::thread::sleep(std::time::Duration::from_millis(200));
                if let Ok(main_clipboard) = clipboard.load(
                    clipboard.getter.atoms.clipboard,
                    clipboard.getter.atoms.utf8_string,
                    clipboard.getter.atoms.property,
                    Duration::from_millis(100),
                ) {
                    result = String::from_utf8_lossy(&main_clipboard)
                        .trim_matches('\u{0}')
                        .trim()
                        .to_string();
                }
            }
            Ok(result)
        } else {
            Err("Clipboard Read Failed".to_string())
        }
    } else {
        Err("Clipboard Create Failed".to_string())
    }
    //         }
    //         "wayland" => {
    //             use std::io::Read;
    //             use wl_clipboard_rs::paste::{get_contents, ClipboardType, Error, MimeType, Seat};

    //             let result =
    //                 get_contents(ClipboardType::Primary, Seat::Unspecified, MimeType::Text);

    //             match result {
    //                 Ok((mut pipe, _)) => {
    //                     let mut contents = vec![];
    //                     pipe.read_to_end(&mut contents).unwrap();
    //                     let contents = String::from_utf8_lossy(&contents)
    //                         .trim_matches('\u{0}')
    //                         .trim()
    //                         .to_string();
    //                     return Ok(contents);
    //                 }

    //                 Err(Error::NoSeats) | Err(Error::ClipboardEmpty) | Err(Error::NoMimeType) => {
    //                     return Ok("".to_string());
    //                 }

    //                 Err(err) => return Err(err.to_string()),
    //             }
    //         }
    //         _ => {
    //             return Err(format!("Unknown Session Type: {session_type}").to_string());
    //         }
    //     }
    // } else {
    //     return Err("Get Session Type Failed".to_string());
    // }
}

// 获取选择的文本(Windows)
#[cfg(target_os = "windows")]
pub fn get_selection_text() -> Result<String, String> {
    use arboard::Clipboard;

    // 读取旧的剪切板
    let old_clipboard = (
        Clipboard::new().unwrap().get_text(),
        Clipboard::new().unwrap().get_image(),
    );
    copy();

    // 读取新的剪切板
    let new_text = Clipboard::new().unwrap().get_text();

    // 创建用于回写的剪切板
    let mut write_clipboard = Clipboard::new().unwrap();

    match old_clipboard {
        (Ok(text), _) => {
            // 旧剪切板为文本
            write_clipboard.set_text(text.clone()).unwrap();
            if let Ok(new) = new_text {
                //新旧剪切板相同说明没有复制新内容
                // if new.trim() == text.trim() {
                //     Ok("".to_string())
                // } else {
                    Ok(new)
                // }
            } else {
                Ok("".to_string())
            }
        }
        (_, Ok(image)) => {
            // 旧剪切板为图片
            write_clipboard.set_image(image).unwrap();
            if let Ok(new) = new_text {
                Ok(new)
            } else {
                Ok("".to_string())
            }
        }
        _ => {
            // 旧剪切板为空
            write_clipboard.clear().unwrap();
            if let Ok(new) = new_text {
                Ok(new)
            } else {
                Ok("".to_string())
            }
        }
    }
}

#[cfg(target_os = "macos")]
pub fn get_selection_text() -> Result<String, String> {
    let apple_script = r#"
use sys : application "System Events"

-- Use the following delay to choose an application window
-- and highlight some text.  Then ensure that the window remains
-- in focus until the script terminates.
-- delay 5

set P to the first application process whose frontmost is true

set appName to name of P

if appName is equal to "Mail" then
	error "not support " & appName
end

if appName is equal to "Safari" then
	try
		tell application "Safari"
			set theText to (do JavaScript "getSelection().toString()" in document 1)
		end tell
		return theText
	end try
	error "not support Safari"
end

if appName is equal to "Google Chrome" then
	try
		tell application "Google Chrome" to tell active tab of window 1
			set theText to (execute javascript "getSelection().toString()")
		end tell
		return theText
	end try
	error "not support Google Chrome"
end

if appName is equal to "Microsoft Edge" then
	try
		tell application "Microsoft Edge" to tell active tab of window 1
			set theText to (execute javascript "getSelection().toString()")
		end tell
		return theText
	end try
	error "not support Microsoft Edge"
end

set _W to a reference to the first window of P

set _U to a reference to ¬
	(UI elements of P whose ¬
		name of attributes contains "AXSelectedText" and ¬
		value of attribute "AXSelectedText" is not "" and ¬
		class of value of attribute "AXSelectedText" is not class)

tell sys to if (count _U) ≠ 0 then ¬
	return the value of ¬
		attribute "AXSelectedText" of ¬
		_U's contents's first item

set _U to a reference to UI elements of _W

with timeout of 1 seconds
	tell sys to repeat while (_U exists)
		tell (a reference to ¬
			(_U whose ¬
				name of attributes contains "AXSelectedText" and ¬
				value of attribute "AXSelectedText" is not "" and ¬
				class of value of attribute "AXSelectedText" is not class)) ¬
			to if (count) ≠ 0 then return the value of ¬
			attribute "AXSelectedText" of its contents's first item
		
		set _U to a reference to (UI elements of _U)
	end repeat
end timeout

error "not found AXSelectedText"
"#;

    match std::process::Command::new("osascript")
        .arg(apple_script)
        .output()
    {
        Ok(output) => {
            // check exit code
            if output.status.success() {
                // get output content
                let content = String::from_utf8(output.stdout)
                    .expect("failed to parse get-selected-text-by-ax.applescript output");
                // trim content
                let content = content.trim();
                Ok(content.to_string())
            } else {
                let err = output
                    .stderr
                    .into_iter()
                    .map(|c| c as char)
                    .collect::<String>()
                    .into();
                Err(err)
            }
        }
        Err(e) => Err(e.to_string()),
    }
}

// 复制操作
#[cfg(any(target_os = "windows", target_os = "linux"))]
pub fn copy() {
    use enigo::*;
    let mut enigo = Enigo::new();
    // 先释放按键
    enigo.key_up(Key::Control);
    enigo.key_up(Key::Alt);
    enigo.key_up(Key::Shift);
    enigo.key_up(Key::Space);
    enigo.key_up(Key::Meta);
    enigo.key_up(Key::Tab);
    enigo.key_up(Key::Escape);
    enigo.key_up(Key::CapsLock);
    // 发送CtrlC
    enigo.key_sequence_parse("{+CTRL}c{-CTRL}");
}

#[tauri::command]
pub fn get_translate_text(state: tauri::State<StringWrapper>) -> String {
    return state.0.lock().unwrap().to_string();
}
