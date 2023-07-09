import { translateID } from '../windows/Translator/components/TargetArea';
import { fetch } from '@tauri-apps/api/http';
import { get } from '../windows/main';

const DISPLAY_FORMAT_KEY = 'display_format';
const DISPLAY_FORMAT_DAFAULT = '发音, 快速释义, 变形';
export const info = {
    name: 'bing_dict',
    // Bing Dictionary is a bilingual dictionary for Chinese and English
    supportLanguage: {
        zh_cn: 'zh-cn',
        en: 'en-us',
    },
    needs: [
        {
            config_key: DISPLAY_FORMAT_KEY,
            // 其实还有一些没有处理的数据: 词组, 分类词典(同义词)
            place_hold: `默认值: ${DISPLAY_FORMAT_DAFAULT}\n可选项: 快速释义, 英汉, 英英, 搭配, 发音, 权威英汉双解, 权威英汉双解发音, 例句, 变形`,
        },
    ],
};

const getConfigOrElse = (configKey, defaultValue) => ((v) => (v?.length ? v : defaultValue))(get(configKey));
export async function translate(text, from, to, setText, id) {
    if (from == 'auto') {
        if (/^[\u4e00-\u9fff]/.test(text)) {
            from = 'zh_cn';
        } else if (/^[A-Za-z]/.test(text)) {
            from = 'en';
        }
    }
    if (from == to) {
        setText(text);
        return;
    }
    // only supports Chinese-English word translation
    if (!(from in info.supportLanguage && to in info.supportLanguage) || text.split(/[\s,，]/).length > 1) {
        return;
    }

    const res = await fetch(
        `https://www.bing.com/api/v6/dictionarywords/search?q=${text}&appid=371E7B2AF0F9B84EC491D731DF90A55719C7D209&mkt=zh-cn&pname=bingdict`
    );
    if (res.ok) {
        const result = res.data;
        const meaningGroups = result.value[0].meaningGroups;
        if (meaningGroups.length === 0) {
            throw `Words not yet included: ${text}`;
        }
        const formats = getConfigOrElse(DISPLAY_FORMAT_KEY, DISPLAY_FORMAT_DAFAULT).trim().split(/,\s*/);
        const formatGroups = meaningGroups.reduce(
            (acc, cur) => {
                const group = acc[cur.partsOfSpeech?.[0]?.description || cur.partsOfSpeech?.[0]?.name];
                if (Array.isArray(group)) {
                    group.push(cur);
                }
                return acc;
            },
            formats.reduce((acc, cur) => {
                acc[cur] = [];
                return acc;
            }, {})
        );
        if (translateID.includes(id)) {
            setText(
                Object.keys(formatGroups)
                    .map((k) => {
                        const v = formatGroups[k];
                        return v
                            .flatMap((mean) => {
                                const partsOfSpeech = mean.partsOfSpeech[0].name || mean.partsOfSpeech[0].description;
                                const richDefinitions = mean.meanings[0].richDefinitions;
                                return richDefinitions
                                    .map((def) => def.fragments.map((f) => f.text).join('; '))
                                    .filter((v) => v.trim().length > 0)
                                    .map((v) => partsOfSpeech + '. ' + v);
                            })
                            .join('\n');
                    })
                    .filter((v) => v.trim().length > 0)
                    .join('\n\n')
            );
        }
    } else {
        throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
    }
}
