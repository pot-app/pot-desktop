import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zh_CN from '../locales/zh_CN.json';
import zh_TW from '../locales/zh_TW.json';
import en_US from '../locales/en_US.json';

i18n.use(initReactI18next)
    .init({
        fallbackLng: 'en',
        debug: true,
        interpolation: {
            escapeValue: false,
        },
        resources: {
            en: en_US,
            'zh_cn': zh_CN,
            'zh_tw': zh_TW,
        }
    });

export default i18n;