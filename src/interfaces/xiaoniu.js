import { fetch } from '@tauri-apps/api/http';
import { get } from '../windows/main';
import { translateID } from '../windows/Translator/components/TargetArea/index.jsx';

export const info = {
    // 接口中文名称
    // 翻译服务商：https://niutrans.com
    // 翻译服务接口文档：https://niutrans.com/documents/overview?id=2
    name: '小牛翻译',
    // 接口支持语言及映射
    supportLanguage: {
        auto: 'auto',
        'zh_cn': 'zh',
        'zh_tw': 'cht',
        yue: 'yue',
        en: 'en',
        ja: 'ja',
        ko: 'ko',
        fr: 'fr',
        es: 'es',
        ru: 'ru',
        de: 'de',
        it: 'it',
        tr: 'tr',
        pt: 'pt',
        vi: 'vi',
        id: 'id',
        th: 'th',
        ms: 'ms',
        ar: 'ar',
        hi: 'hi',
    },
    // 接口需要配置项(会在设置中出现设置项来获取)
    needs: [
        {
            config_key: 'xiaoniu_apikey',
            place_hold: 'ApiKey',
            display_name: 'API 密钥',
        },
    ],
};

//必须向外暴露translate
export async function translate(text, from, to, setText, id) {
    // 获取语言映射
    const { supportLanguage } = info;
    // 获取设置项
    const apikey = get('xiaoniu_apikey') ?? '';
    // 检查设置
    if (apikey === '') {
        return '请先配置API 密钥';
    }
    // 检查语言支持
    if (!(to in supportLanguage) || !(from in supportLanguage)) {
        return '该接口不支持该语言';
    }
    // 完成翻译过程
    const url = `https://api.niutrans.com/NiuTransServer/translation`;

    let res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: {
            type: 'Json',
            payload: {
                from: supportLanguage[from],
                to: supportLanguage[to],
                apikey: apikey,
                src_text: text,
            },
        },
    });

    // 返回翻译结果
    if (res.ok) {
        let result = res.data;
        if (result && result['tgt_text'] && result['from']) {
            if (result['from'] === supportLanguage[to]) {
                let secondLanguage = get('second_language') ?? 'en';
                if (secondLanguage !== to) {
                    await translate(text, from, secondLanguage, setText, id);
                    return;
                }
            }
            if (translateID.includes(id)) {
                setText(result['tgt_text'].trim());
            }
        } else {
            throw JSON.stringify(result);
        }
    } else {
        throw `Http请求错误\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
    }
}
