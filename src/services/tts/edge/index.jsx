import { invoke } from '@tauri-apps/api/tauri'

export async function tts(text, lang, options = {}) {
    const { config } = options;

    // `requestPath` will be used as voice short name id in ms edge tts
    let { requestPath = 'auto' } = config;

    if (requestPath.length === 0) {
        requestPath = 'auto';
    }

    if (requestPath.startsWith("auto")) {
        if (lang == "en") {
            requestPath = "en-US-EmmaNeural";
        } else {
            requestPath = "zh-CN-XiaoxiaoNeural";
        }
    }

    if (requestPath.endsWith("play")) {
        return await invoke('get_edge_tts_voice_data_and_play', {
            voiceShortId: requestPath,
            text: text,
        });
    } else {
        return await invoke('get_edge_tts_voice_data', {
            voiceShortId: requestPath,
            text: text,
        });

    }
}

export * from './Config';
export * from './info';
