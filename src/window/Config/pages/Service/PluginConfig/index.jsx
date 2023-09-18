import { useTranslation } from 'react-i18next';
import { Button, Input } from '@nextui-org/react';
import toast, { Toaster } from 'react-hot-toast';
import { open } from '@tauri-apps/api/shell';
import React, { useState } from 'react';

import { useConfig, useToastStyle } from '../../../../../hooks';
import { invoke } from '@tauri-apps/api';

export function PluginConfig(props) {
    const { updateServiceList, onClose, name, pluginType, pluginList } = props;
    const [loading, setLoading] = useState(false);
    const [pluginConfig, setPluginConfig] = useConfig(name, {}, { sync: false });

    const toastStyle = useToastStyle();
    const { t } = useTranslation();

    return (
        <>
            <Toaster />
            <div className={'config-item'}>
                <h3 className='my-auto select-none cursor-default'>{t('config.service.homepage')}</h3>
                <Button
                    onPress={() => {
                        open(pluginList[name].homepage);
                    }}
                >
                    {t('config.service.homepage')}
                </Button>
            </div>
            {pluginList[name].needs.length === 0 ? (
                <div>{t('services.no_need')}</div>
            ) : (
                pluginList[name].needs.map((x) => {
                    return (
                        pluginConfig && (
                            <div
                                key={x.key}
                                className={`config-item`}
                            >
                                <h3 className='my-auto select-none cursor-default'>{x.display}</h3>
                                <Input
                                    value={`${pluginConfig.hasOwnProperty(x.key) ? pluginConfig[x.key] : ''}`}
                                    variant='bordered'
                                    className='max-w-[50%]'
                                    onValueChange={(value) => {
                                        setPluginConfig({
                                            ...pluginConfig,
                                            [x.key]: value,
                                        });
                                    }}
                                />
                            </div>
                        )
                    );
                })
            )}

            <div>
                <Button
                    isLoading={loading}
                    fullWidth
                    color='primary'
                    onPress={() => {
                        setPluginConfig(pluginConfig, true);
                        updateServiceList(name);
                        onClose();
                    }}
                >
                    {t('common.save')}
                </Button>
            </div>
        </>
    );
}
