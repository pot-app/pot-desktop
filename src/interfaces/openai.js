import { fetch } from '@tauri-apps/api/http';
import { get } from '../global/config';

export const info = {
    name: "Open AI",
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
    needs: {
        "openai_domain": "自定义域名",
        "openai_apikey": "ApiKey"
    }
}

export async function translate(text, from, to) {
    const { supportLanguage } = info;
    const domain = get('openai_domain', "api.openai.com");
    const apikey = get('openai_apikey', "");
    if (apikey == "") {
        return "请先配置apikey"
    }
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apikey}`,
    };
    let prompt = "";
    if (from == 'auto') {
        prompt = `翻译成${supportLanguage[to]}:`
    } else {
        prompt = `将这段${supportLanguage[from]}翻译成${supportLanguage[to]}:`
    }
    const body = {
        model: "gpt-3.5-turbo",
        temperature: 0,
        max_tokens: 1000,
        top_p: 1,
        frequency_penalty: 1,
        presence_penalty: 1,
        messages: [
            { role: "system", content: prompt },
            { role: "user", content: `"${text}"` },
        ]
    };

    const res = await fetch(`https://${domain}/v1/chat/completions`, {
        method: 'POST',
        headers: headers,
        body: {
            type: 'Json',
            payload: body
        },
        timeout: 10
    })

    const { choices } = res.data;

    let target = choices[0].message.content.trim()

    if (target.startsWith('"') || target.startsWith("「")) {
        target = target.slice(1);
    }
    if (target.endsWith('"') || target.endsWith("」")) {
        target = target.slice(0, -1);
    }
    return target
}
