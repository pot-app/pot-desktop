import { Input, Button, Switch, Textarea, Card, CardBody, Link, Tooltip, Progress } from '@nextui-org/react';
import { INSTANCE_NAME_CONFIG_KEY } from '../../../utils/service_instance';
import { MdDeleteOutline } from 'react-icons/md';
import toast, { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { open } from '@tauri-apps/api/shell';
import React, { useEffect, useState } from 'react';
import { Ollama } from 'ollama/browser';

import { useConfig } from '../../../hooks/useConfig';
import { useToastStyle } from '../../../hooks';
import { translate } from './index';
import { Language } from './index';

export function Config(props) {
    const { instanceKey, updateServiceList, onClose } = props;
    const { t } = useTranslation();
    const [serviceConfig, setServiceConfig] = useConfig(
        instanceKey,
        {
            [INSTANCE_NAME_CONFIG_KEY]: t('services.translate.ollama.title'),
            stream: true,
            model: 'gemma:2b',
            requestPath: 'http://localhost:11434',
            promptList: [
                {
                    role: 'system',
                    content:
                        'You are a professional translation engine, please translate the text into a colloquial, professional, elegant and fluent content, without the style of machine translation. You must only translate the text content, never interpret it.',
                },
                { role: 'user', content: `Translate into $to:\n"""\n$text\n"""` },
            ],
        },
        { sync: false }
    );
    const [isLoading, setIsLoading] = useState(false);
    const [isPulling, setIsPulling] = useState(false);
    const [progress, setProgress] = useState(0);
    const [pullingStatus, setPullingStatus] = useState('');
    const [installedModels, setInstalledModels] = useState(null);

    const toastStyle = useToastStyle();

    async function getModles() {
        try {
            const ollama = new Ollama({ host: serviceConfig.requestPath });
            const list = await ollama.list();
            setInstalledModels(list);
        } catch {
            setInstalledModels(null);
        }
    }

    async function pullModel() {
        setIsPulling(true);
        const ollama = new Ollama({ host: serviceConfig.requestPath });
        const stream = await ollama.pull({ model: serviceConfig.model, stream: true });
        for await (const part of stream) {
            if (part.digest) {
                let percent = 0;
                if (part.completed && part.total) {
                    percent = Math.round((part.completed / part.total) * 100);
                }
                setProgress(percent);
                setPullingStatus(part.status);
            } else {
                setProgress(0);
                setPullingStatus(part.status);
            }
        }
        setProgress(0);
        setPullingStatus('');
        setIsPulling(false);
        getModles();
    }

    useEffect(() => {
        if (serviceConfig !== null) {
            getModles();
        }
    }, [serviceConfig]);

    return (
        serviceConfig !== null && (
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    setIsLoading(true);
                    translate('hello', Language.auto, Language.zh_cn, { config: serviceConfig }).then(
                        () => {
                            setIsLoading(false);
                            setServiceConfig(serviceConfig, true);
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
                        value={serviceConfig[INSTANCE_NAME_CONFIG_KEY]}
                        variant='bordered'
                        classNames={{
                            base: 'justify-between',
                            label: 'text-[length:--nextui-font-size-medium]',
                            mainWrapper: 'max-w-[50%]',
                        }}
                        onValueChange={(value) => {
                            setServiceConfig({
                                ...serviceConfig,
                                [INSTANCE_NAME_CONFIG_KEY]: value,
                            });
                        }}
                    />
                </div>
                {installedModels === null && (
                    <Card
                        isBlurred
                        className='border-none bg-danger/20 dark:bg-danger/10'
                        shadow='sm'
                    >
                        <CardBody>
                            <div>
                                {t('services.translate.ollama.install_ollama')}
                                <br />
                                <Link
                                    isExternal
                                    href='https://ollama.com/download'
                                    color='primary'
                                >
                                    {t('services.translate.ollama.install_ollama_link')}
                                </Link>
                            </div>
                        </CardBody>
                    </Card>
                )}
                <div className='config-item'>
                    <h3 className='my-auto'>{t('services.help')}</h3>
                    <Button
                        onPress={() => {
                            open('https://pot-app.com/docs/api/translate/ollama.html');
                        }}
                    >
                        {t('services.help')}
                    </Button>
                </div>
                <div className='config-item'>
                    <Switch
                        isSelected={serviceConfig['stream']}
                        onValueChange={(value) => {
                            setServiceConfig({
                                ...serviceConfig,
                                stream: value,
                            });
                        }}
                        classNames={{
                            base: 'flex flex-row-reverse justify-between w-full max-w-full',
                        }}
                    >
                        {t('services.translate.ollama.stream')}
                    </Switch>
                </div>
                <div className='config-item'>
                    <Input
                        label={t('services.translate.ollama.request_path')}
                        labelPlacement='outside-left'
                        value={serviceConfig['requestPath']}
                        variant='bordered'
                        classNames={{
                            base: 'justify-between',
                            label: 'text-[length:--nextui-font-size-medium]',
                            mainWrapper: 'max-w-[50%]',
                        }}
                        onValueChange={(value) => {
                            setServiceConfig({
                                ...serviceConfig,
                                requestPath: value,
                            });
                        }}
                    />
                </div>
                <div className='config-item'>
                    <Input
                        label={t('services.translate.ollama.model')}
                        labelPlacement='outside-left'
                        value={serviceConfig['model']}
                        variant='bordered'
                        classNames={{
                            base: 'justify-between',
                            label: 'text-[length:--nextui-font-size-medium]',
                            mainWrapper: 'max-w-[50%]',
                        }}
                        onValueChange={(value) => {
                            setServiceConfig({
                                ...serviceConfig,
                                model: value,
                            });
                        }}
                        endContent={
                            installedModels &&
                            !installedModels.models
                                .map((model) => {
                                    return model.name;
                                })
                                .includes(serviceConfig['model']) ? (
                                <Tooltip content={t('services.translate.ollama.not_installed')}>
                                    <Button
                                        size='sm'
                                        variant='flat'
                                        color='warning'
                                        isLoading={isPulling}
                                        onPress={pullModel}
                                    >
                                        {t('services.translate.ollama.install_model')}
                                    </Button>
                                </Tooltip>
                            ) : (
                                <Button
                                    size='sm'
                                    variant='flat'
                                    color='success'
                                    disabled
                                >
                                    {t('services.translate.ollama.ready')}
                                </Button>
                            )
                        }
                    />
                </div>
                <Card
                    isBlurred
                    className='border-none bg-success/20 dark:bg-success/10'
                    shadow='sm'
                >
                    <CardBody>
                        {isPulling && (
                            <Progress
                                size='sm'
                                radius='sm'
                                classNames={{
                                    base: 'max-w-md',
                                    track: 'drop-shadow-md border border-default',
                                    indicator: 'bg-gradient-to-r from-pink-500 to-yellow-500',
                                    label: 'tracking-wider font-medium text-default-600',
                                    value: 'text-foreground/60',
                                }}
                                label={pullingStatus}
                                value={progress}
                                showValueLabel={true}
                            />
                        )}
                        <div className='flex justify-center'>
                            <Link
                                isExternal
                                href='https://ollama.com/library'
                                color='primary'
                            >
                                {t('services.translate.ollama.supported_models')}
                            </Link>
                        </div>
                    </CardBody>
                </Card>
                <h3 className='my-auto'>Prompt List</h3>
                <p className='text-[10px] text-default-700'>{t('services.translate.ollama.prompt_description')}</p>

                <div className='bg-content2 rounded-[10px] p-3'>
                    {serviceConfig.promptList &&
                        serviceConfig.promptList.map((prompt, index) => {
                            return (
                                <div className='config-item'>
                                    <Textarea
                                        label={prompt.role}
                                        labelPlacement='outside'
                                        variant='faded'
                                        value={prompt.content}
                                        placeholder={`Input Some ${prompt.role} Prompt`}
                                        onValueChange={(value) => {
                                            setServiceConfig({
                                                ...serviceConfig,
                                                promptList: serviceConfig.promptList.map((p, i) => {
                                                    if (i === index) {
                                                        if (i === 0) {
                                                            return {
                                                                role: 'system',
                                                                content: value,
                                                            };
                                                        } else {
                                                            return {
                                                                role: index % 2 !== 0 ? 'user' : 'assistant',
                                                                content: value,
                                                            };
                                                        }
                                                    } else {
                                                        return p;
                                                    }
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
                                            setServiceConfig({
                                                ...serviceConfig,
                                                promptList: serviceConfig.promptList.filter((_, i) => i !== index),
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
                            setServiceConfig({
                                ...serviceConfig,
                                promptList: [
                                    ...serviceConfig.promptList,
                                    {
                                        role:
                                            serviceConfig.promptList.length === 0
                                                ? 'system'
                                                : serviceConfig.promptList.length % 2 === 0
                                                  ? 'assistant'
                                                  : 'user',
                                        content: '',
                                    },
                                ],
                            });
                        }}
                    >
                        {t('services.translate.ollama.add')}
                    </Button>
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
