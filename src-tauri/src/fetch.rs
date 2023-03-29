use reqwest::{Client, Method, Proxy};
use serde::Deserialize;

// 定义一个结构体来封装可选参数
#[derive(Deserialize)]
pub struct Options {
    method: Option<String>,
    query: Option<serde_json::Value>,
    headers: Option<serde_json::Value>,
    body: Option<serde_json::Value>,
    proxy: Option<String>,
}

// 使用tauri的command宏来标记函数
#[tauri::command]
pub async fn http_request(url: String, options: Option<Options>) -> Result<String, String> {
    // 创建一个客户端
    let mut client_builder = Client::builder();

    // 如果有proxy参数，设置代理
    if let Some(proxy) = options
        .as_ref()
        .and_then(|o| o.proxy.as_ref())
        .filter(|p| !p.is_empty())
    {
        if let Ok(proxy) = Proxy::all(proxy) {
            client_builder = client_builder.proxy(proxy);
        } else {
            return Err("Set Proxy Error".to_string());
        }
    }
    let client = client_builder.build().unwrap();

    // 如果有method参数，解析为Method类型，否则默认为GET
    let method = options
        .as_ref()
        .and_then(|o| o.method.as_ref())
        .map(|m| m.parse::<Method>().unwrap())
        .unwrap_or(Method::GET);

    // 创建一个请求构建器
    let mut request = client.request(method, url);

    // 如果有query参数，设置查询字符串
    if let Some(query) = options.as_ref().and_then(|o| o.query.as_ref()) {
        let query = serde_json::from_value::<Vec<(String, String)>>(query.clone()).unwrap();
        request = request.query(&query);
    }

    // 如果有headers参数，设置请求头
    if let Some(headers) = options.as_ref().and_then(|o| o.headers.as_ref()) {
        let headers = serde_json::from_value::<Vec<(String, String)>>(headers.clone()).unwrap();
        for (key, value) in headers {
            request = request.header(&key, &value);
        }
    }

    // 如果有body参数，设置请求体(一律发送字符串body)
    if let Some(body) = options.as_ref().and_then(|o| o.body.as_ref()) {
        let body_str = serde_json::from_value::<String>(body.clone()).unwrap();
        request = request.body(body_str)
    }

    // 发送请求并获取响应
    let response = match request.send().await {
        Ok(v) => v,
        Err(e) => return Err(e.to_string()),
    };

    // 将响应转换为字符串并返回
    Ok(response.text().await.unwrap())
}
