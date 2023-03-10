import { fetch } from '@tauri-apps/api/http';
import { get } from '../global/config';

export const info = {
    name: "Open AI 代码解释",
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
    needs: {}
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

    let systemPrompt = "You are a code explanation engine, you can only explain the code, do not interpret or translate it. Also, please report any bugs you find in the code to the author of the code.";
    let userPrompt = `用${supportLanguage[to]}解释此段代码、正则表达式或脚本。如果内容不是代码，请返回错误提示。如果代码有明显的错误，请指出:\n\n${text}`

    const body = {
        model: "gpt-3.5-turbo",
        temperature: 0,
        max_tokens: 1000,
        top_p: 1,
        frequency_penalty: 1,
        presence_penalty: 1,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
        ]
    };

    const res = await fetch(`https://${domain}/v1/chat/completions`, {
        method: 'POST',
        headers: headers,
        body: {
            type: 'Json',
            payload: body
        }
    })

    const { choices } = res.data;

    let target = choices[0].message.content.trim()

    return target
}
