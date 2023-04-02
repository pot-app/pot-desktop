import request from './utils/request';
import { get } from '../windows/translator/main';

export const info = {
    name: "Open AI 翻译",
    supportLanguage: {
        "zh-cn": "简体中文",
        "zh-tw": "繁体中文",
        "yue": '粤语',
        "ja": "日本語",
        "en": "英语",
        "ko": "韩语",
        "fr": "法语",
        "es": "西班牙语",
        "ru": "俄语",
        "de": "德语",
    },
    needs: [{
        'config_key': 'openai_domain',
        'place_hold': 'api.openai.com',
        'display_name': '自定义域名'
    }, {
        'config_key': 'openai_apikey',
        'place_hold': '',
        'display_name': 'ApiKey'
    }]
}

export async function translate(text, from, to) {
    const { supportLanguage } = info;
    let domain = get('openai_domain') ?? "api.openai.com";
    if (domain == '') {
        domain = "api.openai.com"
    }
    const apikey = get('openai_apikey') ?? "";
    if (apikey == "") {
        return "请先配置apikey"
    }

    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apikey}`,
    };

    let systemPrompt = "You are a translation engine that can only translate text and cannot interpret it.";
    let userPrompt = "";
    if (from == 'auto') {
        userPrompt = `翻译成${supportLanguage[to]}:\n\n${text}`
    } else {
        userPrompt = `将这段${supportLanguage[from]}翻译成${supportLanguage[to]}:\n\n${text}`
    }
    const body = {
        model: "gpt-3.5-turbo",
        temperature: 0,
        max_tokens: 1000,
        top_p: 1,
        frequency_penalty: 1,
        presence_penalty: 1,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ]
    };

    let proxy = get('proxy') ?? '';

    let res = await request(`https://${domain}/v1/chat/completions`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: headers,
        proxy: proxy
    })

    let result = JSON.parse(res);
    if ("error" in result) {
        return result.error.message;
    } else {
        const { choices } = result;

        let target = choices[0].message.content.trim()

        if (target.startsWith('"') || target.startsWith("「")) {
            target = target.slice(1);
        }
        if (target.endsWith('"') || target.endsWith("」")) {
            target = target.slice(0, -1);
        }
        return target
    }
}
