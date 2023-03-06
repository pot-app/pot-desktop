import youdao_free from './youdao_free'
import chatgpt from './chatgpt'

export default [
    { value: 'youdao_free', label: '有道翻译(免费)' },
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
        default:
            translator = new youdao_free();
            break;
    }
    return translator
}