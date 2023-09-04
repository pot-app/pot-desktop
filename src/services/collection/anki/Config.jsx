import { Button, Input } from '@nextui-org/react';
import toast, { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';

import { useConfig } from '../../../hooks';
import { useToastStyle } from '../../../hooks';
import { collection } from './index';

export function Config(props) {
    const [isLoading, setIsLoading] = useState(false);
    const { updateServiceList, onClose } = props;
    const [ankiConfig, setAnkiConfig] = useConfig('anki', { port: 8765 }, { sync: false });
    const { t } = useTranslation();
    const toastStyle = useToastStyle();

    return (
        ankiConfig !== null && (
            <>
                <Toaster />
                <div className={'config-item'}>
                    <h3 className='my-auto'>{t('services.collection.anki.port')}</h3>
                    <Input
                        value={ankiConfig['port']}
                        type='number'
                        variant='bordered'
                        className='max-w-[50%]'
                        onValueChange={(value) => {
                            setAnkiConfig({
                                ...ankiConfig,
                                port: value,
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
                            collection('test', '测试').then(
                                () => {
                                    setIsLoading(false);
                                    setAnkiConfig(ankiConfig, true);
                                    updateServiceList('anki');
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
