import { useTranslation } from 'react-i18next';
import { Button, Input } from '@nextui-org/react';
import toast, { Toaster } from 'react-hot-toast';
import React, { useState } from 'react';
import { useAtomValue } from 'jotai';

import { useConfig, useToastStyle } from '../../../../../../hooks';
import { invoke } from '@tauri-apps/api';
import { pluginListAtom } from '..';

export function PluginConfig(props) {
    const pluginList = useAtomValue(pluginListAtom);
    const { updateServiceList, onClose, name } = props;
    const [loading, setLoading] = useState(false);
    const [pluginConfig, setPluginConfig] = useConfig(name, {}, { sync: false });

    const toastStyle = useToastStyle();
    const { t } = useTranslation();

    return (
        <>
            <Toaster />
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
                                <h3 className='my-auto'>{x.display}</h3>
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
                        if (Object.keys(pluginConfig).length !== 0) {
                            setLoading(true);
                            invoke('invoke_translate_plugin', {
                                name,
                                text: 'Hello',
                                from: pluginList[name].language['auto'],
                                to: pluginList[name].language['zh_cn'],
                                needs: pluginConfig,
                            }).then(
                                (_) => {
                                    setLoading(false);
                                    setPluginConfig(pluginConfig, true);
                                    updateServiceList(name);
                                    onClose();
                                },
                                (err) => {
                                    setLoading(false);
                                    toast.error(err.toString(), { style: toastStyle });
                                }
                            );
                        } else {
                            setPluginConfig(pluginConfig, true);
                            updateServiceList(name);
                            onClose();
                        }
                    }}
                >
                    {t('common.save')}
                </Button>
            </div>
        </>
    );
}
