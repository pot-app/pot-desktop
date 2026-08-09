#[cfg(target_os = "linux")]
mod platform {
    use log::{debug, warn};
    use std::error::Error;
    use std::io::Read;
    use std::time::Duration;
    use wl_clipboard_rs::paste::{get_contents, ClipboardType, MimeType, Seat};
    use wl_clipboard_rs::utils::is_primary_selection_supported;
    use x11_clipboard::Clipboard;

    pub fn get() -> String {
        let session_type = std::env::var("XDG_SESSION_TYPE")
            .unwrap_or_default()
            .to_ascii_lowercase();

        let result = if session_type == "wayland" || std::env::var_os("WAYLAND_DISPLAY").is_some() {
            get_on_wayland().or_else(|wayland_error| {
                debug!("Wayland primary selection unavailable: {wayland_error}");
                get_on_x11()
            })
        } else {
            get_on_x11()
        };

        match result {
            Ok(text) => normalize(text),
            Err(error) => {
                warn!("Failed to read selected text: {error}");
                String::new()
            }
        }
    }

    fn get_on_wayland() -> Result<String, Box<dyn Error>> {
        if !is_primary_selection_supported()? {
            return Err("the compositor does not support the primary-selection protocol".into());
        }

        let (mut pipe, _) =
            get_contents(ClipboardType::Primary, Seat::Unspecified, MimeType::Text)?;
        let mut contents = Vec::new();
        pipe.read_to_end(&mut contents)?;
        Ok(String::from_utf8_lossy(&contents).into_owned())
    }

    fn get_on_x11() -> Result<String, Box<dyn Error>> {
        if std::env::var_os("DISPLAY").is_none() {
            return Err("DISPLAY is not set".into());
        }

        let clipboard = Clipboard::new()?;
        let primary = clipboard.load(
            clipboard.getter.atoms.primary,
            clipboard.getter.atoms.utf8_string,
            clipboard.getter.atoms.property,
            Duration::from_millis(300),
        )?;
        Ok(String::from_utf8_lossy(&primary).into_owned())
    }

    fn normalize(text: String) -> String {
        text.trim_matches(|character: char| character == '\0' || character.is_whitespace())
            .to_owned()
    }

    #[cfg(test)]
    mod tests {
        use super::normalize;

        #[test]
        fn normalizes_selection_text() {
            assert_eq!(
                normalize("\0  selected text  \0".to_owned()),
                "selected text"
            );
        }
    }
}

pub fn get_text() -> String {
    #[cfg(target_os = "linux")]
    {
        platform::get()
    }

    #[cfg(not(target_os = "linux"))]
    {
        selection::get_text()
    }
}
