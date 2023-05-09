import { fetch } from '@tauri-apps/api/http';
import { get } from '../windows/main';

export const info = {
    name: 'OpenAI 总结',
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
            config_key: 'openai_summary_prompt',
            place_hold: 'You are a text summarizer, you can only summarize the text, don\'t interpret it.',
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
    let prompt = get('openai_summary_prompt') ?? '';
    if (prompt == '') {
        prompt = 'You are a text summarizer, you can only summarize the text, don\'t interpret it.';
    }
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apikey}`,
    };

    let systemPrompt = prompt;
    let userPrompt = `Summarize in ${supportLanguage[to]}:\n"""\n${text}\n"""`;

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
            let target = choices[0].message.content.trim();
            if (target) {
                if (target.startsWith('"')) {
                    target = target.slice(1);
                }
                if (target.endsWith('"')) {
                    target = target.slice(0, -1);
                }
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
