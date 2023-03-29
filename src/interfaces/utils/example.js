import request from './utils/request';
import { get } from "../../global/config"

// 必须向外暴露info
export const info = {
    // 接口中文名称
    name: "示例翻译",
    // 接口支持语言及映射
    supportLanguage: {
        "auto": "auto",
        "zh-cn": "zh",
        "en": "en"
    },
    // 接口需要配置项
    needs: {
        // 配置项在配置文件中的代号:中文名称
        // 在translate函数中可以用get函数获取到这些值
        "example_appid": "AppId",
        "example_secret": "密钥"
    }
}
//必须向外暴露translate
export async function translate(text, from, to) {
    // 获取语言映射
    const { supportLanguage } = info;
    // 获取设置项
    const appid = get('example_appid', '');
    const secret = get('example_secret', '');
    // 完成翻译过程
    // ......
    // 遇到跨域问题考虑使用tauri提供的fetch代替axios
    // 返回翻译结果
    // return target
}
// 编写完成后请在index.js中暴露接口

