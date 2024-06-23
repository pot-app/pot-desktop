import { INSTANCE_NAME_CONFIG_KEY } from '../../../utils/service_instance';
import { Button, Input } from '@nextui-org/react';
import toast, { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { open } from '@tauri-apps/api/shell';
import React, { useState } from 'react';

import { useConfig } from '../../../hooks/useConfig';
import { useToastStyle } from '../../../hooks';
import { Language } from './index';
import { tts } from './index';

export function Config(props) {
    const [isLoading, setIsLoading] = useState(false);
    const { instanceKey, updateServiceList, onClose } = props;
    const { t } = useTranslation();
    const [lingvaConfig, setLingvaConfig] = useConfig(
        instanceKey,
        {
            [INSTANCE_NAME_CONFIG_KEY]: t('services.tts.lingva_tts.title'),
            requestPath: 'lingva.pot-app.com',
        },
        { sync: false }
    );

    const toastStyle = useToastStyle();

    return (
        lingvaConfig !== null && (
            <>
                <Toaster />
                <div className='config-item'>
                    <Input
                        label={t('services.instance_name')}
                        labelPlacement='outside-left'
                        value={lingvaConfig[INSTANCE_NAME_CONFIG_KEY]}
                        variant='bordered'
                        classNames={{
                            base: 'justify-between',
                            label: 'text-[length:--nextui-font-size-medium]',
                            mainWrapper: 'max-w-[50%]',
                        }}
                        onValueChange={(value) => {
                            setLingvaConfig({
                                ...lingvaConfig,
                                [INSTANCE_NAME_CONFIG_KEY]: value,
                            });
                        }}
                    />
                </div>
                <div className={'config-item'}>
                    <h3 className='my-auto'>{t('services.help')}</h3>
                    <Button
                        onPress={() => {
                            open('https://pot-app.com/docs/api/tts/lingva.html');
                        }}
                    >
                        {t('services.help')}
                    </Button>
                </div>
                <div className={'config-item'}>
                    <h3 className='my-auto'>{t('services.tts.lingva_tts.request_path')}</h3>
                    <Input
                        value={lingvaConfig['requestPath']}
                        variant='bordered'
                        className='max-w-[50%]'
                        onValueChange={(value) => {
                            setLingvaConfig({
                                ...lingvaConfig,
                                requestPath: value,
                            });
                        }}
                    />
                </div>
                <div>
                    <Button
                        isLoading={isLoading}
                        fullWidth
                        color='primary'
                        onPress={() => {
                            setIsLoading(true);
                            tts('hello', Language.en, { config: lingvaConfig }).then(
                                () => {
                                    setIsLoading(false);
                                    setLingvaConfig(lingvaConfig, true);
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
                        {t('common.save')}
                    </Button>
                </div>
            </>
        )
    );
}
