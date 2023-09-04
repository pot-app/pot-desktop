import { Button, Input } from '@nextui-org/react';
import toast, { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';

import { useConfig } from '../../../hooks/useConfig';
import { useToastStyle } from '../../../hooks';
import { Language } from './index';
import { tts } from './index';

export function Config(props) {
    const [isLoading, setIsLoading] = useState(false);
    const { updateServiceList, onClose } = props;
    const [lingvaConfig, setLingvaConfig] = useConfig(
        'lingva_tts',
        { requestPath: 'lingva.pot-app.com' },
        { sync: false }
    );
    const { t } = useTranslation();
    const toastStyle = useToastStyle();

    return (
        lingvaConfig !== null && (
            <>
                <Toaster />
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
                                    updateServiceList('lingva_tts');
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
