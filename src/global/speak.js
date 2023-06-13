import { fetch } from '@tauri-apps/api/http';
import { get } from '../windows/main';

export async function speak(text) {
    let domain = get('lingva_domain') ?? '';
    if (domain === '') {
        domain = 'lingva.ml';
    }

    let res = await fetch(`https://${domain}/api/v1/auto/zh/${encodeURIComponent(text)}`, {
        method: 'GET',
    });

    if (res.ok) {
        let result = res.data;
        if (result.info && result.info.detectedSource) {
            const audio_res = await fetch(
                `https://${domain}/api/v1/audio/${result.info.detectedSource}/${encodeURIComponent(text)}`
            );
            if (audio_res.ok) {
                const audioContext = new AudioContext();
                const audioSource = audioContext.createBufferSource();

                audioContext.decodeAudioData(new Uint8Array(audio_res.data['audio']).buffer, (buffer) => {
                    audioSource.buffer = buffer;
                    audioSource.connect(audioContext.destination);
                    audioSource.start();
                });
            }
        } else {
            throw JSON.stringify(result);
        }
    } else {
        throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res)}`;
    }
}
