import { fetch, Body, ResponseType } from '@tauri-apps/api/http';

export async function tts(text, lang, options = {}) {
    const { config } = options;
    const { apiKey, voiceId = '147320', model = 'mars-flash' } = config;

    if (!apiKey) {
        throw 'Please configure your CAMB AI API key';
    }

    const url = 'https://client.camb.ai/apis/tts-stream';

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
        },
        body: Body.json({
            text: text,
            language: lang,
            voice_id: parseInt(voiceId),
            speech_model: model,
            output_configuration: { format: 'wav' },
        }),
        responseType: ResponseType.Binary,
    });

    if (res.ok) {
        return res.data;
    } else {
        throw `Http Request Error\nHttp Status: ${res.status}`;
    }
}

export * from './Config';
export * from './info';
