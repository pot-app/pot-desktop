import { Language } from './info';
import { store } from '../../../utils/store';

export default async function translate(text, from, to, secondLanguageSupplier) {
    if (from === Language.auto) {
        to = interfaces[translateInterface].tryDetectLanguage(text) || from;
        if (from === to) {
            to = await store.get('translate_second_language');
        }
    }
}
