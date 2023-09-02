import { useTranslation } from 'react-i18next';
import { Button, Input } from '@nextui-org/react';
import React from 'react';
import { useAtomValue } from 'jotai';

import { pluginListAtom } from '..';
import { useConfig } from '../../../../../../hooks';

export function PluginConfig(props) {
    const pluginList = useAtomValue(pluginListAtom);
    const { updateServiceList, onClose, name } = props;
    const [pluginConfig, setPluginConfig] = useConfig(name, {}, { sync: false });

    const { t } = useTranslation();

    return (
        <>
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
                    fullWidth
                    color='primary'
                    onPress={() => {
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
