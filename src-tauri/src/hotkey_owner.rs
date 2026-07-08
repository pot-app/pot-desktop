// Windows-only helper that tries to figure out *why* a global hotkey could not
// be registered, and — as far as the OS allows — *who* is holding it.
//
// Important Win32 limitation: `RegisterHotKey` only reports
// `ERROR_HOTKEY_ALREADY_REGISTERED (1409)` on conflict; Windows exposes no
// public API to map a key combination back to the owning process. So the best
// we can do reliably is:
//   * distinguish "the combo is genuinely free" (the conflict is inside pot)
//     from "the combo is held system-wide by something else", by probing with
//     our own `RegisterHotKey` call, and
//   * name the owner only for well-known *system* shortcuts via a lookup table.

use windows::Win32::Foundation::{ERROR_HOTKEY_ALREADY_REGISTERED, HWND};
use windows::Win32::UI::Input::KeyboardAndMouse::{
    RegisterHotKey, UnregisterHotKey, HOT_KEY_MODIFIERS, MOD_ALT, MOD_CONTROL, MOD_SHIFT, MOD_WIN,
};

// Arbitrary id used only for the throwaway probe registration.
const PROBE_HOTKEY_ID: i32 = 0x7A7A;

enum Conflict {
    /// The probe could register the combo on its own thread. This is only a
    /// hint: the probe cannot see a shortcut another app holds transiently
    /// (e.g. grabbed at login), nor pot's own per-thread registration.
    Free,
    /// The combination is already registered by another thread/process.
    HeldExternally,
    /// Registration failed for some other reason (with the raw Win32 code).
    WinError(u32, String),
    /// We could not parse the accelerator string into a modifiers+key pair.
    Unparseable,
}

/// Map a single pot key token (the vocabulary produced by the Hotkey settings
/// page) to a Windows virtual-key code.
fn key_to_vk(key: &str) -> Option<u32> {
    if key.chars().count() == 1 {
        let c = key.chars().next().unwrap();
        if c.is_ascii_alphabetic() {
            return Some(c.to_ascii_uppercase() as u32);
        }
        if c.is_ascii_digit() {
            return Some(c as u32);
        }
        return match c {
            '`' => Some(0xC0),  // VK_OEM_3
            '\\' => Some(0xDC), // VK_OEM_5
            '[' => Some(0xDB),  // VK_OEM_4
            ']' => Some(0xDD),  // VK_OEM_6
            ',' => Some(0xBC),  // VK_OEM_COMMA
            '=' => Some(0xBB),  // VK_OEM_PLUS
            '.' => Some(0xBE),  // VK_OEM_PERIOD
            '\'' => Some(0xDE), // VK_OEM_7
            ';' => Some(0xBA),  // VK_OEM_1
            '/' => Some(0xBF),  // VK_OEM_2
            '-' => Some(0xBD),  // VK_OEM_MINUS
            _ => None,
        };
    }

    // Function keys F1..F24
    if let Some(num) = key.strip_prefix('F') {
        if let Ok(n) = num.parse::<u32>() {
            if (1..=24).contains(&n) {
                return Some(0x70 + (n - 1)); // VK_F1 = 0x70
            }
        }
    }

    // Numpad keys: "Num0".."Num9", "NumAdd", "NumEnter", ...
    if let Some(rest) = key.strip_prefix("Num") {
        if let Ok(n) = rest.parse::<u32>() {
            if n <= 9 {
                return Some(0x60 + n); // VK_NUMPAD0 = 0x60
            }
        }
        return match rest {
            "Add" => Some(0x6B),
            "Subtract" => Some(0x6D),
            "Multiply" => Some(0x6A),
            "Divide" => Some(0x6F),
            "Decimal" => Some(0x6E),
            "Enter" => Some(0x0D),
            _ => None,
        };
    }

    match key {
        "PLUS" => Some(0xBB),
        "Up" => Some(0x26),
        "Down" => Some(0x28),
        "Left" => Some(0x25),
        "Right" => Some(0x27),
        "Backspace" => Some(0x08),
        "Capslock" => Some(0x14),
        "Contextmenu" => Some(0x5D),
        "Space" => Some(0x20),
        "Tab" => Some(0x09),
        "Convert" => Some(0x1C),
        "Delete" => Some(0x2E),
        "End" => Some(0x23),
        "Help" => Some(0x2F),
        "Home" => Some(0x24),
        "Pagedown" => Some(0x22),
        "Pageup" => Some(0x21),
        "Esc" => Some(0x1B),
        "Printscreen" => Some(0x2C),
        "Scrolllock" => Some(0x91),
        "Pause" => Some(0x13),
        "Insert" => Some(0x2D),
        "Suspend" => Some(0x5F),
        _ => None,
    }
}

