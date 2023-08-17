import { DropdownTrigger } from '@nextui-org/react';
import { Input, Button } from '@nextui-org/react';
import { DropdownMenu } from '@nextui-org/react';
import { DropdownItem } from '@nextui-org/react';
import toast, { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Dropdown } from '@nextui-org/react';
import { open } from '@tauri-apps/api/shell';
import React, { useState } from 'react';

import { useConfig } from '../../../hooks/useConfig';
import { useToastStyle } from '../../../hooks';
import { translate } from './index';
import { Language } from './index';

export function Config(props) {
    const { updateServiceList, onClose } = props;
    const [deeplConfig, setDeeplConfig] = useConfig(
        'deepl',
        {
            type: 'free',
            authKey: '',
            customUrl: '',
        },
        { sync: false }
    );
    const [isLoading, setIsLoading] = useState(false);

    const { t } = useTranslation();
    const toastStyle = useToastStyle();

    return (
        deeplConfig !== null && (
            <>
                <Toaster />
                <div className={`config-item ${deeplConfig.type === 'free' && 'hidden'}`}>
                    <h3 className='my-auto'>{t('services.help')}</h3>
                    <Button
                        onPress={() => {
                            const url =
                                deeplConfig.type === 'api'
                                    ? 'https://pot-app.com/docs/tutorial/api/translate/deepl'
                                    : 'https://github.com/OwO-Network/DeepLX';
                            open(url);
                        }}
                    >
                        {t('services.help')}
                    </Button>
                </div>
                <div className='config-item'>
                    <h3 style={{ margin: 'auto 0' }}>{t('services.translate.deepl.type')}</h3>
                    <Dropdown>
                        <DropdownTrigger>
                            <Button variant='bordered'>{t(`services.translate.deepl.${deeplConfig.type}`)}</Button>
                        </DropdownTrigger>
                        <DropdownMenu
                            aria-label='app language'
                            onAction={(key) => {
                                setDeeplConfig({
                                    ...deeplConfig,
                                    type: key,
                                });
                            }}
                        >
                            <DropdownItem key='free'>{t(`services.translate.deepl.free`)}</DropdownItem>
                            <DropdownItem key='api'>{t(`services.translate.deepl.api`)}</DropdownItem>
                            <DropdownItem key='deeplx'>{t(`services.translate.deepl.deeplx`)}</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div>
                <div className={`config-item ${deeplConfig.type !== 'api' && 'hidden'}`}>
                    <h3 className='my-auto'>{t('services.translate.deepl.auth_key')}</h3>
                    <Input
                        type='password'
                        value={deeplConfig['authKey']}
                        variant='bordered'
                        className='max-w-[50%]'
                        onValueChange={(value) => {
                            setDeeplConfig({
                                ...deeplConfig,
                                authKey: value,
                            });
                        }}
                    />
                </div>
                <div className={`config-item ${deeplConfig.type !== 'deeplx' && 'hidden'}`}>
                    <h3 className='my-auto'>{t('services.translate.deepl.custom_url')}</h3>
                    <Input
                        value={deeplConfig.customUrl}
                        variant='bordered'
                        className='max-w-[50%]'
                        onValueChange={(value) => {
                            setDeeplConfig({
                                ...deeplConfig,
                                customUrl: value,
                            });
                        }}
                    />
                </div>
                <div>
                    <Button
                        isLoading={isLoading}
                        color='primary'
                        fullWidth
                        onPress={() => {
                            setIsLoading(true);
                            translate('hello', Language.auto, Language.zh_cn, deeplConfig).then(
                                () => {
                                    setIsLoading(false);
                                    setDeeplConfig(deeplConfig, true);
                                    updateServiceList('deepl');
                                    onClose();
                                },
                                (e) => {
                                    console.log(e);
                                    setIsLoading(false);
                                    toast.error(t('config.service.test_failed') + e.toString(), { style: toastStyle });
                                }
                            );
                        }}
                    >
                        {t('common.save')}
                    </Button>
                </div>
            </>
        )
    );
}
