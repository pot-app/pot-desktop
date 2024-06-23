import { fetch, Body } from '@tauri-apps/api/http';
import { Language } from './info';

export async function translate(text, from, to, options = {}) {
    const { config, setResult, detect } = options;

    let { apiKey, stream, promptList, requestPath } = config;
    if (!requestPath) {
        requestPath = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro';
    }
    if (!/https?:\/\/.+/.test(requestPath)) {
        requestPath = `https://${requestPath}`;
    }
    if (requestPath.endsWith('/')) {
        requestPath = requestPath.slice(0, -1);
    }
    requestPath = stream
        ? `${requestPath}:streamGenerateContent?key=${apiKey}`
        : `${requestPath}:generateContent?key=${apiKey}`;

    promptList = promptList.map((item) => {
        return {
            ...item,
            parts: [
                {
                    text: item.parts[0].text
                        .replaceAll('$text', text)
                        .replaceAll('$from', from)
                        .replaceAll('$to', to)
                        .replaceAll('$detect', Language[detect]),
                },
            ],
        };
    });

    const headers = {
        'Content-Type': 'application/json',
    };
    let body = {
        contents: promptList,
        safetySettings: [
            {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_NONE',
            },
            {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_NONE',
            },
            {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_NONE',
            },
            {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_NONE',
            },
        ],
    };

    if (stream) {
        const res = await window.fetch(requestPath, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body),
        });
        if (res.ok) {
            let target = '';
            const reader = res.body.getReader();
            try {
                let temp = '';
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        setResult(target.trim());
                        return target.trim();
                    }
                    const str = temp + new TextDecoder().decode(value).replaceAll(/\s+/g, ' ');
                    const matchs = str.match(/{ \"text\": \".*\" } ],/);
                    if (matchs) {
                        for (let match of matchs) {
                            let result = JSON.parse(match.slice(0, -2));
                            if (result.text) {
                                target += result.text;
                                if (setResult) {
                                    setResult(target + '_');
                                } else {
                                    return '[STREAM]';
                                }
                            }
                        }
                        temp = '';
                    } else {
                        temp += str;
                    }
                }
            } finally {
                reader.releaseLock();
            }
        } else {
            throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
        }
    } else {
        let res = await fetch(requestPath, {
            method: 'POST',
            headers: headers,
            body: Body.json(body),
        });

        if (res.ok) {
            let result = res.data;
            const { candidates } = result;
            if (candidates) {
                let target = candidates[0].content.parts[0].text.trim();
                if (target) {
                    if (target.startsWith('"')) {
                        target = target.slice(1);
                    }
                    if (target.endsWith('"')) {
                        target = target.slice(0, -1);
                    }
                    return target.trim();
                } else {
                    throw JSON.stringify(candidates);
                }
            } else {
                throw JSON.stringify(result);
            }
        } else {
            throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
        }
    }
}

export * from './Config';
export * from './info';
