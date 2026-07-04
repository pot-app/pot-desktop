use crate::config::app_config_dir;
use crate::error::Error;
use log::info;
use reqwest_dav::{Auth, ClientBuilder, Depth};
use std::io::Write;
use std::path::Path;
use walkdir::WalkDir;
use zip::read::ZipArchive;
use zip::write::SimpleFileOptions;

/// Pack config.json, history.db and plugins into a zip archive at `zip_path`.
fn backup_to_zip(zip_path: &Path) -> Result<(), Error> {
    let config_dir = app_config_dir();
    let config_path = config_dir.join("config.json");
    let database_path = config_dir.join("history.db");
    let plugin_path = config_dir.join("plugins");

    let zip_file = std::fs::File::create(zip_path)?;
    let mut zip = zip::ZipWriter::new(zip_file);
    let options = SimpleFileOptions::default().compression_method(zip::CompressionMethod::Stored);

    zip.start_file("config.json", options)?;
    zip.write(&std::fs::read(&config_path)?)?;

    if database_path.exists() {
        zip.start_file("history.db", options)?;
        zip.write(&std::fs::read(&database_path)?)?;
    }

    if plugin_path.exists() {
        for entry in WalkDir::new(&plugin_path) {
            let entry = entry?;
            let path = entry.path();
            let file_name = match path.strip_prefix(&config_dir)?.to_str() {
                Some(v) => v,
                None => return Err(Error::Error("Strip prefix error in backup".into())),
            };
            if path.is_file() {
                info!("packing {path:?} as {file_name:?} ...");
                zip.start_file(file_name, options)?;
                zip.write(&std::fs::read(path)?)?;
            }
        }
    }

    zip.finish()?;
    Ok(())
}

/// Extract a zip archive at `zip_path` into the app config directory.
fn restore_from_zip(zip_path: &Path) -> Result<(), Error> {
    let config_dir = app_config_dir();
    let mut zip_file = std::fs::File::open(zip_path)?;
    let mut zip = ZipArchive::new(&mut zip_file)?;
    zip.extract(&config_dir)?;
    Ok(())
}

#[tauri::command(async)]
pub async fn webdav(
    operate: &str,
    url: String,
    username: String,
    password: String,
    name: Option<String>,
) -> Result<String, Error> {
    // build a client
    let client = ClientBuilder::new()
        .set_host(url.clone())
        .set_auth(Auth::Basic(username.clone(), password.clone()))
        .build()?;
    client.mkcol("/pot-app").await.unwrap_or_default();
    let client = ClientBuilder::new()
        .set_host(format!("{}/pot-app", url.trim_end_matches("/")))
        .set_auth(Auth::Basic(username, password))
        .build()?;
    match operate {
        "list" => {
            let res = client.list("/", Depth::Number(1)).await?;
            let result = serde_json::to_string(&res)?;
            Ok(result)
        }
        "get" => {
            let res = client.get(&format!("/{}", name.unwrap())).await?;
            let data = res.bytes().await?;
            let zip_path = app_config_dir().join("archive.zip");
            std::fs::write(&zip_path, &data)?;
            restore_from_zip(&zip_path)?;
            Ok("".to_string())
        }
        "put" => {
            let zip_path = app_config_dir().join("archive.zip");
            backup_to_zip(&zip_path)?;
            match client
                .put(&format!("/{}", name.unwrap()), std::fs::read(&zip_path)?)
                .await
            {
                Ok(()) => Ok("".to_string()),
                Err(e) => Err(Error::Error(format!("WebDav Put Error: {e}").into())),
            }
        }

        "delete" => match client.delete(&format!("/{}", name.unwrap())).await {
            Ok(()) => Ok("".to_string()),
            Err(e) => Err(Error::Error(format!("WebDav Delete Error: {e}").into())),
        },
        _ => Err(Error::Error(format!("WebDav Operate Error: {operate}").into())),
    }
}

#[tauri::command(async)]
pub async fn local(operate: &str, path: String) -> Result<String, Error> {
    match operate {
        "put" => {
            backup_to_zip(Path::new(&path))?;
            Ok("".to_string())
        }
        "get" => {
            restore_from_zip(Path::new(&path))?;
            Ok("".to_string())
        }
        _ => Err(Error::Error(format!("Local Operate Error: {operate}").into())),
    }
}

#[tauri::command(async)]
pub async fn aliyun(operate: &str, path: String, url: String) -> Result<String, Error> {
    match operate {
        "put" => {
            let _ = reqwest::Client::new()
                .put(&url)
                .body(std::fs::read(&path)?)
                .send()
                .await?;
            Ok("".to_string())
        }
        "get" => {
            let res = reqwest::Client::new().get(&url).send().await?;
            let data = res.bytes().await?;
            let zip_path = app_config_dir().join("archive.zip");
            std::fs::write(&zip_path, &data)?;
            restore_from_zip(&zip_path)?;
            Ok("".to_string())
        }
        _ => Err(Error::Error(format!("Local Operate Error: {operate}").into())),
    }
}
