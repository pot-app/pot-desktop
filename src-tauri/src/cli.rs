use crate::window::{
    config_window, input_translate, ocr_recognize, ocr_translate, selection_translate,
};
use log::warn;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
enum Action {
    Config,
    SelectionTranslate,
    InputTranslate,
    OcrRecognize,
    OcrTranslate,
}

pub fn handle_args(app_handle: &tauri::AppHandle, args: &[String]) -> bool {
    let Some(action) = action_from_args(args) else {
        return false;
    };

    if let Err(error) = app_handle.run_on_main_thread(move || match action {
        Action::Config => config_window(),
        Action::SelectionTranslate => selection_translate(),
        Action::InputTranslate => input_translate(),
        Action::OcrRecognize => ocr_recognize(),
        Action::OcrTranslate => ocr_translate(),
    }) {
        warn!("Failed to handle command-line action: {error}");
    }

    true
}

fn action_from_args(args: &[String]) -> Option<Action> {
    args.iter().find_map(|argument| match argument.as_str() {
        "--config" => Some(Action::Config),
        "--selection-translate" => Some(Action::SelectionTranslate),
        "--input-translate" => Some(Action::InputTranslate),
        "--ocr-recognize" => Some(Action::OcrRecognize),
        "--ocr-translate" => Some(Action::OcrTranslate),
        _ => None,
    })
}

#[cfg(test)]
mod tests {
    use super::{action_from_args, Action};

    #[test]
    fn parses_action_flags() {
        assert_eq!(
            action_from_args(&["pot".to_owned(), "--selection-translate".to_owned()]),
            Some(Action::SelectionTranslate)
        );
        assert_eq!(action_from_args(&["pot".to_owned()]), None);
    }
}
