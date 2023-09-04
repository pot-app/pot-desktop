import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Button } from '@nextui-org/react';
import { atom, useAtom, useSetAtom, useAtomValue } from 'jotai';
import { fetch, Body } from '@tauri-apps/api/http';
import { useTranslation } from 'react-i18next';
import { HiTranslate } from 'react-icons/hi';
import { GiCycle } from 'react-icons/gi';
import React, { useEffect } from 'react';
import { nanoid } from 'nanoid';

import { languageList } from '../../../utils/language';
import { useConfig } from '../../../hooks';
import { textAtom } from '../TextArea';
import { pluginListAtom } from '..';

export const serviceNameAtom = atom();
export const languageAtom = atom();
export const recognizeFlagAtom = atom();

export default function ControlArea() {
    const pluginList = useAtomValue(pluginListAtom);
    const [serviceList] = useConfig('recognize_service_list', ['system', 'tesseract', 'paddle']);
    const [recognizeLanguage] = useConfig('recognize_language', 'auto');
    const [serverPort] = useConfig('server_port', 60828);
    const setRecognizeFlag = useSetAtom(recognizeFlagAtom);
    const [serviceName, setServiceName] = useAtom(serviceNameAtom);
    const [language, setLanguage] = useAtom(languageAtom);
    const text = useAtomValue(textAtom);
    const { t } = useTranslation();

    useEffect(() => {
        if (serviceList) {
            setServiceName(serviceList[0]);
        }
        if (recognizeLanguage) {
            setLanguage(recognizeLanguage);
        }
    }, [serviceList, recognizeLanguage]);

    return (
        <div className='flex justify-between px-[12px] h-full'>
            {serviceName && (
                <Dropdown>
                    <DropdownTrigger>
                        <Button
                            className='my-auto'
                            variant='bordered'
                            size='sm'
                        >
                            {serviceName.startsWith('[plugin]')
                                ? pluginList[serviceName].display
                                : t(`services.recognize.${serviceName}.title`)}
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                        aria-label='service name'
                        className='max-h-[70vh] overflow-y-auto'
                        onAction={(key) => {
                            setServiceName(key);
                        }}
                    >
                        {serviceList.map((name) => {
                            return (
                                <DropdownItem key={name}>
                                    {name.startsWith('[plugin]')
                                        ? pluginList[name].display
                                        : t(`services.recognize.${name}.title`)}
                                </DropdownItem>
                            );
                        })}
                    </DropdownMenu>
                </Dropdown>
            )}
            {language && (
                <Dropdown>
                    <DropdownTrigger>
                        <Button
                            className='my-auto'
                            variant='bordered'
                            size='sm'
                        >
                            {t(`languages.${language}`)}
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                        aria-label='language'
                        className='max-h-[70vh] overflow-y-auto'
                        onAction={(key) => {
                            setLanguage(key);
                        }}
                    >
                        <DropdownItem key='auto'>{t('languages.auto')}</DropdownItem>
                        {languageList.map((name) => {
                            return <DropdownItem key={name}>{t(`languages.${name}`)}</DropdownItem>;
                        })}
                    </DropdownMenu>
                </Dropdown>
            )}
            <Button
                variant='flat'
                color='secondary'
                size='sm'
                className='my-auto'
                startContent={<GiCycle className='text-[16px]' />}
                onPress={() => {
                    setRecognizeFlag(nanoid());
                }}
            >
                {t('recognize.recognize')}
            </Button>
            <Button
                variant='flat'
                color='primary'
                size='sm'
                className='my-auto'
                startContent={<HiTranslate className='text-[16px]' />}
                onPress={async () => {
                    if (text) {
                        void fetch(`http://127.0.0.1:${serverPort}/translate`, {
                            method: 'POST',
                            body: Body.text(text),
                            responseType: 2,
                        });
                    }
                }}
            >
                {t('recognize.translate')}
            </Button>
        </div>
    );
}
