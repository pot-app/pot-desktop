import axios from 'axios';
import { get } from '../global/config';

const languageMap = {
    "zh": "中文",
    "en": "英语",
}

export default class chatgpt {
    async translate(text) {
        const apikey = get('openai_apikey', "");
        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apikey}`,
        };
        let prompt = `翻译成${languageMap[get("target_language", "zh")]}并适当润色`
        const body = {
            model: "gpt-3.5-turbo",
            temperature: 0,
            max_tokens: 1000,
            top_p: 1,
            frequency_penalty: 1,
            presence_penalty: 1,
            messages: [
                { role: "system", content: prompt },
                { role: "user", content: `${text}` },
            ]
        };

        const res = await axios.post("https://api.openai.com/v1/chat/completions", body, {
            headers: headers,
            timeout: 30000,
        })

        const { choices } = res.data;

        return choices[0].message.content.trim()
    }
}
