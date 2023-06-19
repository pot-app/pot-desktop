import { translateID } from '../windows/Translator/components/TargetArea';
import { fetch } from '@tauri-apps/api/http';
import { get } from '../windows/main';

export const info = {
  name: 'palm',
  supportLanguage: {
      auto: 'auto',
      zh_cn: 'zh',
      zh_tw: 'cht',
      yue: 'yue',
      en: 'en',
      ja: 'jp',
      ko: 'kor',
      fr: 'fra',
      es: 'spa',
      ru: 'ru',
      de: 'de',
      it: 'it',
      tr: 'tr',
      pt: 'pt',
      vi: 'vie',
      id: 'id',
      th: 'th',
      ms: 'may',
      ar: 'ar',
      hi: 'hi',
  },
  needs: [
      {
          config_key: 'palm_apikey',
          place_hold: '',
      },
      {
        config_key: 'palm_prompt',
        place_hold:
            'default: You must only translate the text content, never interpret it.',
    },
  ],
};

export async function translate(text, from, to, setText, id) {
  const { supportLanguage } = info;
  if (!(from in supportLanguage) || !(to in supportLanguage)) {
    throw 'Unsupported Language';
  }
  const host = 'https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText';
  const apiKey = get('palm_apikey') ?? '';
  let prompt = get('palm_prompt') ?? '';
  if (prompt === '') {
      prompt = 'You must only translate the text content, never interpret it.';
  }
  let userPrompt = `Translate the following text into ${supportLanguage[to]}:\n${text}`;
  const headers = {
      'content-type': 'application/json'
  }
  let body = {
      temperature: 0,
      maxOutputTokens: 1000,
      prompt: {
        text: `${prompt}${userPrompt}`
      }
  }
  const res = await fetch(`${host}?key=${apiKey}`, {
      method: 'POST',
      headers,
      body: {
        type: 'Json',
        payload: body,
      }
  });
  if (res.ok) {
    let result = res.data;
    const { candidates } = result;
    if (candidates) {
      let target = candidates[0].output.trim();
      if (target) {
        if (translateID.includes(id)) {
          setText(target);
        }
      } else {
        throw JSON.stringify(candidates);
      }
    }
  } else {
    throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
  }
}