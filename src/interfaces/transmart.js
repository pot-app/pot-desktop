import { translateID } from '../windows/Translator/components/TargetArea';
import { fetch } from '@tauri-apps/api/http';
import { get } from '../windows/main';

export const info = {
    // 接口中文名称
    name: 'transmart',
    // https://docs.qq.com/doc/DY2NxUWpmdnB2RXV3
    supportLanguage: {
        auto: 'auto',
        zh_cn: 'zh',
        zh_tw: 'zh-TW',
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
        pt_br: 'pt',
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
        },
        {
            config_key: 'transmart_token',
            place_hold: '',
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

    if (!(from in supportLanguage) || !(to in supportLanguage)) {
        throw 'Unsupported Language';
    }
    let header = {};
    if (user === '' || token === '') {
        // throw 'Please configure User and Token';
    } else {
        header['token'] = token;
        header['user'] = user;
    }

    const url = 'https://transmart.qq.com/api/imt';
    const analysis_res = await fetch(url, {
        method: 'POST',
        body: {
            type: 'Json',
            payload: {
                header: {
                    fn: 'text_analysis',
                    ...header,
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
                                ...header,
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
                                setText(target.trim());
                            }
                        }
                    } else {
                        throw JSON.stringify(result);
                    }
                } else {
                    throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
                }
            } else {
                throw JSON.stringify(analysis_result);
            }
        } else {
            throw JSON.stringify(analysis_result);
        }
    } else {
        throw `Http Request Error\nHttp Status: ${analysis_res.status}\n${JSON.stringify(analysis_res.data)}`;
    }
}
