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
    const [config, setConfig] = useConfig('eudic', { name: 'pot', token: '' }, { sync: false });
    const { t } = useTranslation();
    const toastStyle = useToastStyle();

    return (
        config !== null && (
            <>
                <Toaster />
                <div className={'config-item'}>
                    <h3 className='my-auto'>{t('services.collection.eudic.name')}</h3>
                    <Input
                        value={config['name']}
                        variant='bordered'
                        className='max-w-[50%]'
                        onValueChange={(value) => {
                            setConfig({
                                ...config,
                                name: value,
                            });
                        }}
                    />
                </div>
                <div className={'config-item'}>
                    <h3 className='my-auto'>{t('services.collection.eudic.token')}</h3>
                    <Input
                        value={config['token']}
                        variant='bordered'
                        className='max-w-[50%]'
                        onValueChange={(value) => {
                            setConfig({
                                ...config,
                                token: value,
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
                            collection('test', '测试', { config }).then(
                                () => {
                                    setIsLoading(false);
                                    setConfig(config, true);
                                    updateServiceList('eudic');
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
