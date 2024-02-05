import { Card, Button, CardFooter, Dropdown, DropdownMenu, DropdownTrigger, DropdownItem } from '@nextui-org/react';
import { useTranslation } from 'react-i18next';
import { BiTransferAlt } from 'react-icons/bi';
import React, { useEffect, useState } from 'react';
import { atom, useAtom, useAtomValue } from 'jotai';
import { listen } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api';

import { languageList } from '../../../../utils/language';
import { detectLanguageAtom } from '../SourceArea';
import { useConfig } from '../../../../hooks';

export const sourceLanguageAtom = atom();
export const targetLanguageAtom = atom();

export default function LanguageArea() {
    const [rememberLanguage] = useConfig('translate_remember_language', false);
    const [translateSourceLanguage, setTranslateSourceLanguage] = useConfig('translate_source_language', 'auto');
    const [translateTargetLanguage, setTranslateTargetLanguage] = useConfig('translate_target_language', 'zh_cn');
    const [translateSecondLanguage] = useConfig('translate_second_language', 'en');

    const [sourceLanguage, setSourceLanguage] = useAtom(sourceLanguageAtom);
    const [targetLanguage, setTargetLanguage] = useAtom(targetLanguageAtom);
    const detectLanguage = useAtomValue(detectLanguageAtom);
    const { t } = useTranslation();
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (translateSourceLanguage) {
            setSourceLanguage(translateSourceLanguage);
        }
        if (translateTargetLanguage) {
            setTargetLanguage(translateTargetLanguage);
        }
    }, [translateSourceLanguage, translateTargetLanguage]);

    useEffect(() => {
        if (rememberLanguage !== null && rememberLanguage) {
            setTranslateSourceLanguage(sourceLanguage);
            setTranslateTargetLanguage(targetLanguage);
        }
    }, [sourceLanguage, targetLanguage, rememberLanguage]);
    
    function bindLangEvent(lang) {
        listen('select_lang_' + lang.name, (e) => {
            const payload = e.payload
            if (payload === 'src') {
                setSourceLanguage(lang.name)
            } else {
                setTargetLanguage(lang.name)
            }
        }).catch(() => {})
    }
    useEffect(() => {
        if (initialized) return;
        for (const lang of languageList) {
            bindLangEvent({ name: lang, label: t(`languages.${ lang }`) })
        }
        setInitialized(true);
    })
    
    
    function onSelectLang(e, target) {
        const lang = target === 'src' ? sourceLanguage : targetLanguage
        invoke('plugin:context_menu|show_context_menu', {
            pos: { x: e.clientX, y: e.clientY },
            items: ['auto',...languageList].map(x => ({
                label: t(`languages.${ x }`),
                event: 'select_lang_' + x,
                checked: x === lang,
                payload: target
            }))
        }).catch(() => {})
    }
    
    return (
        <Card
            shadow='none'
            className='bg-content2 h-[35px] rounded-[10px]'
        >
            <CardFooter className='bg-content2 flex w-full p-0 rounded-[10px]'>
                <div className="w-[40%] grow text-center">
                    <a className="hover:underline text-sm" style={ { lineHeight: '35px' } } href="#"
                        onClick={ (e) => onSelectLang(e, 'src') }>
                        { t(`languages.${ sourceLanguage || 'auto' }`) }
                    </a>
                </div>
                <div className="flex">
                    <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        className="text-[20px] text-btn"
                        onPress={ async () => {
                            if (sourceLanguage !== 'auto') {
                                const oldSourceLanguage = sourceLanguage;
                                setSourceLanguage(targetLanguage);
                                setTargetLanguage(oldSourceLanguage);
                            } else {
                                if (detectLanguage !== '') {
                                    if (targetLanguage === translateTargetLanguage) {
                                        setTargetLanguage(detectLanguage);
                                    } else {
                                        setTargetLanguage(translateTargetLanguage);
                                    }
                                } else {
                                    if (targetLanguage === translateSecondLanguage) {
                                        setTargetLanguage(translateTargetLanguage);
                                    } else {
                                        setTargetLanguage(secondLanguage);
                                    }
                                }
                            }
                        } }
                    >
                        <BiTransferAlt />
                    </Button>
                </div>
                <div className='w-[40%] grow text-center'>
                    <a className="hover:underline text-sm" style={ { lineHeight: '35px' } } href="#"
                        onClick={ (e) => onSelectLang(e, 'target') }>
                        { t(`languages.${ targetLanguage || 'auto' }`) }
                    </a>
                </div>
            </CardFooter>
        </Card>
    );
}
