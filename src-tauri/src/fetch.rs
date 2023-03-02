use crate::CONFIG;
use reqwest::{ClientBuilder, Method, NoProxy, Proxy};
use serde_json::Value;

#[tauri::command]
pub async fn fetch(method: &str, url: &str, query: Value) -> Result<String, String> {
    let config = CONFIG.get().unwrap();

    let proxy = match config.proxy.as_str() {
        "" => Proxy::all("https://localhost")
            .unwrap()
            .no_proxy(NoProxy::from_string("*")),
        _ => Proxy::all(&config.proxy).unwrap(),
    };

    let method = match method {
        "GET" => Method::GET,
        "POST" => Method::POST,
        _ => Method::GET,
    };
    let client = ClientBuilder::default().proxy(proxy).build().unwrap();
    let mut query_list: Vec<(String, String)> = Vec::new();
    for i in query.as_object().unwrap() {
        query_list.push(((i.0).to_owned(), (i.1).as_str().unwrap().to_string()));
    }

    let response = client
        .request(method, url)
        .query(&query_list)
        .send()
        .await
        .unwrap();
    println!("{:?}", response);
    Ok(response.text().await.unwrap())
}
