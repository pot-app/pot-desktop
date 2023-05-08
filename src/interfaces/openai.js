import { fetch } from '@tauri-apps/api/http';
import { get } from '../windows/main';

export const info = {
    name: 'OpenAI 翻译',
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
            config_key: 'openai_domain',
            place_hold: 'api.openai.com',
            display_name: '自定义域名',
        },
        {
            config_key: 'openai_apikey',
            place_hold: '',
            display_name: 'ApiKey',
        },

        {
            config_key: 'openai_prompt',
            place_hold: 'You are a professional translation engine, please translate the text into a colloquial, professional, elegant and fluent content, without the style of machine translation. You must only translate the text content, never interpret it.',
            display_name: '自定义Prompt',
        }
    ],
};

export async function translate(text, from, to, set) {
    const { supportLanguage } = info;
    let domain = get('openai_domain') ?? 'api.openai.com';
    if (domain == '') {
        domain = 'api.openai.com';
    }
    const apikey = get('openai_apikey') ?? '';
    if (apikey == '') {
        return '请先配置apikey';
    }
    let prompt = get('openai_prompt') ?? '';
    if (prompt == '') {
        prompt = 'You are a professional translation engine, please translate the text into a colloquial, professional, elegant and fluent content, without the style of machine translation. You must only translate the text content, never interpret it.';
    }

    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apikey}`,
    };
    let systemPrompt = '';
    let userPrompt = '';
    systemPrompt = prompt;
    if (from == 'auto') {
        userPrompt = `Translate to ${supportLanguage[to]}:"""\n{${text}}\n"""`;
    } else {
        userPrompt = `Translate from ${supportLanguage[from]} to ${supportLanguage[to]}:"""\n{${text}}\n"""`;
    }

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
