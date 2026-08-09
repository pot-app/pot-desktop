use crate::config::get;
use crate::window::{input_translate, ocr_recognize, ocr_translate, selection_translate};
use crate::APP;
use ashpd::desktop::global_shortcuts::{GlobalShortcuts, NewShortcut};
use ashpd::WindowIdentifier;
use async_channel::{Receiver, Sender};
use futures_util::future::{select, Either};
use futures_util::StreamExt;
use log::{info, warn};
use once_cell::sync::OnceCell;
use std::collections::HashSet;
use std::sync::Mutex;

#[derive(Clone, Copy)]
struct Reload {
    force_bind: bool,
}

static COMMAND_SENDER: OnceCell<Mutex<Option<Sender<Reload>>>> = OnceCell::new();

pub fn is_wayland_session() -> bool {
    std::env::var("XDG_SESSION_TYPE")
        .map(|value| value.eq_ignore_ascii_case("wayland"))
        .unwrap_or_else(|_| std::env::var_os("WAYLAND_DISPLAY").is_some())
}

pub fn start() -> Result<(), String> {
    send_reload(false)
}

pub fn reload() -> Result<(), String> {
    send_reload(true)
}

fn send_reload(force_bind: bool) -> Result<(), String> {
    let sender_slot = COMMAND_SENDER.get_or_init(|| Mutex::new(None));
    let mut sender = sender_slot.lock().map_err(|error| error.to_string())?;

    if sender.as_ref().map(Sender::is_closed).unwrap_or(true) {
        let (new_sender, receiver) = async_channel::unbounded();
        *sender = Some(new_sender);
        std::thread::spawn(move || {
            if let Err(error) = async_std::task::block_on(run(receiver)) {
                warn!("Wayland global shortcuts portal stopped: {error}");
            }
            if let Some(sender_slot) = COMMAND_SENDER.get() {
                if let Ok(mut sender) = sender_slot.lock() {
                    *sender = None;
                }
            }
        });
    }

    sender
        .as_ref()
        .expect("Wayland shortcut sender was initialized")
        .send_blocking(Reload { force_bind })
        .map_err(|error| error.to_string())
}

async fn run(receiver: Receiver<Reload>) -> Result<(), String> {
    let portal = GlobalShortcuts::new()
        .await
        .map_err(|error| error.to_string())?;
    info!("Using the XDG Global Shortcuts portal");
    let mut activated = Box::pin(
        portal
            .receive_activated()
            .await
            .map_err(|error| error.to_string())?,
    );

    let mut command = match receiver.recv().await {
        Ok(command) => command,
        Err(_) => return Ok(()),
    };

    'commands: loop {
        let configured = configured_shortcuts();
        if configured.is_empty() {
            info!("No Wayland global shortcuts are configured");
            command = match receiver.recv().await {
                Ok(command) => command,
                Err(_) => return Ok(()),
            };
            continue 'commands;
        }

        let session = portal
            .create_session()
            .await
            .map_err(|error| error.to_string())?;
        let listed = portal
            .list_shortcuts(&session)
            .await
            .and_then(|request| request.response())
            .map_err(|error| error.to_string())?;
        let existing_ids = listed
            .shortcuts()
            .iter()
            .map(|shortcut| shortcut.id())
            .collect::<HashSet<_>>();
        let missing_shortcut = configured
            .iter()
            .any(|(id, _, _)| !existing_ids.contains(id.as_str()));

        if command.force_bind || missing_shortcut || existing_ids.is_empty() {
            let shortcuts = configured
                .iter()
                .map(|(id, description, trigger)| {
                    NewShortcut::new(id.clone(), *description)
                        .preferred_trigger(Some(trigger.as_str()))
                })
                .collect::<Vec<_>>();
            let bound = portal
                .bind_shortcuts(&session, &shortcuts, &WindowIdentifier::default())
                .await
                .and_then(|request| request.response())
                .map_err(|error| error.to_string())?;
            for shortcut in bound.shortcuts() {
                info!(
                    "Registered Wayland global shortcut: {} ({})",
                    shortcut.id(),
                    shortcut.trigger_description()
                );
            }
        } else {
            for shortcut in listed.shortcuts() {
                info!(
                    "Restored Wayland global shortcut: {} ({})",
                    shortcut.id(),
                    shortcut.trigger_description()
                );
            }
        }

        loop {
            let reload = receiver.recv();
            futures_util::pin_mut!(reload);
            match select(activated.next(), reload).await {
                Either::Left((Some(event), _)) => activate(event.shortcut_id()),
                Either::Left((None, _)) => {
                    return Err("global shortcuts activation stream ended".to_owned())
                }
                Either::Right((Ok(next_command), _)) => {
                    session.close().await.map_err(|error| error.to_string())?;
                    command = next_command;
                    continue 'commands;
                }
                Either::Right((Err(_), _)) => {
                    let _ = session.close().await;
                    return Ok(());
                }
            }
        }
    }
}

