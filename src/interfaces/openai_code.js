import { fetch } from '@tauri-apps/api/http';
import { get } from '../windows/main';

export const info = {
    name: 'OpenAI 代码解释',
    supportLanguage: {
        'zh-cn': '简体中文',
        'zh-tw': '繁体中文',
        yue: '粤语',
        ja: '日本語',
        en: '英语',
        ko: '韩语',
        fr: '法语',
        es: '西班牙语',
        ru: '俄语',
        de: '德语',
    },
    needs: [
        {
            config_key: 'openai_code_prompt',
            place_hold: 'You are a code explanation engine, you can only explain the code, do not interpret or translate it. Also, please report any bugs you find in the code to the author of the code.',
            display_name: '自定义Prompt',
        }
    ],
};

export async function translate(text, from, to) {
    const { supportLanguage } = info;
    let domain = get('openai_domain') ?? 'api.openai.com';
    if (domain == '') {
        domain = 'api.openai.com';
    }
    const apikey = get('openai_apikey') ?? '';
    if (apikey == '') {
        return '请先配置apikey';
    }
    let prompt = get('openai_code_prompt') ?? 'You are a code explanation engine, you can only explain the code, do not interpret or translate it. Also, please report any bugs you find in the code to the author of the code.';
    if (prompt == '') {
        prompt = 'You are a code explanation engine, you can only explain the code, do not interpret or translate it. Also, please report any bugs you find in the code to the author of the code.';
    }
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apikey}`,
    };

    let systemPrompt = prompt;
    let userPrompt = `用${supportLanguage[to]}解释此段代码、正则表达式或脚本。如果内容不是代码，请返回错误提示。如果代码有明显的错误，请指出:\n\n${text}`;

    const body = {
        model: 'gpt-3.5-turbo',
        temperature: 0,
        max_tokens: 1000,
        top_p: 1,
        frequency_penalty: 1,
        presence_penalty: 1,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ],
    };

    let res = await fetch(`https://${domain}/v1/chat/completions`, {
        method: 'POST',
        headers: headers,
        body: { type: 'Json', payload: body }
    })

    if (res.ok) {
        let result = res.data;
        const { choices } = result;
        if (choices) {
            const target = choices[0].message.content.trim();
            if (target) {
                return target;
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
