import { fetch } from '@tauri-apps/api/http';

// 必须向外暴露info
export const info = {
    // 接口中文名称
    name: '必应词典',
    // 接口支持语言及映射
    supportLanguage: {
        'auto': 'auto',
        'zh-cn': 'zh-cn',
        'en': 'en-us',
    },
    // 接口需要配置项(会在设置中出现设置项来获取)
    needs: [],
};
//必须向外暴露translate
export async function translate(text, from, to, setText) {
    // 获取语言映射
    const { supportLanguage } = info;

    // 检查语言支持
    if (!(to in supportLanguage) || !(from in supportLanguage)) {
        return '该接口不支持该语言';
    }
    if (text.split(' ').length != 1) {
        return '该接口只支持查词';
    }

    let res = await fetch('https://cn.bing.com/dict/search', {
        method: 'GET',
        query: {
            mkt: supportLanguage[to],
            q: text,
        },
        responseType: 2// 返回Text而不是Json
    })
    if (res.ok) {
        let result = res.data;
        const descReg = /<meta name="description" content="([^"]+?)" \/>/;
        let content = result.match(descReg)[1];
        content = content.replace(`必应词典为您提供${text}的释义，`, '');
        content = content.replaceAll('； ', '；\n');
        content = content.replaceAll(']，', ']\n');
        if (content.trim().split(' ') == 1) {
            throw '查词失败';
        } else {
            setText(content);
        }
    } else {
        throw 'http请求出错\n' + JSON.stringify(res);
    }
}
