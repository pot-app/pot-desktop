import axios from 'axios';
import { get } from '../global/config';

const languageMap = {
    "zh-cn": "简体中文",
    "zh-tw": "繁体中文",
    "en": "英语",
}

export default class chatgpt {
    async translate(text, lang) {
        const domain = get('openai_domain', "api.openai.com");
        const apikey = get('openai_apikey', "");

        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apikey}`,
        };
        let prompt = `翻译成${languageMap[lang]}:`
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

        const res = await axios.post(`https://${domain}/v1/chat/completions`, body, {
            headers: headers,
            timeout: 30000,
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
}
