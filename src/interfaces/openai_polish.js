import { fetch } from '@tauri-apps/api/http';
import { get } from '../windows/main';

export const info = {
    name: 'OpenAI 润色',
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
            config_key: 'openai_polish_prompt',
            place_hold: 'You are a text embellisher, you can only embellish the text, don\'t interpret it.',
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
    let prompt = get('openai_polish_prompt') ?? 'You are a text embellisher, you can only embellish the text, don\'t interpret it.';
    if (prompt == '') {
        prompt = 'You are a text embellisher, you can only embellish the text, don\'t interpret it.';
    }
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apikey}`,
    };

    let systemPrompt = prompt;
    let userPrompt = `用${supportLanguage[to]}润色此句:\n\n${text}`;

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

    let result = res.data;
    if ('error' in result) {
        return result.error.message;
    } else {
        const { choices } = result;

        let target = choices[0].message.content.trim();

        return target;
    }
}