fn configured_shortcuts() -> Vec<(String, &'static str, String)> {
    [
        ("hotkey_selection_translate", "Selection translation"),
        ("hotkey_input_translate", "Input translation"),
        ("hotkey_ocr_recognize", "Screenshot OCR"),
        ("hotkey_ocr_translate", "Screenshot translation"),
    ]
    .into_iter()
    .filter_map(|(id, description)| {
        let shortcut = get(id)?.as_str()?.to_owned();
        shortcut_to_xdg(&shortcut).map(|trigger| (id.to_owned(), description, trigger))
    })
    .collect()
}

fn shortcut_to_xdg(shortcut: &str) -> Option<String> {
    let mut parts = shortcut
        .split('+')
        .filter(|part| !part.is_empty())
        .peekable();
    let mut converted = Vec::new();

    while let Some(part) = parts.next() {
        let is_key = parts.peek().is_none();
        let value = if is_key {
            xdg_key(part)?
        } else {
            match part.to_ascii_lowercase().as_str() {
                "ctrl" | "control" => "CTRL".to_owned(),
                "alt" => "ALT".to_owned(),
                "shift" => "SHIFT".to_owned(),
                "super" | "command" | "meta" => "LOGO".to_owned(),
                "num" => "NUM".to_owned(),
                _ => return None,
            }
        };
        converted.push(value);
    }

    (!converted.is_empty()).then(|| converted.join("+"))
}

fn xdg_key(key: &str) -> Option<String> {
    let mapped = match key {
        "`" => "grave",
        "\\" => "backslash",
        "[" => "bracketleft",
        "]" => "bracketright",
        "," => "comma",
        "=" => "equal",
        "-" => "minus",
        "PLUS" | "+" => "plus",
        "." => "period",
        "'" => "apostrophe",
        ";" => "semicolon",
        "/" => "slash",
        "Space" => "space",
        "Capslock" => "Caps_Lock",
        "Contextmenu" => "Menu",
        "Pagedown" => "Page_Down",
        "Pageup" => "Page_Up",
        "Esc" => "Escape",
        "Printscreen" => "Print",
        "Scrolllock" => "Scroll_Lock",
        key if key.len() == 1 => return Some(key.to_ascii_lowercase()),
        key if key.starts_with('F')
            && key[1..].chars().all(|character| character.is_ascii_digit()) =>
        {
            return Some(key.to_owned())
        }
        key if key
            .chars()
            .all(|character| character.is_ascii_alphanumeric() || character == '_') =>
        {
            return Some(key.to_owned())
        }
        _ => return None,
    };
    Some(mapped.to_owned())
}

fn activate(shortcut_id: &str) {
    let shortcut_id = shortcut_id.to_owned();
    let app_handle = APP.get().expect("app handle is initialized").clone();
    if let Err(error) = app_handle.run_on_main_thread(move || match shortcut_id.as_str() {
        "hotkey_selection_translate" => selection_translate(),
        "hotkey_input_translate" => input_translate(),
        "hotkey_ocr_recognize" => ocr_recognize(),
        "hotkey_ocr_translate" => ocr_translate(),
        _ => warn!("Unknown Wayland global shortcut: {shortcut_id}"),
    }) {
        warn!("Failed to handle Wayland global shortcut: {error}");
    }
}

#[cfg(test)]
mod tests {
    use super::shortcut_to_xdg;

    #[test]
    fn converts_tauri_shortcuts_to_xdg_triggers() {
        assert_eq!(
            shortcut_to_xdg("Ctrl+'"),
            Some("CTRL+apostrophe".to_owned())
        );
        assert_eq!(
            shortcut_to_xdg("Ctrl+Shift+A"),
            Some("CTRL+SHIFT+a".to_owned())
        );
        assert_eq!(
            shortcut_to_xdg("Super+Space"),
            Some("LOGO+space".to_owned())
        );
        assert_eq!(shortcut_to_xdg("Ctrl+PLUS"), Some("CTRL+plus".to_owned()));
    }
}
