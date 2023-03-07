import youdao_free from './youdao_free'
import chatgpt from './chatgpt'
import caiyun from './caiyun'

export default [
    { value: 'youdao_free', label: '有道翻译(免费)' },
    { value: 'caiyun', label: '彩云小译' },
    { value: 'chatgpt', label: 'ChatGPT' },
]

export function getTranslator(name) {
    let translator;
    switch (name) {
        case 'youdao_free':
            translator = new youdao_free();
            break;
        case 'chatgpt':
            translator = new chatgpt();
            break;
        case 'caiyun':
            translator = new caiyun();
            break;
        default:
            translator = new youdao_free();
            break;
    }
    return translator
}