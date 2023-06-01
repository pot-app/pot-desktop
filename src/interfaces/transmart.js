import { translateID } from '../windows/Translator/components/TargetArea';
import { fetch } from '@tauri-apps/api/http';
import { get } from '../windows/main';

export const info = {
    // 接口中文名称
    name: 'transmart',
    // 接口支持语言及映射
    supportLanguage: {
        auto: 'auto',
        'zh_cn': 'zh',
        'zh_tw': 'zh-TW',
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
    },
    // 接口需要配置项
    needs: [
        {
            config_key: 'transmart_user',
            place_hold: '',
            display_name: '用户名',
        },
        {
            config_key: 'transmart_token',
            place_hold: '',
            display_name: 'Token',
        },
    ],
};

//必须向外暴露translate
export async function translate(text, from, to, setText, id) {
    // 获取语言映射
    const { supportLanguage } = info;
    // 获取设置项
    const user = get('transmart_user') ?? '';
    const token = get('transmart_token') ?? '';

    if (user === '' || token === '') {
        throw '请先配置用户名和Token';
    }
    if (!(from in supportLanguage) || !(to in supportLanguage)) {
        throw '该接口不支持该语言';
    }

    const url = 'https://transmart.qq.com/api/imt';
    const analysis_res = await fetch(url, {
        method: 'POST',
        body: {
            type: 'Json',
            payload: {
                header: {
                    fn: 'text_analysis',
                    token: token,
                    user: user,
                },
                type: 'plain',
                text: text,
            },
        },
    });
    if (analysis_res.ok) {
        let analysis_result = analysis_res.data;
        if (analysis_result['language']) {
            if (analysis_result['language'] === supportLanguage[to]) {
                to = get('second_language') ?? 'en';
            }
            if (analysis_result['sentence_list']) {
                let text_list = analysis_result['sentence_list'].map((text) => {
                    return text['str'];
                });
                const res = await fetch(url, {
                    method: 'POST',
                    body: {
                        type: 'Json',
                        payload: {
                            header: {
                                fn: 'auto_translation',
                                token: token,
                                user: user,
                            },
                            type: 'plain',
                            source: {
                                lang: from === 'auto' ? analysis_result['language'] : supportLanguage[from],
                                text_list: text_list,
                            },
                            target: {
                                lang: supportLanguage[to],
                            },
                        },
                    },
                });
                if (res.ok) {
                    const result = res.data;
                    if (result['auto_translation']) {
                        let target = '';
                        for (let i of result['auto_translation']) {
                            if (translateID.includes(id)) {
                                target += i;
                                setText(target);
                            }
                        }
                    } else {
                        throw JSON.stringify(result);
                    }
                } else {
                    throw `Http请求错误\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
                }
            } else {
                throw JSON.stringify(analysis_result);
            }
        } else {
            throw JSON.stringify(analysis_result);
        }
    } else {
        throw `Http请求错误\nHttp Status: ${analysis_res.status}\n${JSON.stringify(analysis_res.data)}`;
    }
}
