use crate::config::get;
use crate::config::StoreWrapper;
use crate::error::Error;
use crate::StringWrapper;
use crate::APP;
use anyhow::anyhow;
use log::{error, info};
use msedge_tts::tts::client::connect_async;
use msedge_tts::tts::client::MSEdgeTTSClientAsync;
use msedge_tts::tts::SpeechConfig;
use msedge_tts::voice::get_voices_list_async;
use rodio::Sink;
use serde_json::{json, Value};
use std::collections::HashMap;
use std::io::Read;
use std::sync::Arc;
use std::sync::LazyLock;
use std::sync::OnceLock;
use tauri::Manager;

#[tauri::command]
pub fn get_text(state: tauri::State<StringWrapper>) -> String {
    return state.0.lock().unwrap().to_string();
}

#[tauri::command]
pub fn reload_store() {
    let state = APP.get().unwrap().state::<StoreWrapper>();
    let mut store = state.0.lock().unwrap();
    store.load().unwrap();
}

#[tauri::command]
pub fn cut_image(left: u32, top: u32, width: u32, height: u32, app_handle: tauri::AppHandle) {
    use dirs::cache_dir;
    use image::GenericImage;
    info!("Cut image: {}x{}+{}+{}", width, height, left, top);
    let mut app_cache_dir_path = cache_dir().expect("Get Cache Dir Failed");
    app_cache_dir_path.push(&app_handle.config().tauri.bundle.identifier);
    app_cache_dir_path.push("pot_screenshot.png");
    if !app_cache_dir_path.exists() {
        return;
    }
    let mut img = match image::open(&app_cache_dir_path) {
        Ok(v) => v,
        Err(e) => {
            error!("{:?}", e.to_string());
            return;
        }
    };
    let img2 = img.sub_image(left, top, width, height);
    app_cache_dir_path.pop();
    app_cache_dir_path.push("pot_screenshot_cut.png");
    match img2.to_image().save(&app_cache_dir_path) {
        Ok(_) => {}
        Err(e) => {
            error!("{:?}", e.to_string());
        }
    }
}

#[tauri::command]
pub fn get_base64(app_handle: tauri::AppHandle) -> String {
    use base64::{engine::general_purpose, Engine as _};
    use dirs::cache_dir;
    use std::fs::File;
    use std::io::Read;
    let mut app_cache_dir_path = cache_dir().expect("Get Cache Dir Failed");
    app_cache_dir_path.push(&app_handle.config().tauri.bundle.identifier);
    app_cache_dir_path.push("pot_screenshot_cut.png");
    if !app_cache_dir_path.exists() {
        return "".to_string();
    }
    let mut file = File::open(app_cache_dir_path).unwrap();
    let mut vec = Vec::new();
    match file.read_to_end(&mut vec) {
        Ok(_) => {}
        Err(e) => {
            error!("{:?}", e.to_string());
            return "".to_string();
        }
    }
    let base64 = general_purpose::STANDARD.encode(&vec);
    base64.replace("\r\n", "")
}

#[tauri::command]
pub fn copy_img(app_handle: tauri::AppHandle, width: usize, height: usize) -> Result<(), Error> {
    use arboard::{Clipboard, ImageData};
    use dirs::cache_dir;
    use image::ImageReader;
    use std::borrow::Cow;

    let mut app_cache_dir_path = cache_dir().expect("Get Cache Dir Failed");
    app_cache_dir_path.push(&app_handle.config().tauri.bundle.identifier);
    app_cache_dir_path.push("pot_screenshot_cut.png");
    let data = ImageReader::open(app_cache_dir_path)?.decode()?;

    let img = ImageData {
        width,
        height,
        bytes: Cow::from(data.as_bytes()),
    };
    Clipboard::new()?.set_image(img)?;
    Ok(())
}

#[tauri::command]
pub fn set_proxy() -> Result<bool, ()> {
    let host = match get("proxy_host") {
        Some(v) => v.as_str().unwrap().to_string(),
        None => return Err(()),
    };
    let port = match get("proxy_port") {
        Some(v) => v.as_i64().unwrap(),
        None => return Err(()),
    };
    let no_proxy = match get("no_proxy") {
        Some(v) => v.as_str().unwrap().to_string(),
        None => return Err(()),
    };
    let proxy = format!("http://{}:{}", host, port);

    std::env::set_var("http_proxy", &proxy);
    std::env::set_var("https_proxy", &proxy);
    std::env::set_var("all_proxy", &proxy);
    std::env::set_var("no_proxy", &no_proxy);
    Ok(true)
}

#[tauri::command]
pub fn unset_proxy() -> Result<bool, ()> {
    std::env::remove_var("http_proxy");
    std::env::remove_var("https_proxy");
    std::env::remove_var("all_proxy");
    std::env::remove_var("no_proxy");
    Ok(true)
}

