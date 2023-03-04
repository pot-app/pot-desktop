import youdao_free from '../../interfaces/youdao_free'
import chatgpt from '../../interfaces/chatgpt'

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