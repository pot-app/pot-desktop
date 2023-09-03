import { fetch } from '@tauri-apps/api/http';
import { store } from '../../../utils/store';

export async function tts(text, lang, options = {}) {
    const { config } = options;

    let lingvaConfig = (await store.get('lingva_tts')) ?? { requestPath: 'lingva.pot-app.com' };

    if (config !== undefined) {
        lingvaConfig = config;
    }

    let { requestPath } = lingvaConfig;
    if (!requestPath.startsWith('http')) {
        requestPath = 'https://' + requestPath;
    }
    const res = await fetch(`${requestPath}/api/v1/audio/${lang}/${encodeURIComponent(text)}`);

    if (res.ok) {
        const audioContext = new AudioContext();
        const audioSource = audioContext.createBufferSource();

        audioContext.decodeAudioData(new Uint8Array(res.data['audio']).buffer, (buffer) => {
            audioSource.buffer = buffer;
            audioSource.connect(audioContext.destination);
            audioSource.start();
        });
    }
}

export * from './Config';
export * from './info';