#[tauri::command]
pub fn install_plugin(path_list: Vec<String>) -> Result<i32, Error> {
    let mut success_count = 0;

    for path in path_list {
        if !path.ends_with("potext") {
            continue;
        }
        let path = std::path::Path::new(&path);
        let file_name = path.file_name().unwrap().to_str().unwrap();
        let file_name = file_name.replace(".potext", "");
        if !file_name.starts_with("plugin") {
            return Err(Error::Error(
                "Invalid Plugin: file name must start with plugin".into(),
            ));
        }

        let mut zip = zip::ZipArchive::new(std::fs::File::open(path)?)?;
        #[allow(unused_mut)]
        let mut plugin_type: String;
        if let Ok(mut info) = zip.by_name("info.json") {
            let mut content = String::new();
            info.read_to_string(&mut content)?;
            let json: serde_json::Value = serde_json::from_str(&content)?;
            plugin_type = json["plugin_type"]
                .as_str()
                .ok_or(Error::Error("can't find plugin type in info.json".into()))?
                .to_string();
        } else {
            return Err(Error::Error("Invalid Plugin: miss info.json".into()));
        }
        if zip.by_name("main.js").is_err() {
            return Err(Error::Error("Invalid Plugin: miss main.js".into()));
        }
        let config_path = dirs::config_dir().unwrap();
        let config_path =
            config_path.join(APP.get().unwrap().config().tauri.bundle.identifier.clone());
        let config_path = config_path.join("plugins");
        let config_path = config_path.join(plugin_type);
        let plugin_path = config_path.join(file_name);
        std::fs::create_dir_all(&config_path)?;
        zip.extract(&plugin_path)?;

        success_count += 1;
    }
    Ok(success_count)
}

#[tauri::command]
pub fn run_binary(
    plugin_type: String,
    plugin_name: String,
    cmd_name: String,
    args: Vec<String>,
) -> Result<Value, Error> {
    #[cfg(target_os = "windows")]
    use std::os::windows::process::CommandExt;
    use std::process::Command;

    let config_path = dirs::config_dir().unwrap();
    let config_path = config_path.join(APP.get().unwrap().config().tauri.bundle.identifier.clone());
    let config_path = config_path.join("plugins");
    let config_path = config_path.join(plugin_type);
    let plugin_path = config_path.join(plugin_name);

    #[cfg(target_os = "windows")]
    let mut cmd = Command::new("cmd");
    #[cfg(target_os = "windows")]
    let cmd = cmd.creation_flags(0x08000000);
    #[cfg(target_os = "windows")]
    let cmd = cmd.args(["/c", &cmd_name]);
    #[cfg(not(target_os = "windows"))]
    let mut cmd = Command::new(&cmd_name);

    let output = cmd.args(args).current_dir(plugin_path).output()?;
    Ok(json!({
        "stdout": String::from_utf8_lossy(&output.stdout).to_string(),
        "stderr": String::from_utf8_lossy(&output.stderr).to_string(),
        "status": output.status.code().unwrap_or(-1),
    }))
}

#[tauri::command]
pub fn font_list() -> Result<Vec<String>, Error> {
    use font_kit::source::SystemSource;
    let source = SystemSource::new();

    Ok(source.all_families()?)
}

#[tauri::command]
pub fn open_devtools(window: tauri::Window) {
    if !window.is_devtools_open() {
        window.open_devtools();
    } else {
        window.close_devtools();
    }
}

type VoiceIdList = Vec<msedge_tts::voice::Voice>;
type VoiceIdMap = HashMap<String, msedge_tts::voice::Voice>;
type VoiceConnectionMap = HashMap<String, MSEdgeTTSClientAsync<async_std::net::TcpStream>>;

static EDGE_VOICE_ID_CACHE: OnceLock<parking_lot::RwLock<VoiceIdMap>> = std::sync::OnceLock::new();
static VOICE_CONNECTION_CACHE: LazyLock<async_std::sync::Mutex<VoiceConnectionMap>> =
    LazyLock::new(|| async_std::sync::Mutex::new(VoiceConnectionMap::new()));

async fn get_edge_tts_voice_list() -> Result<VoiceIdList, Error> {
    let voice_list = get_voices_list_async().await?;

    Ok(voice_list)
}

