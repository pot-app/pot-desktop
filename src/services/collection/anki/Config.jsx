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
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        setIsLoading(true);
                        collection('test', '测试', { config: ankiConfig }).then(
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
                    <div className={'config-item'}>
                        <Input
                            label={t('services.collection.anki.port')}
                            labelPlacement='outside-left'
                            value={ankiConfig['port']}
                            type='number'
                            variant='bordered'
                            classNames={{
                                base: 'justify-between',
                                label: 'text-[length:--nextui-font-size-medium]',
                                mainWrapper: 'max-w-[50%]',
                            }}
                            onValueChange={(value) => {
                                setAnkiConfig({
                                    ...ankiConfig,
                                    port: value,
                                });
                            }}
                        />
                    </div>
                    <Button
                        type='submit'
                        isLoading={isLoading}
                        fullWidth
                        color='primary'
                    >
                        {t('common.save')}
                    </Button>
                </form>
            </>
        )
    );
}
