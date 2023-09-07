import { useTranslation } from 'react-i18next';
import { Button, Input } from '@nextui-org/react';
import toast, { Toaster } from 'react-hot-toast';
import { open } from '@tauri-apps/api/shell';
import React, { useState } from 'react';

import { useConfig, useToastStyle } from '../../../../../hooks';
import { invoke } from '@tauri-apps/api';

export function PluginConfig(props) {
    // const pluginList = useAtomValue(pluginListAtom);
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
                        if (Object.keys(pluginConfig).length !== 0) {
                            setLoading(true);
                            invoke('invoke_plugin', {
                                name,
                                pluginType,
                                text: 'Hello',
                                from: pluginList[name].language['auto'],
                                to: pluginList[name].language['zh_cn'],
                                base64: 'iVBORw0KGgoAAAANSUhEUgAAADsAAAAeCAYAAACSRGY2AAAAAXNSR0IArs4c6QAAArNJREFUWEftl19IU1Ecxz+O5uQiNTCJkNj0ZWhkSOyh7CEy0CWZQQoTWYgvk17KFAdr9GBBYGb/qD0oUpgSCZViGkTRQ/hwEVOYIIhlMF8kUjbGZGPFdGtrGvcWzTa79/Gec+79fb7fc36/38nQ6/Xf+E+eDAV2mzqdns6WtDNRqYP5UQ71D8i2RoGVLdW/mqg4K6287G3sqHtEdYEP8clrdpZXYdCCxzWE/dkHjp5poXa/AMEVZodvU+ea2/Dn0n2NnK8wYsgVQAWEAng+TfHiZTddy75NI83LtdBRfSS2xruIONKNNftccs9sFPbLkpqcXUCmei1At2uO3YU6CKnR7AhDLDJ204bdH4u/tKSdjkodmvCrEKz6A2iE9fWEVhAftmF1JwBnmxm0msjPinzHH2A1U42GFcSJZYzGJCaodVhYnRqgZngUCmw8rStC419gzOnA7iuio8HG8b3wccTC2clIkFkWhppPkKcK4H7bTev7cWbDQ5kHcZxqorpQAO8M929dp+eHPgJtNXepNajh6wx9j+9E3BeoONBCc7mOnCx18rJxFDYGYmbwson85Sm67nXSB9SXO7loFPCIDzj2anwtdOPhTpxlueB+h7W3BzF+w6pM9F8wYxACTPc30jAfHTTR22ymeMP78HicEMkqPX8Ku5kAMV6Ba/VOKvQJu4GIkCzx5sYlWuOOxE8CphcsbBQxjBOFXeD5VQftiekr2aUnOc4qsNvV2W12ZuVlYx9irxWrO82zMXLqbFz5WseVqLNlOnKyU7DOhkP/qx2Uysf05BLFJVvQQf1uUxHdmIY9Fq5UxfW5wQCezxK9sbYKx+mTGPMi/fRW9cbSd4rUnyH71pP6KNIRKrDSGqXnDMXZ9PRNOmrF2USNtFotXq+XYDAoLV8Kz5DlrAKbwg7+KrTvuhRWXxXeDuUAAAAASUVORK5CYII=',
                                lang: pluginList[name].language['auto'],
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
