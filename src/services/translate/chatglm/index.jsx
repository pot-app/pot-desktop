import { Language } from './info';
import * as jose from 'jose';

export async function translate(text, from, to, options = {}) {
    const { config, setResult, detect } = options;

    let { model, apiKey, promptList } = config;

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
        let errRes = res.clone();
        const reader = res.body.getReader();
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    if (target === '') {
                        let json = await errRes.json();
                        if (json.msg) {
                            throw json.msg;
                        } else {
                            throw JSON.stringify(json);
                        }
                    }
                    setResult(target.trim());
                    return target.trim();
                }
                const str = new TextDecoder().decode(value);
                let list = str.split('\n');
                for (let line of list) {
                    if (line.startsWith('data:')) {
                        let data = line.replace('data:', '');
                        if (data === '') {
                            target += '\n';
                        } else {
                            target += data;
                        }
                        if (setResult) {
                            setResult(target + '_');
                        } else {
                            return '[STREAM]';
                        }
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
