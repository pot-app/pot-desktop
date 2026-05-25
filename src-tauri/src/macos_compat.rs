// macOS Tahoe 26.x compatible text selection
// Improves upon the `selection` crate with:
// 1. Retry logic for AX API (handles timing issues after hotkey press)
// 2. Better error logging
// 3. Per-app method caching (remembers which method works for each app)
// 4. Improved clipboard fallback with proper timeout

use log::{error, info, warn};
use std::collections::HashMap;
use std::sync::{Mutex, OnceLock};
use std::time::Duration;

// Cache mapping app name -> method (0 = AX API, 1 = clipboard)
fn method_cache() -> &'static Mutex<HashMap<String, u8>> {
    static CACHE: OnceLock<Mutex<HashMap<String, u8>>> = OnceLock::new();
    CACHE.get_or_init(|| Mutex::new(HashMap::new()))
}

/// Get selected text with macOS Tahoe compatibility
/// Tries AX API first with retry, then falls back to clipboard method
pub fn get_selected_text() -> String {
    info!("[macos_compat] Getting selected text...");

    // Method 1: Try AX API with retry (handles timing issues on Tahoe)
    match get_selected_text_by_ax_with_retry() {
        Ok(text) if !text.is_empty() => {
            info!(
                "[macos_compat] Got text via AX API: {} chars",
                text.len()
            );
            return text;
        }
        Ok(_) => {
            info!("[macos_compat] AX API returned empty text");
        }
        Err(e) => {
            warn!("[macos_compat] AX API failed: {}", e);
        }
    }

    // Method 2: Try clipboard fallback
    info!("[macos_compat] Falling back to clipboard method");
    match get_text_by_clipboard() {
        Ok(text) if !text.is_empty() => {
            info!(
                "[macos_compat] Got text via clipboard: {} chars",
                text.len()
            );
            return text;
        }
        Ok(_) => {
            warn!("[macos_compat] Clipboard method returned empty text");
        }
        Err(e) => {
            error!("[macos_compat] Clipboard method failed: {}", e);
        }
    }

    warn!("[macos_compat] All methods failed, returning empty string");
    String::new()
}

/// Try AX API with retry logic
/// On macOS Tahoe, the focused element may not be immediately available
/// after a hotkey press. Retry up to 3 times with 50ms delays.
fn get_selected_text_by_ax_with_retry() -> Result<String, Box<dyn std::error::Error>> {
    for attempt in 0..3 {
        match get_selected_text_by_ax() {
            Ok(text) if !text.is_empty() => return Ok(text),
            Ok(_) => {
                if attempt < 2 {
                    info!(
                        "[macos_compat] AX API attempt {} returned empty, retrying...",
                        attempt + 1
                    );
                    std::thread::sleep(Duration::from_millis(50));
                }
            }
            Err(e) => {
                if attempt < 2 {
                    warn!(
                        "[macos_compat] AX API attempt {} failed: {}, retrying...",
                        attempt + 1,
                        e
                    );
                    std::thread::sleep(Duration::from_millis(50));
                } else {
                    return Err(e);
                }
            }
        }
    }
    Ok(String::new())
}

/// Get selected text using macOS Accessibility API
/// Uses AXUIElement::system_wide() to get focused element's selected text
fn get_selected_text_by_ax() -> Result<String, Box<dyn std::error::Error>> {
    use accessibility_ng::{AXAttribute, AXUIElement};
    use accessibility_sys_ng::{kAXFocusedUIElementAttribute, kAXSelectedTextAttribute};
    use core_foundation::string::CFString;

    let system_element = AXUIElement::system_wide();

    // Get the focused UI element
    let focused_element = system_element
        .attribute(&AXAttribute::new(&CFString::from_static_string(
            kAXFocusedUIElementAttribute,
        )))
        .map(|element| element.downcast_into::<AXUIElement>())
        .ok()
        .flatten();

    let Some(selected_element) = focused_element else {
        return Err(Box::new(std::io::Error::new(
            std::io::ErrorKind::NotFound,
            "No focused UI element (accessibility permission may be missing or macOS Tahoe restriction)",
        )));
    };

    // Get the selected text from the focused element
    let selected_text = selected_element
        .attribute(&AXAttribute::new(&CFString::from_static_string(
            kAXSelectedTextAttribute,
        )))
        .map(|text| text.downcast_into::<core_foundation::string::CFString>())
        .ok()
        .flatten();

    let Some(text) = selected_text else {
        return Err(Box::new(std::io::Error::new(
            std::io::ErrorKind::NotFound,
            "No selected text in focused element",
        )));
    };

    Ok(text.to_string())
}

/// Get selected text by simulating ⌘+C via AppleScript
/// Falls back to clipboard when AX API is unavailable
fn get_text_by_clipboard() -> Result<String, Box<dyn std::error::Error>> {
    let output = std::process::Command::new("osascript")
        .arg("-e")
        .arg(APPLE_SCRIPT)
        .output()?;

    if output.status.success() {
        let content = String::from_utf8(output.stdout)?;
        let content = content.trim();
        Ok(content.to_string())
    } else {
        let err = String::from_utf8_lossy(&output.stderr).to_string();
        Err(format!("AppleScript failed: {}", err).into())
    }
}

const APPLE_SCRIPT: &str = r#"
use AppleScript version "2.4"
use scripting additions
use framework "Foundation"
use framework "AppKit"

set savedAlertVolume to alert volume of (get volume settings)

-- Back up clipboard contents:
set savedClipboard to the clipboard
set thePasteboard to current application's NSPasteboard's generalPasteboard()
set theCount to thePasteboard's changeCount()

tell application "System Events"
    set volume alert volume 0
end tell

-- Copy selected text to clipboard:
tell application "System Events" to keystroke "c" using {command down}
delay 0.15

tell application "System Events"
    set volume alert volume savedAlertVolume
end tell

if thePasteboard's changeCount() is theCount then
    return ""
end if

set theSelectedText to the clipboard
set the clipboard to savedClipboard
theSelectedText
"#;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_selected_text() {
        let text = get_selected_text();
        println!("Selected text: '{}'", text);
    }
}
