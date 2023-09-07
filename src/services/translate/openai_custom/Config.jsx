import { Input, Button, Switch, Textarea } from '@nextui-org/react';
import { DropdownTrigger } from '@nextui-org/react';
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
    const [openaiConfig, setOpenaiConfig] = useConfig(
        'openai_custom',
        {
            service: 'openai',
            requestPath: 'https://api.openai.com/v1/chat/completions',
            model: 'gpt-3.5-turbo',
            apiKey: '',
            stream: false,
            systemPrompt: '',
            userPrompt: '',
        },
        { sync: false }
    );
    const [isLoading, setIsLoading] = useState(false);

    const { t } = useTranslation();
    const toastStyle = useToastStyle();

    return (
        openaiConfig !== null && (
            <>
                <Toaster />
                <div className='config-item'>
                    <h3 className='my-auto'>{t('services.help')}</h3>
                    <Button
                        onPress={() => {
                            open('https://pot-app.com/docs/tutorial/api/translate/openai');
                        }}
                    >
                        {t('services.help')}
                    </Button>
                </div>
                <div className='config-item'>
                    <h3 className='my-auto'>{t('services.translate.openai.service')}</h3>
                    <Dropdown>
                        <DropdownTrigger>
                            <Button variant='bordered'>{t(`services.translate.openai.${openaiConfig.service}`)}</Button>
                        </DropdownTrigger>
                        <DropdownMenu
                            aria-label='service'
                            onAction={(key) => {
                                setOpenaiConfig({
                                    ...openaiConfig,
                                    service: key,
                                });
                            }}
                        >
                            <DropdownItem key='openai'>{t(`services.translate.openai.openai`)}</DropdownItem>
                            <DropdownItem key='azure'>{t(`services.translate.openai.azure`)}</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div>
                <div className='config-item'>
                    <h3 className='my-auto'>{t('services.translate.openai.stream')}</h3>
                    <Switch
                        isSelected={openaiConfig['stream']}
                        onValueChange={(value) => {
                            setOpenaiConfig({
                                ...openaiConfig,
                                stream: value,
                            });
                        }}
                    />
                </div>
                <div className='config-item'>
                    <h3 className='my-auto'>{t('services.translate.openai.request_path')}</h3>
                    <Input
                        value={openaiConfig['requestPath']}
                        variant='bordered'
                        className='max-w-[50%]'
                        onValueChange={(value) => {
                            setOpenaiConfig({
                                ...openaiConfig,
                                requestPath: value,
                            });
                        }}
                    />
                </div>
                <div className='config-item '>
                    <h3 className='my-auto'>{t('services.translate.openai.api_key')}</h3>
                    <Input
                        type='password'
                        value={openaiConfig['apiKey']}
                        variant='bordered'
                        className='max-w-[50%]'
                        onValueChange={(value) => {
                            setOpenaiConfig({
                                ...openaiConfig,
                                apiKey: value,
                            });
                        }}
                    />
                </div>
                <div className={`config-item ${openaiConfig.service === 'azure' && 'hidden'}`}>
                    <h3 className='my-auto'>{t('services.translate.openai.model')}</h3>
                    <Dropdown>
                        <DropdownTrigger>
                            <Button variant='bordered'>{openaiConfig.model}</Button>
                        </DropdownTrigger>
                        <DropdownMenu
                            aria-label='service'
                            onAction={(key) => {
                                setOpenaiConfig({
                                    ...openaiConfig,
                                    model: key,
                                });
                            }}
                        >
                            <DropdownItem key='gpt-3.5-turbo'>gpt-3.5-turbo</DropdownItem>
                            <DropdownItem key='gpt-3.5-turbo-16k'>gpt-3.5-turbo-16k</DropdownItem>
                            <DropdownItem key='gpt-4'>gpt-4</DropdownItem>
                            <DropdownItem key='gpt-4-32k'>gpt-4-32k</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div>
                <div className='config-item '>
                    <Textarea
                        label={t('services.translate.openai.system_prompt')}
                        labelPlacement='outside'
                        variant='faded'
                        value={openaiConfig.systemPrompt}
                        description={t('services.translate.openai.prompt_description')}
                        onValueChange={(value) => {
                            setOpenaiConfig({
                                ...openaiConfig,
                                systemPrompt: value,
                            });
                        }}
                    />
                </div>
                <div className='config-item '>
                    <Textarea
                        label={t('services.translate.openai.user_prompt')}
                        className='mb-3'
                        value={openaiConfig.userPrompt}
                        labelPlacement='outside'
                        variant='faded'
                        description={t('services.translate.openai.prompt_description')}
                        onValueChange={(value) => {
                            setOpenaiConfig({
                                ...openaiConfig,
                                userPrompt: value,
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
                            translate('hello', Language.auto, Language.zh_cn, { config: openaiConfig }).then(
                                () => {
                                    setIsLoading(false);
                                    setOpenaiConfig(openaiConfig, true);
                                    updateServiceList('openai_custom');
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
