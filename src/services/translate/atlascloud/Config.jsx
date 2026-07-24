import { Input, Button, Switch, Textarea } from '@nextui-org/react';
import { MdDeleteOutline } from 'react-icons/md';
import toast, { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';

import { useConfig } from '../../../hooks/useConfig';
import { useToastStyle } from '../../../hooks';
import { translate } from './index';
import { Language } from './index';
import { INSTANCE_NAME_CONFIG_KEY } from '../../../utils/service_instance';
import {
    ATLASCLOUD_DEFAULT_MODEL,
    ATLASCLOUD_DEFAULT_REQUEST_PATH,
    defaultPromptList,
    defaultRequestArguments,
} from './defaults';

export function Config(props) {
    const { instanceKey, updateServiceList, onClose } = props;
    const { t } = useTranslation();
    const [atlasCloudConfig, setAtlasCloudConfig] = useConfig(
        instanceKey,
        {
            [INSTANCE_NAME_CONFIG_KEY]: t('services.translate.atlascloud.title'),
            requestPath: ATLASCLOUD_DEFAULT_REQUEST_PATH,
            model: ATLASCLOUD_DEFAULT_MODEL,
            apiKey: '',
            stream: false,
            promptList: defaultPromptList,
            requestArguments: defaultRequestArguments,
        },
        { sync: false }
    );

    if (atlasCloudConfig) {
        const nextConfig = {};
        if (atlasCloudConfig.requestPath === undefined) {
            nextConfig.requestPath = ATLASCLOUD_DEFAULT_REQUEST_PATH;
        }
        if (atlasCloudConfig.model === undefined) {
            nextConfig.model = ATLASCLOUD_DEFAULT_MODEL;
        }
        if (atlasCloudConfig.promptList === undefined) {
            nextConfig.promptList = defaultPromptList;
        }
        if (atlasCloudConfig.requestArguments === undefined) {
            nextConfig.requestArguments = defaultRequestArguments;
        }
        if (Object.keys(nextConfig).length > 0) {
            setAtlasCloudConfig({
                ...atlasCloudConfig,
                ...nextConfig,
            });
        }
    }

    const [isLoading, setIsLoading] = useState(false);

    const toastStyle = useToastStyle();

    return (
        atlasCloudConfig !== null && (
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    setIsLoading(true);
                    translate('hello', Language.auto, Language.zh_cn, { config: atlasCloudConfig }).then(
                        () => {
                            setIsLoading(false);
                            setAtlasCloudConfig(atlasCloudConfig, true);
                            updateServiceList(instanceKey);
                            onClose();
                        },
                        (e) => {
                            setIsLoading(false);
                            toast.error(t('config.service.test_failed') + e.toString(), { style: toastStyle });
                        }
                    );
                }}
            >
                <Toaster />
                <div className='config-item'>
                    <Input
                        label={t('services.instance_name')}
                        labelPlacement='outside-left'
                        value={atlasCloudConfig[INSTANCE_NAME_CONFIG_KEY]}
                        variant='bordered'
                        classNames={{
                            base: 'justify-between',
                            label: 'text-[length:--nextui-font-size-medium]',
                            mainWrapper: 'max-w-[50%]',
                        }}
                        onValueChange={(value) => {
                            setAtlasCloudConfig({
                                ...atlasCloudConfig,
                                [INSTANCE_NAME_CONFIG_KEY]: value,
                            });
                        }}
                    />
                </div>
                <div className='config-item'>
                    <Switch
                        isSelected={atlasCloudConfig['stream']}
                        onValueChange={(value) => {
                            setAtlasCloudConfig({
                                ...atlasCloudConfig,
                                stream: value,
                            });
                        }}
                        classNames={{
                            base: 'flex flex-row-reverse justify-between w-full max-w-full',
                        }}
                    >
                        {t('services.translate.openai.stream')}
                    </Switch>
                </div>
                <div className='config-item'>
                    <Input
                        label={t('services.translate.openai.request_path')}
                        labelPlacement='outside-left'
                        value={atlasCloudConfig['requestPath']}
                        variant='bordered'
                        classNames={{
                            base: 'justify-between',
                            label: 'text-[length:--nextui-font-size-medium]',
                            mainWrapper: 'max-w-[50%]',
                        }}
                        onValueChange={(value) => {
                            setAtlasCloudConfig({
                                ...atlasCloudConfig,
                                requestPath: value,
                            });
                        }}
                    />
                </div>
                <div className='config-item'>
                    <Input
                        label={t('services.translate.openai.api_key')}
                        labelPlacement='outside-left'
                        type='password'
                        value={atlasCloudConfig['apiKey']}
                        variant='bordered'
                        classNames={{
                            base: 'justify-between',
                            label: 'text-[length:--nextui-font-size-medium]',
                            mainWrapper: 'max-w-[50%]',
                        }}
                        onValueChange={(value) => {
                            setAtlasCloudConfig({
                                ...atlasCloudConfig,
                                apiKey: value,
                            });
                        }}
                    />
                </div>
                <div className='config-item'>
                    <Input
                        label={t('services.translate.openai.model')}
                        labelPlacement='outside-left'
                        value={atlasCloudConfig['model']}
                        variant='bordered'
                        classNames={{
                            base: 'justify-between',
                            label: 'text-[length:--nextui-font-size-medium]',
                            mainWrapper: 'max-w-[50%]',
                        }}
                        onValueChange={(value) => {
                            setAtlasCloudConfig({
                                ...atlasCloudConfig,
                                model: value,
                            });
                        }}
                    />
                </div>
                <h3 className='my-auto'>Prompt List</h3>
                <p className='text-[10px] text-default-700'>{t('services.translate.openai.prompt_description')}</p>

                <div className='bg-content2 rounded-[10px] p-3'>
                    {atlasCloudConfig.promptList &&
                        atlasCloudConfig.promptList.map((prompt, index) => {
                            return (
                                <div
                                    className='config-item'
                                    key={index}
                                >
                                    <Textarea
                                        label={prompt.role}
                                        labelPlacement='outside'
                                        variant='faded'
                                        value={prompt.content}
                                        placeholder={`Input Some ${prompt.role} Prompt`}
                                        onValueChange={(value) => {
                                            setAtlasCloudConfig({
                                                ...atlasCloudConfig,
                                                promptList: atlasCloudConfig.promptList.map((p, i) => {
                                                    if (i === index) {
                                                        if (i === 0) {
                                                            return {
                                                                role: 'system',
                                                                content: value,
                                                            };
                                                        }
                                                        return {
                                                            role: index % 2 !== 0 ? 'user' : 'assistant',
                                                            content: value,
                                                        };
                                                    }
                                                    return p;
                                                }),
                                            });
                                        }}
                                    />
                                    <Button
                                        isIconOnly
                                        color='danger'
                                        className='my-auto mx-1'
                                        variant='flat'
                                        onPress={() => {
                                            setAtlasCloudConfig({
                                                ...atlasCloudConfig,
                                                promptList: atlasCloudConfig.promptList.filter((_, i) => i !== index),
                                            });
                                        }}
                                    >
                                        <MdDeleteOutline className='text-[18px]' />
                                    </Button>
                                </div>
                            );
                        })}
                    <Button
                        fullWidth
                        onPress={() => {
                            setAtlasCloudConfig({
                                ...atlasCloudConfig,
                                promptList: [
                                    ...atlasCloudConfig.promptList,
                                    {
                                        role:
                                            atlasCloudConfig.promptList.length === 0
                                                ? 'system'
                                                : atlasCloudConfig.promptList.length % 2 === 0
                                                  ? 'assistant'
                                                  : 'user',
                                        content: '',
                                    },
                                ],
                            });
                        }}
                    >
                        {t('services.translate.openai.add')}
                    </Button>
                </div>
                <br />

                <h3 className='my-auto'>Request Arguments</h3>
                <div className='config-item'>
                    <Textarea
                        label=''
                        labelPlacement='outside'
                        variant='faded'
                        value={atlasCloudConfig['requestArguments']}
                        placeholder={`Input API Request Arguments`}
                        onValueChange={(value) => {
                            setAtlasCloudConfig({
                                ...atlasCloudConfig,
                                requestArguments: value,
                            });
                        }}
                    />
                </div>
                <br />
                <Button
                    type='submit'
                    isLoading={isLoading}
                    fullWidth
                    color='primary'
                >
                    {t('common.save')}
                </Button>
            </form>
        )
    );
}
