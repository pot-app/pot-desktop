// 原则上都用tauri提供的fetch发送请求，因为只要这样才能使软件内代理生效
// 实在不行就用axios吧
import { fetch } from '@tauri-apps/api/http';
import { get } from '../windows/main';
import { translateID } from '../windows/Translator/components/TargetArea/index.jsx';

// 必须向外暴露info
export const info = {
    // 接口中文名称
    // 翻译服务商：https://niutrans.com
    // 翻译服务接口文档：https://niutrans.com/documents/overview?id=2
    name: '小牛翻译',
    // 接口支持语言及映射
    supportLanguage: {
        auto: 'auto',
        'zh-cn': 'zh',
        'zh-tw': 'cht',
        yue: 'yue',
        en: 'en',
        ja: 'ja',
        ko: 'ko',
        fr: 'fr',
        es: 'es',
        ru: 'ru',
        de: 'de',
    },
    // 接口需要配置项(会在设置中出现设置项来获取)
    needs: [
        {
            config_key: 'xiaoniu_apikey',
            place_hold: 'ApiKey',
            display_name: 'API 密钥',
        }
    ],
};

//必须向外暴露translate
export async function translate(text, from, to, setText, id) {
    // 获取语言映射
    const { supportLanguage } = info;
    // 获取设置项
    const apikey = get('xiaoniu_apikey') ?? '';
    // 检查设置
    if (apikey == '') {
        return '请先翻译服务或配置API 密钥';
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
        query:{
            from: supportLanguage[from],
            to: supportLanguage[to],
            apiKey: apikey,
            arc_text: text,
            dictNo: '',
            memoryNo: ''
        },
    });

    // 返回翻译结果
    // return target
    if (res.ok) {
        let result = res.data;
        let { Response } = result;
        if (Response && Response['tgt_text'] && Response['from']) {
            if (Response['from'] == supportLanguage[to]) {
                let secondLanguage = get('from') ?? 'en';
                if (secondLanguage != to) {
                    await translate(text, from, secondLanguage, setText, id);
                    return;
                }
            }
            if (translateID.includes(id)) {
                setText(Response['tgt_text']);
            }
        } else {
            throw JSON.stringify(result);
        }
    } else {
        throw `Http请求错误\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
    }
}

// 编写完成后请在index.js中暴露接口
