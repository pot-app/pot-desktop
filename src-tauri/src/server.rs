use crate::config::{get, set};
use crate::window::*;
use log::{info, warn};
use std::thread;
use tiny_http::{Request, Response, Server};

pub fn start_server() {
    let port = match get("server_port") {
        Some(v) => v.as_i64().unwrap(),
        None => {
            set("server_port", 60828);
            60828
        }
    };
    thread::spawn(move || {
        let server = Server::http(format!("127.0.0.1:{port}")).unwrap();
        for request in server.incoming_requests() {
            http_handle(request);
        }
    });
}

fn http_handle(request: Request) {
    info!("Handle {} request", request.url());
    match request.url() {
        "/config" => handle_config(request),
        "/translate" => handle_translate(request),
        "/selection_translate" => handle_selection_translate(request),
        "/input_translate" => handle_input_translate(request),
        "/ocr_recognize" => handle_ocr_recognize(request),
        "/ocr_translate" => handle_ocr_translate(request),
        "/ocr_recognize?screenshot=false" => handle_ocr_recognize(request),
        "/ocr_translate?screenshot=false" => handle_ocr_translate(request),
        "/ocr_recognize?screenshot=true" => handle_ocr_recognize(request),
        "/ocr_translate?screenshot=true" => handle_ocr_translate(request),
        _ => warn!("Unknown request url: {}", request.url()),
    }
}

fn handle_config(request: Request) {
    config_window();
    response_ok(request);
}

fn handle_translate(mut request: Request) {
    let mut content = String::new();
    request.as_reader().read_to_string(&mut content).unwrap();
    text_translate(content);
    response_ok(request);
}

fn handle_selection_translate(request: Request) {
    selection_translate();
    response_ok(request);
}

fn handle_input_translate(request: Request) {
    input_translate();
    response_ok(request);
}

fn handle_ocr_recognize(request: Request) {
    if request.url().ends_with("false") {
        recognize_window();
    } else {
        ocr_recognize();
    }
    response_ok(request);
}

fn handle_ocr_translate(request: Request) {
    if request.url().ends_with("false") {
        image_translate();
    } else {
        ocr_translate();
    }
    response_ok(request);
}

fn response_ok(request: Request) {
    let response = Response::from_string("ok");
    request.respond(response).unwrap();
}
