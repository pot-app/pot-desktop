use once_cell::sync::Lazy;
use lingua::{Language, LanguageDetector, LanguageDetectorBuilder};

static DETECTOR: Lazy<LanguageDetector> = Lazy::new(|| {
    let languages = vec![
        Language::Chinese,
        Language::Japanese,
        Language::English,
        Language::Korean,
        Language::French,
        Language::Spanish,
        Language::German,
        Language::Russian,
        Language::Italian,
        Language::Portuguese,
        Language::Turkish,
        Language::Arabic,
        Language::Vietnamese,
        Language::Thai,
        Language::Indonesian,
        Language::Malay,
        Language::Hindi,
        Language::Mongolian,
        Language::Bokmal,
        Language::Nynorsk,
        Language::Persian,
        Language::Ukrainian,
    ];
    LanguageDetectorBuilder::from_languages(&languages).build()
});

#[tauri::command]
pub fn lang_detect(text: &str) -> &str {
    match DETECTOR.detect_language_of(text) {
        Some(lang) => match lang {
            Language::Chinese => "zh_cn",
            Language::Japanese => "ja",
            Language::English => "en",
            Language::Korean => "ko",
            Language::French => "fr",
            Language::Spanish => "es",
            Language::German => "de",
            Language::Russian => "ru",
            Language::Italian => "it",
            Language::Portuguese => "pt_pt",
            Language::Turkish => "tr",
            Language::Arabic => "ar",
            Language::Vietnamese => "vi",
            Language::Thai => "th",
            Language::Indonesian => "id",
            Language::Malay => "ms",
            Language::Hindi => "hi",
            Language::Mongolian => "mn_cy",
            Language::Bokmal => "nb_no",
            Language::Nynorsk => "nn_no",
            Language::Persian => "fa",
            Language::Ukrainian => "uk",
        },
        None => "en",
    }
}
