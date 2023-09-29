import { store } from '../../../utils/store';
import { Language } from './info';
import * as jose from 'jose';

export async function translate(text, from, to, options = {}) {
    const { config, setResult, detect } = options;

    let translateConfig = await store.get('chatglm');
    if (config !== undefined) {
        translateConfig = config;
    }
    let { model, apiKey, promptList } = translateConfig;

    let [id, secret] = apiKey.split('.');
    if (id === undefined || secret === undefined) {
        throw new Error('invalid apikey');
    }
    promptList = promptList.map((item) => {
        return {
            ...item,
            content: item.content
                .replaceAll('$text', text)
                .replaceAll('$from', from)
                .replaceAll('$to', to)
                .replaceAll('$detect', Language[detect]),
        };
    });

    //
    let timestamp = new Date().getTime();
    let payload = {
        api_key: id,
        exp: timestamp + 1000 * 60,
        timestamp: timestamp,
    };
    secret = new TextEncoder().encode(secret);
    let jwt = new jose.SignJWT(payload).setProtectedHeader({ alg: 'HS256', sign_type: 'SIGN' });
    let token = await jwt.sign(secret);

    const headers = {
        'Content-Type': 'application/json',
        accept: 'text/event-stream',
        Authorization: token,
    };

    let body = {
        prompt: promptList,
    };

    const res = await window.fetch(`https://open.bigmodel.cn/api/paas/v3/model-api/${model}/sse-invoke`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
    });
    if (res.ok) {
        let target = '';
        const reader = res.body.getReader();
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    setResult(target.trim());
                    return target.trim();
                }
                const str = new TextDecoder().decode(value);
                let block = str.split(/id:|event:|data:|meta:/);
                if (block[1].trim() === 'add') {
                    target += block[3].replace(/(.*)\n\n/, '$1');
                    if (setResult) {
                        setResult(target + '_');
                    } else {
                        return '[STREAM]';
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }
    } else {
        throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
    }
}

export * from './Config';
export * from './info';