#[tauri::command(async)]
pub async fn get_edge_tts_voice_data(voice_short_id: &str, text: &str) -> Result<Vec<u8>, Error> {
    if voice_short_id.is_empty() {
        return Err(anyhow!("voice_short_id is empty").into());
    }
    // We try to use the `short_name` last word to compare with `name` if `short_name` is None
    let last = voice_short_id
        .split('-')
        .last()
        .expect("voice_short_id nerver empty");
    // we will to get the `voice_config` from voice_list and update the voice_cache
    let config = if let Some(voice_map) = EDGE_VOICE_ID_CACHE.get() {
        let c: Option<SpeechConfig> = {
            let read_map = voice_map.read();
            read_map.get(voice_short_id).map(SpeechConfig::from)
        };
        match c {
            Some(c) => c,
            None => {
                if let Some(voice) = get_edge_tts_voice_list()
                    .await?
                    .into_iter()
                    .find(|v| match &v.short_name {
                        Some(v) => v.contains(last),
                        None => v.name.contains(last),
                    })
                {
                    let cc = SpeechConfig::from(&voice);
                    voice_map.write().insert(voice_short_id.into(), voice);
                    cc
                } else {
                    let err = anyhow!("voice not found: {},valid voice id as you can see: https://gist.github.com/BettyJJ/17cbaa1de96235a7f5773b8690a20462",voice_short_id);
                    Err(err)?
                }
            }
        }
    } else {
        let mut ret: Option<SpeechConfig> = None;
        let new_voice_map: HashMap<_, _> = get_edge_tts_voice_list()
            .await?
            .into_iter()
            .map(|v| {
                (
                    match v.short_name.clone() {
                        Some(vv) => {
                            if vv.contains(last) {
                                ret = Some(SpeechConfig::from(&v));
                            }
                            vv
                        }
                        None => {
                            if v.name.contains(last) {
                                ret = Some(SpeechConfig::from(&v));
                            }
                            v.name.clone()
                        }
                    },
                    v,
                )
            })
            .collect();
        if EDGE_VOICE_ID_CACHE
            .set(parking_lot::RwLock::new(new_voice_map))
            .is_err()
        {
            error!("set voice cache failed: key:{}", voice_short_id);
        }
        ret.ok_or_else(|| anyhow!("voice not found: {}", voice_short_id))?
    };

    // then, we can get the `tts_connection` and update the connection cache for reuse the connection
    // TODO: It can optimize this `Mutex` when `MSEdgeTTSClientAsync` is clonable
    let mut voice_cache = VOICE_CONNECTION_CACHE.lock().await;
    let audio_data = match voice_cache.entry(voice_short_id.into()) {
        std::collections::hash_map::Entry::Occupied(mut occupied_entry) => {
            let conn = occupied_entry.get_mut();
            match conn.synthesize(text, &config).await {
                Err(e) => {
                    error!("synthesize failed: {e},and we will retry it later");
                    let mut new_conn = connect_async().await?;
                    let data = new_conn.synthesize(text, &config).await?;
                    occupied_entry.insert(new_conn);
                    data
                }
                Ok(v) => v,
            }
        }
        std::collections::hash_map::Entry::Vacant(vacant_entry) => {
            let conn = connect_async().await?;
            vacant_entry.insert(conn).synthesize(text, &config).await?
        }
    };

    Ok(audio_data.audio_bytes)
}

type RodioSink = parking_lot::Mutex<Option<(Arc<Sink>, String)>>;

static CURRENT_SINK: LazyLock<RodioSink> =
    std::sync::LazyLock::new(|| parking_lot::Mutex::new(None));

#[tauri::command(async)]
pub async fn get_edge_tts_voice_data_and_play(
    voice_short_id: &str,
    text: &str,
) -> Result<(), Error> {
    // Stop the previous audio if it is playing
    {
        let mut updater = CURRENT_SINK.lock();
        if let Some((sink, prev_text)) = updater.take() {
            if sink.is_paused() {
                // do nothing
            } else if text == prev_text {
                info!("The same text is playing,And you are in the first stage,then we trust you want to stop it");
                sink.stop();
                sink.clear();
                return Ok(());
            } else {
                sink.stop();
                sink.clear();
            }
        }
    }
    // Play the new audio,and update the sink
    let data = get_edge_tts_voice_data(voice_short_id, text).await?;
    let (_stream, stream_handle) = rodio::OutputStream::try_default()?;
    let sink = Arc::new(stream_handle.play_once(std::io::Cursor::new(data))?);
    {
        let mut updater = CURRENT_SINK.lock();
        if let Some((sink_, prev_text)) = updater.take() {
            if sink_.is_paused() {
                // do nothing
            } else if text == prev_text {
                info!("The same text is playing,And you are in the second stage,so we trust the network delay is too long,and stop your request");
                sink.stop();
                sink.clear();
                return Ok(());
            }
        }
        *updater = Some((Arc::clone(&sink), text.to_string()));
    }
    sink.sleep_until_end();
    Ok(())
}