/// Parse an accelerator like "Ctrl+Shift+A" into Win32 modifiers + virtual key.
fn parse_accelerator(accel: &str) -> Option<(HOT_KEY_MODIFIERS, u32)> {
    let mut mods = HOT_KEY_MODIFIERS(0);
    let mut vk: Option<u32> = None;
    for part in accel.split('+') {
        let p = part.trim();
        if p.is_empty() {
            continue;
        }
        match p {
            "Ctrl" | "Control" => mods = mods | MOD_CONTROL,
            "Shift" => mods = mods | MOD_SHIFT,
            "Alt" | "Option" => mods = mods | MOD_ALT,
            "Super" | "Win" | "Meta" | "Command" | "Cmd" => mods = mods | MOD_WIN,
            other => match key_to_vk(other) {
                Some(code) => vk = Some(code),
                None => return None,
            },
        }
    }
    vk.map(|v| (mods, v))
}

/// Probe whether the combination can currently be registered system-wide.
fn probe(accel: &str) -> Conflict {
    let (mods, vk) = match parse_accelerator(accel) {
        Some(parsed) => parsed,
        None => return Conflict::Unparseable,
    };
    unsafe {
        // NULL hwnd → the probe registers against the calling thread; we remove
        // it again immediately, so it never actually fires.
        match RegisterHotKey(HWND::default(), PROBE_HOTKEY_ID, mods, vk) {
            Ok(()) => {
                // It was free — clean up our probe registration immediately.
                let _ = UnregisterHotKey(HWND::default(), PROBE_HOTKEY_ID);
                Conflict::Free
            }
            Err(e) => {
                // HRESULT_FROM_WIN32: the low word carries the Win32 error code.
                let code = (e.code().0 as u32) & 0xFFFF;
                if code == ERROR_HOTKEY_ALREADY_REGISTERED.0 {
                    Conflict::HeldExternally
                } else {
                    Conflict::WinError(code, e.message())
                }
            }
        }
    }
}

/// Normalize an accelerator to an order-independent, lowercased token set so
/// the lookup table matches regardless of modifier ordering.
fn normalize(accel: &str) -> String {
    let mut parts: Vec<String> = accel
        .split('+')
        .map(|p| p.trim())
        .filter(|p| !p.is_empty())
        .map(|p| match p {
            "Super" | "Win" | "Meta" | "Command" | "Cmd" => "win".to_string(),
            "Control" | "Ctrl" => "ctrl".to_string(),
            other => other.to_ascii_lowercase(),
        })
        .collect();
    parts.sort();
    parts.join("+")
}

/// Best-effort owner name for well-known *system* shortcuts. Returns None for
/// anything that isn't a reserved OS combination.
fn known_owner(accel: &str) -> Option<&'static str> {
    let norm = normalize(accel);
    const TABLE: [(&str, &str); 15] = [
        ("Win+E", "Windows File Explorer (Win+E)"),
        ("Win+R", "Windows Run dialog (Win+R)"),
        ("Win+D", "Windows: Show desktop (Win+D)"),
        ("Win+L", "Windows: Lock screen (Win+L)"),
        ("Win+Tab", "Windows: Task view (Win+Tab)"),
        ("Win+A", "Windows: Action center (Win+A)"),
        ("Win+I", "Windows: Settings (Win+I)"),
        ("Win+S", "Windows: Search (Win+S)"),
        ("Win+Space", "Windows: Switch keyboard layout (Win+Space)"),
        ("Win+V", "Windows: Clipboard history (Win+V)"),
        ("Win+G", "Windows: Xbox Game Bar (Win+G)"),
        ("Win+Shift+S", "Windows: Snip & Sketch (Win+Shift+S)"),
        ("Ctrl+Shift+Esc", "Windows: Task Manager (Ctrl+Shift+Esc)"),
        ("Ctrl+Alt+Delete", "Windows: Security screen (Ctrl+Alt+Delete)"),
        ("Win+.", "Windows: Emoji panel (Win+.)"),
    ];
    TABLE
        .iter()
        .find(|(k, _)| normalize(k) == norm)
        .map(|(_, owner)| *owner)
}

/// Produce a human-readable explanation of a hotkey registration failure,
/// appended to the error shown to the user. Returns an empty string when there
/// is nothing useful to add.
pub fn describe_conflict(accel: &str) -> String {
    match probe(accel) {
        Conflict::Free => "A quick probe found this combination free right now, but the probe runs \
             on a different thread than pot's hotkey registration and cannot see a shortcut that \
             another app grabs only at login and releases later (e.g. a screenshot tool like \
             ShareX, Lightshot, OneDrive or Yandex), so it may still be taken. pot retries \
             automatically; if it keeps failing, close the app that uses this shortcut or pick a \
             different combination."
            .to_string(),
        Conflict::HeldExternally => match known_owner(accel) {
            Some(owner) => format!("Already held by: {}.", owner),
            None => "Already in use by another application (or another pot action). Windows does \
                 not reveal which process owns a global hotkey — close the conflicting program \
                 or pick a different shortcut."
                .to_string(),
        },
        Conflict::WinError(code, msg) => {
            format!("Windows rejected it (error {}): {}", code, msg.trim())
        }
        Conflict::Unparseable => String::new(),
    }
}
