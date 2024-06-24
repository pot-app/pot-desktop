import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Button } from '@nextui-org/react';
import { atom, useAtom, useSetAtom, useAtomValue } from 'jotai';
import { fetch, Body } from '@tauri-apps/api/http';
import { useTranslation } from 'react-i18next';
import { HiTranslate } from 'react-icons/hi';
import { GiCycle } from 'react-icons/gi';
import React, { useEffect } from 'react';
import { nanoid } from 'nanoid';
import * as builtinService from '../../../services/recognize';
import { languageList } from '../../../utils/language';
import { useConfig } from '../../../hooks';
import { textAtom } from '../TextArea';
import { pluginListAtom } from '..';
import { osType } from '../../../utils/env';
import {
    ServiceSourceType,
    getServiceSouceType,
    getServiceName,
    INSTANCE_NAME_CONFIG_KEY,
    getDisplayInstanceName,
} from '../../../utils/service_instance';

export const currentServiceInstanceKeyAtom = atom();
export const languageAtom = atom();
export const recognizeFlagAtom = atom();

export default function ControlArea(props) {
    const { serviceInstanceConfigMap, serviceInstanceList } = props;
    const pluginList = useAtomValue(pluginListAtom);
    const [recognizeLanguage] = useConfig('recognize_language', 'auto');
    const [serverPort] = useConfig('server_port', 60828);
    const setRecognizeFlag = useSetAtom(recognizeFlagAtom);
    const [currentServiceInstanceKey, setCurrentServiceInstanceKey] = useAtom(currentServiceInstanceKeyAtom);
    const [language, setLanguage] = useAtom(languageAtom);
    const text = useAtomValue(textAtom);
    const { t } = useTranslation();

    function getInstanceName(instanceKey, serviceNameSupplier) {
        const instanceConfig = serviceInstanceConfigMap[instanceKey] ?? {};
        return getDisplayInstanceName(instanceConfig[INSTANCE_NAME_CONFIG_KEY], serviceNameSupplier);
    }

    useEffect(() => {
        if (serviceInstanceList) {
            setCurrentServiceInstanceKey(serviceInstanceList[0]);
        }
        if (recognizeLanguage) {
            setLanguage(recognizeLanguage);
        }
    }, [serviceInstanceList, recognizeLanguage]);

    return (
        <div className='flex justify-between px-[12px] h-full'>
            {currentServiceInstanceKey && (
                <Dropdown>
                    <DropdownTrigger>
                        <Button
                            className='my-auto'
                            variant='bordered'
                            size='sm'
                            startContent={
                                <img
                                    className='h-[16px] w-[16px] my-auto'
                                    src={
                                        getServiceSouceType(currentServiceInstanceKey) === ServiceSourceType.PLUGIN
                                            ? pluginList[getServiceName(currentServiceInstanceKey)].icon
                                            : builtinService[getServiceName(currentServiceInstanceKey)].info.icon ===
                                                'system'
                                              ? `logo/${osType}.svg`
                                              : builtinService[getServiceName(currentServiceInstanceKey)].info.icon
                                    }
                                />
                            }
                        >
                            {getServiceSouceType(currentServiceInstanceKey) === ServiceSourceType.PLUGIN
                                ? getInstanceName(
                                      currentServiceInstanceKey,
                                      () => pluginList[getServiceName(currentServiceInstanceKey)].display
                                  )
                                : getInstanceName(currentServiceInstanceKey, () =>
                                      t(`services.recognize.${currentServiceInstanceKey}.title`)
                                  )}
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                        aria-label='service name'
                        className='max-h-[70vh] overflow-y-auto'
                        onAction={(key) => {
                            setCurrentServiceInstanceKey(key);
                        }}
                    >
                        {serviceInstanceList.map((instanceKey) => {
                            return (
                                <DropdownItem
                                    key={instanceKey}
                                    startContent={
                                        <img
                                            className='h-[16px] w-[16px] my-auto'
                                            src={
                                                getServiceSouceType(instanceKey) === ServiceSourceType.PLUGIN
                                                    ? pluginList[getServiceName(instanceKey)].icon
                                                    : builtinService[getServiceName(instanceKey)].info.icon === 'system'
                                                      ? `logo/${osType}.svg`
                                                      : builtinService[getServiceName(instanceKey)].info.icon
                                            }
                                        />
                                    }
                                >
                                    {getServiceSouceType(instanceKey) === ServiceSourceType.PLUGIN
                                        ? getInstanceName(
                                              instanceKey,
                                              () => pluginList[getServiceName(instanceKey)].display
                                          )
                                        : getInstanceName(instanceKey, () =>
                                              t(`services.recognize.${instanceKey}.title`)
                                          )}
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
