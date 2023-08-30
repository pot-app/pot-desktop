use log::error;
use reqwest_dav::{Auth, ClientBuilder, Depth};

#[tauri::command(async)]
pub async fn backup_list(
    url: String,
    username: String,
    password: String,
) -> Result<String, String> {
    // build a client
    let client = match ClientBuilder::new()
        .set_host(url)
        .set_auth(Auth::Basic(username, password))
        .build()
    {
        Ok(v) => v,
        Err(e) => {
            error!("Build WebDav Client Error: {}", e);
            return Err(format!("Build WebDav Client Error: {}", e));
        }
    };
    match client.mkcol("/pot-app").await {
        Ok(()) => {}
        Err(e) => {
            error!("WebDav Mkcol Error: {}", e);
            return Err(format!("WebDav Mkcol Error: {}", e));
        }
    };
    let res = match client.list("pot-app", Depth::Number(1)).await {
        Ok(v) => v,
        Err(e) => {
            error!("WebDav List Error: {}", e);
            return Err(format!("WebDav List Error: {}", e));
        }
    };
    match serde_json::to_string(&res) {
        Ok(v) => Ok(v),
        Err(e) => {
            error!("WebDav List Json Error: {}", e);
            Err(format!("WebDav List Json Error: {}", e))
        }
    }
}

#[tauri::command(async)]
pub async fn get_backup(
    url: String,
    username: String,
    password: String,
    name: String,
) -> Result<String, String> {
    // build a client
    let client = match ClientBuilder::new()
        .set_host(url)
        .set_auth(Auth::Basic(username, password))
        .build()
    {
        Ok(v) => v,
        Err(e) => {
            error!("Build WebDav Client Error: {}", e);
            return Err(format!("Build WebDav Client Error: {}", e));
        }
    };
    match client.mkcol("/pot-app").await {
        Ok(()) => {}
        Err(e) => {
            error!("WebDav Mkcol Error: {}", e);
            return Err(format!("WebDav Mkcol Error: {}", e));
        }
    };
    let res = match client.get(&format!("pot-app/{name}")).await {
        Ok(v) => v,
        Err(e) => {
            error!("WebDav Get Error: {}", e);
            return Err(format!("WebDav Get Error: {}", e));
        }
    };
    match res.text().await {
        Ok(v) => Ok(v),
        Err(e) => {
            error!("WebDav Get Text Error: {}", e);
            Err(format!("WebDav Get Text Error: {}", e))
        }
    }
}

#[tauri::command(async)]
pub async fn put_backup(
    url: String,
    username: String,
    password: String,
    name: String,
    body: String,
) -> Result<(), String> {
    // build a client
    let client = match ClientBuilder::new()
        .set_host(url)
        .set_auth(Auth::Basic(username, password))
        .build()
    {
        Ok(v) => v,
        Err(e) => {
            error!("Build WebDav Client Error: {}", e);
            return Err(format!("Build WebDav Client Error: {}", e));
        }
    };
    match client.mkcol("/pot-app").await {
        Ok(()) => {}
        Err(e) => {
            error!("WebDav Mkcol Error: {}", e);
            return Err(format!("WebDav Mkcol Error: {}", e));
        }
    };

    match client.put(&format!("pot-app/{name}"), body).await {
        Ok(()) => return Ok(()),
        Err(e) => {
            error!("WebDav Put Error: {}", e);
            return Err(format!("WebDav Put Error: {}", e));
        }
    }
}

#[tauri::command(async)]
pub async fn delete_backup(
    url: String,
    username: String,
    password: String,
    name: String,
) -> Result<(), String> {
    // build a client
    let client = match ClientBuilder::new()
        .set_host(url)
        .set_auth(Auth::Basic(username, password))
        .build()
    {
        Ok(v) => v,
        Err(e) => {
            error!("Build WebDav Client Error: {}", e);
            return Err(format!("Build WebDav Client Error: {}", e));
        }
    };
    match client.mkcol("/pot-app").await {
        Ok(()) => {}
        Err(e) => {
            error!("WebDav Mkcol Error: {}", e);
            return Err(format!("WebDav Mkcol Error: {}", e));
        }
    };

    match client.delete(&format!("pot-app/{name}")).await {
        Ok(()) => return Ok(()),
        Err(e) => {
            error!("WebDav Delete Error: {}", e);
            return Err(format!("WebDav Delete Error: {}", e));
        }
    }
}
