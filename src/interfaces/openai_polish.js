import { fetch } from '@tauri-apps/api/http';
import { get } from '../windows/main';

export const info = {
    name: 'OpenAI 润色',
    supportLanguage: {
        'zh-cn': 'Simplified Chinese',
        'zh-tw': 'Traditional Chinese',
        yue: 'Cantonese',
        ja: 'Japanese ',
        en: 'English',
        ko: 'Korean',
        fr: 'French',
        es: 'Spanish',
        ru: 'Russian',
        de: 'German',
    },
    needs: [
        {
            config_key: 'openai_polish_prompt',
            place_hold: "You are a text embellisher, you can only embellish the text, don't interpret it.",
            display_name: '自定义Prompt',
        },
    ],
};

export async function translate(text, from, to, setText) {
    const { supportLanguage } = info;
    let domain = get('openai_domain') ?? 'api.openai.com';
    if (domain == '') {
        domain = 'api.openai.com';
    }
    const apikey = get('openai_apikey') ?? '';
    if (apikey == '') {
        throw '请先配置apikey';
    }
    let prompt = get('openai_polish_prompt') ?? '';
    if (prompt == '') {
        prompt = "You are a text embellisher, you can only embellish the text, don't interpret it.";
    }
    const stream = get('openai_stream') ?? false;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apikey}`,
    };

    let systemPrompt = prompt;
    let userPrompt = `Embellish in ${supportLanguage[to]}:\n"""\n${text}\n"""`;

    const body = {
        model: 'gpt-3.5-turbo',
        temperature: 0,
        max_tokens: 1000,
        stream: stream,
        top_p: 1,
        frequency_penalty: 1,
        presence_penalty: 1,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ],
    };

    if (stream) {
        const res = await window.fetch(`https://${domain}/v1/chat/completions`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body),
            proxy: 'http://127.0.0.1:7890',
        });
        if (res.ok) {
            let target = '';
            const reader = res.body.getReader();
            try {
                let temp = '';
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        break;
                    }
                    const str = new TextDecoder().decode(value);
                    let datas = str.split('data: ');
                    for (let data of datas) {
                        if (data.trim() != '' && data.trim() != '[DONE]') {
                            try {
                                if (temp != '') {
                                    data = temp + data.trim();
                                    let result = JSON.parse(data.trim());
                                    if (result.choices[0].delta.content) {
                                        target += result.choices[0].delta.content;
                                        setText(target);
                                    }
                                    temp = '';
                                } else {
                                    let result = JSON.parse(data.trim());
                                    if (result.choices[0].delta.content) {
                                        target += result.choices[0].delta.content;
                                        setText(target);
                                    }
                                }
                            } catch {
                                temp = data.trim();
                            }
                        }
                    }
                }
            } finally {
                reader.releaseLock();
            }
        } else {
            throw 'http请求出错\n' + JSON.stringify(res);
        }
    } else {
        let res = await fetch(`https://${domain}/v1/chat/completions`, {
            method: 'POST',
            headers: headers,
            body: { type: 'Json', payload: body },
        });
        if (res.ok) {
            let result = res.data;
            const { choices } = result;
            if (choices) {
                let target = choices[0].message.content.trim();
                if (target) {
                    if (target.startsWith('"')) {
                        target = target.slice(1);
                    }
                    if (target.endsWith('"')) {
                        target = target.slice(0, -1);
                    }
                    setText(target);
                } else {
                    throw JSON.stringify(choices);
                }
            } else {
                throw JSON.stringify(result);
            }
        } else {
            throw 'http请求出错\n' + JSON.stringify(res);
        }
    }
}
