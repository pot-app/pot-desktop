import { Input, Button } from '@nextui-org/react';
import toast, { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { open } from '@tauri-apps/api/shell';
import React, { useState } from 'react';

import { useConfig } from '../../../hooks/useConfig';
import { useToastStyle } from '../../../hooks';
import { translate } from './index';
import { Language } from './index';

export function Config(props) {
    const { updateServiceList, onClose } = props;
    const [config, setConfig] = useConfig(
        'alibaba',
        {
            accesskey_id: '',
            accesskey_secret: '',
        },
        { sync: false }
    );
    const [isLoading, setIsLoading] = useState(false);

    const { t } = useTranslation();
    const toastStyle = useToastStyle();

    return (
        config !== null && (
            <>
                <Toaster />
                <div className={'config-item'}>
                    <h3 className='my-auto'>{t('services.help')}</h3>
                    <Button
                        onPress={() => {
                            open('https://pot-app.com/docs/tutorial/api/translate/alibaba');
                        }}
                    >
                        {t('services.help')}
                    </Button>
                </div>
                <div className={'config-item'}>
                    <h3 className='my-auto'>{t('services.translate.alibaba.accesskey_id')}</h3>
                    <Input
                        value={config['accesskey_id']}
                        variant='bordered'
                        className='max-w-[50%]'
                        onValueChange={(value) => {
                            setConfig({
                                ...config,
                                accesskey_id: value,
                            });
                        }}
                    />
                </div>
                <div className={'config-item'}>
                    <h3 className='my-auto'>{t('services.translate.alibaba.accesskey_secret')}</h3>
                    <Input
                        value={config['accesskey_secret']}
                        variant='bordered'
                        className='max-w-[50%]'
                        onValueChange={(value) => {
                            setConfig({
                                ...config,
                                accesskey_secret: value,
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
                            translate('hello', Language.auto, Language.zh_cn, { config }).then(
                                () => {
                                    setIsLoading(false);
                                    setConfig(config, true);
                                    updateServiceList('transmart');
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
