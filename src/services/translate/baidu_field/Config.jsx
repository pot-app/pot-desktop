import { DropdownTrigger } from '@nextui-org/react';
import { Input, Button } from '@nextui-org/react';
import { DropdownMenu } from '@nextui-org/react';
import { DropdownItem } from '@nextui-org/react';
import toast, { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Dropdown } from '@nextui-org/react';
import { open } from '@tauri-apps/api/shell';
import React, { useState } from 'react';

import { useConfig } from '../../../hooks/useConfig';
import { useToastStyle } from '../../../hooks';
import { translate } from './index';
import { Language } from './index';

export function Config(props) {
    const { updateServiceList, onClose } = props;
    const [config, setConfig] = useConfig(
        'baidu_field',
        {
            appid: '',
            secret: '',
            field: 'it',
        },
        { sync: false }
    );
    const [isLoading, setIsLoading] = useState(false);
    const fieldList = [
        'it',
        'finance',
        'machinery',
        'senimed',
        'novel',
        'academic',
        'aerospace',
        'wiki',
        'news',
        'law',
        'contract',
    ];
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
                            open('https://pot-app.com/docs/tutorial/api/translate/baidu');
                        }}
                    >
                        {t('services.help')}
                    </Button>
                </div>
                <div className='config-item'>
                    <h3 style={{ margin: 'auto 0' }}>{t('services.translate.deepl.type')}</h3>
                    <Dropdown>
                        <DropdownTrigger>
                            <Button variant='bordered'>{t(`services.translate.baidu_field.${config.field}`)}</Button>
                        </DropdownTrigger>
                        <DropdownMenu
                            aria-label='app language'
                            className='max-h-[50vh] overflow-y-auto'
                            onAction={(key) => {
                                setConfig({
                                    ...config,
                                    field: key,
                                });
                            }}
                        >
                            {fieldList.map((item) => {
                                return (
                                    <DropdownItem key={item}>
                                        {t(`services.translate.baidu_field.${item}`)}
                                    </DropdownItem>
                                );
                            })}
                        </DropdownMenu>
                    </Dropdown>
                </div>
                <div className={'config-item'}>
                    <h3 className='my-auto'>{t('services.translate.baidu.appid')}</h3>
                    <Input
                        value={config['appid']}
                        variant='bordered'
                        className='max-w-[50%]'
                        onValueChange={(value) => {
                            setConfig({
                                ...config,
                                appid: value,
                            });
                        }}
                    />
                </div>
                <div className={'config-item'}>
                    <h3 className='my-auto'>{t('services.translate.baidu.secret')}</h3>
                    <Input
                        value={config['secret']}
                        variant='bordered'
                        className='max-w-[50%]'
                        onValueChange={(value) => {
                            setConfig({
                                ...config,
                                secret: value,
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
                                    updateServiceList('baidu_field');
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
