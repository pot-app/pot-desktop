import { INSTANCE_NAME_CONFIG_KEY } from '../../../utils/service_instance';
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
    const { instanceKey, updateServiceList, onClose } = props;
    const { t } = useTranslation();
    const [deeplConfig, setDeeplConfig] = useConfig(
        instanceKey,
        {
            [INSTANCE_NAME_CONFIG_KEY]: t('services.translate.deepl.title'),
            type: 'free',
            authKey: '',
            customUrl: '',
        },
        { sync: false }
    );
    const [isLoading, setIsLoading] = useState(false);

    const toastStyle = useToastStyle();

    return (
        deeplConfig !== null && (
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    setIsLoading(true);
                    translate('hello', Language.auto, Language.zh_cn, { config: deeplConfig }).then(
                        () => {
                            setIsLoading(false);
                            setDeeplConfig(deeplConfig, true);
                            updateServiceList(instanceKey);
                            onClose();
                        },
                        (e) => {
                            setIsLoading(false);
                            toast.error(t('config.service.test_failed') + e.toString(), { style: toastStyle });
                        }
                    );
                }}
            >
                <Toaster />
                <div className='config-item'>
                    <Input
                        label={t('services.instance_name')}
                        labelPlacement='outside-left'
                        value={deeplConfig[INSTANCE_NAME_CONFIG_KEY]}
                        variant='bordered'
                        classNames={{
                            base: 'justify-between',
                            label: 'text-[length:--nextui-font-size-medium]',
                            mainWrapper: 'max-w-[50%]',
                        }}
                        onValueChange={(value) => {
                            setDeeplConfig({
                                ...deeplConfig,
                                [INSTANCE_NAME_CONFIG_KEY]: value,
                            });
                        }}
                    />
                </div>
                <div className={`config-item ${deeplConfig.type === 'free' && 'hidden'}`}>
                    <h3 className='my-auto'>{t('services.help')}</h3>
                    <Button
                        onPress={() => {
                            const url =
                                deeplConfig.type === 'api'
                                    ? 'https://pot-app.com/docs/api/translate/deepl.html'
                                    : 'https://github.com/OwO-Network/DeepLX';
                            open(url);
                        }}
                    >
                        {t('services.help')}
                    </Button>
                </div>
                <div className='config-item'>
                    <h3 className='my-auto'>{t('services.translate.deepl.type')}</h3>
                    <Dropdown>
                        <DropdownTrigger>
                            <Button variant='bordered'>{t(`services.translate.deepl.${deeplConfig.type}`)}</Button>
                        </DropdownTrigger>
                        <DropdownMenu
                            autoFocus='first'
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
                    <Input
                        label={t('services.translate.deepl.auth_key')}
                        labelPlacement='outside-left'
                        type='password'
                        value={deeplConfig['authKey']}
                        variant='bordered'
                        classNames={{
                            base: 'justify-between',
                            label: 'text-[length:--nextui-font-size-medium]',
                            mainWrapper: 'max-w-[50%]',
                        }}
                        onValueChange={(value) => {
                            setDeeplConfig({
                                ...deeplConfig,
                                authKey: value,
                            });
                        }}
                    />
                </div>
                <div className={`config-item ${deeplConfig.type !== 'deeplx' && 'hidden'}`}>
                    <Input
                        label={t('services.translate.deepl.custom_url')}
                        labelPlacement='outside-left'
                        value={deeplConfig.customUrl}
                        variant='bordered'
                        classNames={{
                            base: 'justify-between',
                            label: 'text-[length:--nextui-font-size-medium]',
                            mainWrapper: 'max-w-[50%]',
                        }}
                        onValueChange={(value) => {
                            setDeeplConfig({
                                ...deeplConfig,
                                customUrl: value,
                            });
                        }}
                    />
                </div>
                <Button
                    type='submit'
                    isLoading={isLoading}
                    color='primary'
                    fullWidth
                >
                    {t('common.save')}
                </Button>
            </form>
        )
    );
}
