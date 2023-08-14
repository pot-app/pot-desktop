import { DropdownTrigger } from '@nextui-org/react';
import { Input, Button } from '@nextui-org/react';
import { DropdownMenu } from '@nextui-org/react';
import { DropdownItem } from '@nextui-org/react';
import toast, { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Dropdown } from '@nextui-org/react';
import React, { useState } from 'react';

import { useConfig } from '../../../hooks/useConfig';
import { useToastStyle } from '../../../hooks';
import { translate } from './index';

export function Config(props) {
    const [deeplConfig, setDeeplConfig, setDeeplConfigState] = useConfig('deepl', {
        type: 'free',
        authKey: '',
        customUrl: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    const { updateServiceList, onClose } = props;
    const { t } = useTranslation();
    const toastStyle = useToastStyle();

    return (
        <>
            <Toaster />
            <div className='config-item'>
                <h3 style={{ margin: 'auto 0' }}>{t('services.translate.deepl.type')}</h3>
                <Dropdown>
                    <DropdownTrigger>
                        <Button variant='bordered'>{t(`services.translate.deepl.${deeplConfig.type}`)}</Button>
                    </DropdownTrigger>
                    <DropdownMenu
                        aria-label='app language'
                        onAction={(key) => {
                            setDeeplConfigState({
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
            <div className='config-item'>
                <h3 className='my-auto'>{t('services.translate.deepl.auth_key')}</h3>
                <Input
                    isDisabled={deeplConfig.type !== 'api'}
                    value={deeplConfig['authKey']}
                    variant='bordered'
                    className='max-w-[100px]'
                    onValueChange={(value) => {
                        setDeeplConfigState({
                            ...deeplConfig,
                            authKey: value,
                        });
                    }}
                />
            </div>
            <div className='config-item'>
                <h3 className='my-auto'>{t('services.translate.deepl.custom_url')}</h3>
                <Input
                    isDisabled={deeplConfig.type !== 'deeplx'}
                    value={deeplConfig.customUrl}
                    variant='bordered'
                    className='max-w-[100px]'
                    onValueChange={(value) => {
                        setDeeplConfigState({
                            ...deeplConfig,
                            customUrl: value,
                        });
                    }}
                />
            </div>
            <div>
                <Button
                    isLoading={isLoading}
                    fullWidth
                    onPress={() => {
                        setIsLoading(true);
                        translate('hello', 'auto', 'zh_cn').then(
                            () => {
                                setIsLoading(false);
                                setDeeplConfig(deeplConfig);
                                updateServiceList('deepl');
                                onClose();
                            },
                            (e) => {
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
    );
}
