// 原则上都用tauri提供的fetch发送请求，因为只要这样才能使软件内代理生效
// 实在不行就用axios吧
import { fetch } from '@tauri-apps/api/http';
import { get } from '../windows/main';
import { translateID } from '../windows/Translator/components/TargetArea/index.jsx';

// 必须向外暴露info
export const info = {
    // 接口中文名称
    // 翻译服务商：https://openl.club/
    // 翻译服务接口文档：https://docs.openl.club/#/
    name: 'OpenL 翻译',
    // 接口支持语言及映射
    supportLanguage: {
        auto: 'auto',
        'zh-cn': 'zh',
        en: 'en',
        ja: 'ja',
        ko: 'ko',
        fr: 'fr',
        es: 'es',
        ru: 'ru',
        de: 'de',
    },
    // 翻译服务代码名
    translationService: {
        deepl: 'DeepL',
        youdao: '有道',
        tencent: '腾讯',
        aliyun: '阿里云',
        baidu: '百度',
        caiyun: '彩云',
        wechat: '微信翻译',
        sogou: '搜狗',
        azure: 'Azure翻译',
        ibm: 'IBM翻译',
        aws: 'AWS翻译',
        google: '谷歌翻译',
    },
    // 接口需要配置项(会在设置中出现设置项来获取)
    needs: [
        {
            config_key: 'openl_codename', // 配置项在配置文件中的代号
            place_hold: '翻译服务代码名', // 配置项没有填写时显示的提示信息
            display_name: '翻译服务', // 配置项名称
        },
        {
            config_key: 'openl_apikey',
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
    const codename = get('openl_codename') ?? '';
    const apikey = get('openl_apikey') ?? '';
    // 检查设置
    if (codename == '' || apikey == '') {
        return '请先翻译服务或配置API 密钥';
    }
    // 检查语言支持
    if (!(to in supportLanguage) || !(from in supportLanguage)) {
        return '该接口不支持该语言';
    }
    // 完成翻译过程

    const apiAddress = `https://api.openl.club`;
    const interfaceName = `/services/&{codedname}/translate`;
    const url = apiAddress + interfaceName;
    const body = {
        apikey: apikey,
        text: text,
        source_lang: supportLanguage[from],
        target_lang: supportLanguage[to],
    };
    const payload = JSON.stringify(body);

    let res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },

        body: { type: 'Json', payload: payload },
    });

    // 返回翻译结果
    // return target
    if (res.ok) {
        let result = res.data;
        let { Response } = result;
        if (Response && Response['text'] && Response['source_lange']) {
            if (Response['source_lange'] == supportLanguage[to]) {
                let secondLanguage = get('second_language') ?? 'en';
                if (secondLanguage != to) {
                    await translate(text, from, secondLanguage, setText, id);
                    return;
                }
            }
            if (translateID.includes(id)) {
                setText(Response['text']);
            }
        } else {
            throw JSON.stringify(result);
        }
    } else {
        throw `Http请求错误\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
    }
}

// 编写完成后请在index.js中暴露接口
