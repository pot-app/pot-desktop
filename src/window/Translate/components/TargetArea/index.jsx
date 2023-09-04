import { Card, CardBody, CardHeader, CardFooter, Spacer, Button, ButtonGroup, Skeleton } from '@nextui-org/react';
import { BiCollapseVertical, BiExpandVertical } from 'react-icons/bi';
import { sendNotification } from '@tauri-apps/api/notification';
import React, { useEffect, useState, useRef } from 'react';
import { writeText } from '@tauri-apps/api/clipboard';
import { TbTransformFilled } from 'react-icons/tb';
import { HiOutlineVolumeUp } from 'react-icons/hi';
import toast, { Toaster } from 'react-hot-toast';
import { MdContentCopy } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { invoke } from '@tauri-apps/api';
import { useAtomValue } from 'jotai';
import { nanoid } from 'nanoid';

import { sourceLanguageAtom, targetLanguageAtom } from '../LanguageArea';
import { sourceTextAtom, detectLanguageAtom } from '../SourceArea';
import * as buildinCollectionServices from '../../../../services/collection';
import * as buildinServices from '../../../../services/translate';
import * as buildinTtsServices from '../../../../services/tts';
import { useConfig, useToastStyle } from '../../../../hooks';
import { store } from '../../../../utils/store';

let translateID = [];

export default function TargetArea(props) {
    const [collectionServiceList] = useConfig('collection_service_list', []);
    const [ttsServiceList] = useConfig('tts_service_list', ['lingva_tts']);
    const [translateSecondLanguage] = useConfig('translate_second_language', 'en');
    const [autoCopy] = useConfig('translate_auto_copy', 'disable');
    const [hideWindow] = useConfig('translate_hide_window', false);
    const { name, index, pluginList, ...drag } = props;
    const [result, setResult] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hide, setHide] = useState(false);
    const sourceText = useAtomValue(sourceTextAtom);
    const sourceLanguage = useAtomValue(sourceLanguageAtom);
    const targetLanguage = useAtomValue(targetLanguageAtom);
    const detectLanguage = useAtomValue(detectLanguageAtom);
    const { t } = useTranslation();
    const textAreaRef = useRef();
    const toastStyle = useToastStyle();

    useEffect(() => {
        setResult('');
        setError('');
        if (sourceText !== '' && sourceLanguage && targetLanguage && autoCopy !== null && hideWindow !== null) {
            if (autoCopy === 'source') {
                writeText(sourceText).then(() => {
                    if (hideWindow) {
                        sendNotification({ title: t('common.write_clipboard'), body: sourceText });
                    }
                });
            }
            translate();
        }
    }, [sourceText, targetLanguage, sourceLanguage, autoCopy, hideWindow]);

    const translate = async () => {
        let id = nanoid();
        translateID[index] = id;
        if (name.startsWith('[plugin]')) {
            const pluginInfo = pluginList['translate'][name];
            if (sourceLanguage in pluginInfo.language && targetLanguage in pluginInfo.language) {
                let newTargetLanguage = targetLanguage;
                if (sourceLanguage === 'auto' && targetLanguage === detectLanguage) {
                    newTargetLanguage = translateSecondLanguage;
                }
                setIsLoading(true);
                const pluginConfig = (await store.get(name)) ?? {};
                invoke('invoke_plugin', {
                    name,
                    pluginType: 'translate',
                    text: sourceText,
                    from: pluginInfo.language[sourceLanguage],
                    to: pluginInfo.language[newTargetLanguage],
                    needs: pluginConfig,
                }).then(
                    (v) => {
                        if (translateID[index] !== id) return;
                        setResult(v);
                        setIsLoading(false);
                        if (index === 0) {
                            switch (autoCopy) {
                                case 'target':
                                    writeText(v).then(() => {
                                        if (hideWindow) {
                                            sendNotification({ title: t('common.write_clipboard'), body: v });
                                        }
                                    });
                                    break;
                                case 'source_target':
                                    writeText(sourceText + '\n\n' + v).then(() => {
                                        if (hideWindow) {
                                            sendNotification({
                                                title: t('common.write_clipboard'),
                                                body: sourceText + '\n\n' + v,
                                            });
                                        }
                                    });
                                    break;
                                default:
                                    break;
                            }
                        }
                    },
                    (e) => {
                        if (translateID[index] !== id) return;
                        setError(e.toString());
                        setIsLoading(false);
                    }
                );
            }
        } else {
            const LanguageEnum = buildinServices[name].Language;
            if (sourceLanguage in LanguageEnum && targetLanguage in LanguageEnum) {
                let newTargetLanguage = targetLanguage;
                if (sourceLanguage === 'auto' && targetLanguage === detectLanguage) {
                    newTargetLanguage = translateSecondLanguage;
                }
                setIsLoading(true);
                buildinServices[name]
                    .translate(sourceText, LanguageEnum[sourceLanguage], LanguageEnum[newTargetLanguage], {
                        setResult: (v) => {
                            if (translateID[index] !== id) return;
                            setResult(v);
                            setIsLoading(false);
                        },
                    })
                    .then(
                        (v) => {
                            if (translateID[index] !== id) return;
                            setResult(v);
                            setIsLoading(false);
                            if (index === 0) {
                                switch (autoCopy) {
                                    case 'target':
                                        writeText(v).then(() => {
                                            if (hideWindow) {
                                                sendNotification({ title: 打破, body: v });
                                            }
                                        });
                                        break;
                                    case 'source_target':
                                        writeText(sourceText + '\n\n' + v).then(() => {
                                            if (hideWindow) {
                                                sendNotification({
                                                    title: t('common.write_clipboard'),
                                                    body: sourceText + '\n\n' + v,
                                                });
                                            }
                                        });
                                        break;
                                    default:
                                        break;
                                }
                            }
                        },
                        (e) => {
                            if (translateID[index] !== id) return;
                            setError(e.toString());
                            setIsLoading(false);
                        }
                    );
            } else {
                setError('Language not supported');
            }
        }
    };
    useEffect(() => {
        if (textAreaRef.current !== null) {
            textAreaRef.current.style.height = '0px';
            if (result !== '') {
                textAreaRef.current.style.height = textAreaRef.current.scrollHeight + 'px';
            }
        }
    }, [result]);
    return (
        <Card
            shadow='none'
            className='rounded-[10px]'
        >
            <Toaster />
            <CardHeader
                className={`flex justify-between py-1 pr-0 bg-content2 h-[30px] ${
                    hide ? 'rounded-[10px]' : 'rounded-t-[10px]'
                }`}
                {...drag}
            >
                <div className='flex'>
                    {name.startsWith('[plugin]') ? (
                        <>
                            <img
                                src={pluginList['translate'][name].icon}
                                className='h-[20px] my-auto'
                            />
                            <Spacer x={2} />
                            <div className='my-auto'>{`${pluginList['translate'][name].display} [${t(
                                'common.plugin'
                            )}]`}</div>
                        </>
                    ) : (
                        <>
                            <img
                                src={buildinServices[name].info.icon}
                                className='h-[20px] my-auto'
                            />
                            <Spacer x={2} />
                            <div className='my-auto'>{t(`services.translate.${name}.title`)}</div>
                        </>
                    )}
                </div>
                <div className='flex'>
                    <Button
                        size='sm'
                        isIconOnly
                        variant='light'
                        className='h-[20px] w-[20px]'
                        onPress={() => setHide(!hide)}
                    >
                        {hide ? (
                            <BiExpandVertical className='text-[16px]' />
                        ) : (
                            <BiCollapseVertical className='text-[16px]' />
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardBody
                className={`p-[12px] pb-0 ${hide && 'hidden'} ${
                    result === '' && error === '' && !isLoading && 'hidden'
                }`}
            >
                {isLoading ? (
                    <div className='space-y-3'>
                        <Skeleton className='w-4/5 rounded-lg'>
                            <div className='h-3 w-4/5 rounded-lg bg-default-200'></div>
                        </Skeleton>
                        <Skeleton className='w-3/5 rounded-lg'>
                            <div className='h-3 w-3/5 rounded-lg bg-default-200'></div>
                        </Skeleton>
                    </div>
                ) : typeof result === 'string' ? (
                    <textarea
                        ref={textAreaRef}
                        className='h-0 resize-none bg-transparent select-text outline-none'
                        readOnly
                        value={result}
                    />
                ) : (
                    <div>
                        {result['pronunciations'] &&
                            result['pronunciations'].map((pronunciation) => {
                                return (
                                    <span key={nanoid()}>
                                        {pronunciation['region'] && (
                                            <span className='mr-[12px] text-default-500'>
                                                {pronunciation['region']}
                                            </span>
                                        )}
                                        <span className='mr-[12px] text-default-500'>{pronunciation['symbol']}</span>
                                        {pronunciation['voice'] && (
                                            <span className='mr-[12px] text-default-500'>{pronunciation['voice']}</span>
                                        )}
                                    </span>
                                );
                            })}
                        {result['explanations'] &&
                            result['explanations'].map((explanations) => {
                                return (
                                    <div key={nanoid()}>
                                        {explanations['explains'].map((explain, index) => {
                                            return (
                                                <span key={nanoid()}>
                                                    {index === 0 ? (
                                                        <>
                                                            <span className='font-bold text-[18px] select-text mr-[12px]'>
                                                                {explain}
                                                            </span>
                                                            <span className='text-[10px] text-default-500'>
                                                                {explanations['trait']}
                                                            </span>
                                                            <br />
                                                        </>
                                                    ) : (
                                                        <span
                                                            className='text-[12px] text-default-500 mr-[8px] select-text'
                                                            key={nanoid()}
                                                        >
                                                            {explain}
                                                        </span>
                                                    )}
                                                </span>
                                            );
                                        })}
                                        <br />
                                    </div>
                                );
                            })}
                        {result['sentence'] &&
                            result['sentence'].map((sentence, index) => {
                                return (
                                    <div key={nanoid()}>
                                        <span className='mr-[12px]'>{index + 1}.</span>
                                        <>
                                            {sentence['source'] && (
                                                <span
                                                    className='select-text'
                                                    dangerouslySetInnerHTML={{
                                                        __html: sentence['source'],
                                                    }}
                                                />
                                            )}
                                        </>
                                        <>
                                            {sentence['target'] && (
                                                <div
                                                    className='select-text text-default-500'
                                                    dangerouslySetInnerHTML={{
                                                        __html: sentence['target'],
                                                    }}
                                                />
                                            )}
                                        </>
                                    </div>
                                );
                            })}
                    </div>
                )}
                {error !== '' ? (
                    error.split('\n').map((v) => {
                        return (
                            <p
                                key={v}
                                className='text-red-500'
                            >
                                {v}
                            </p>
                        );
                    })
                ) : (
                    <></>
                )}
            </CardBody>
            <CardFooter
                className={`bg-content1 rounded-none rounded-b-[10px] flex px-[12px] p-[5px] ${hide && 'hidden'}`}
            >
                <ButtonGroup>
                    <Button
                        isIconOnly
                        variant='light'
                        size='sm'
                        isDisabled={typeof result !== 'string' || result === ''}
                        onPress={async () => {
                            const serviceName = ttsServiceList[0];
                            if (serviceName.startsWith('[plugin]')) {
                                const config = (await store.get(serviceName)) ?? {};
                                invoke('invoke_plugin', {
                                    name: serviceName,
                                    pluginType: 'tts',
                                    text: result,
                                    lang: ttsPluginInfo.language[targetLanguage],
                                    needs: config,
                                });
                            } else {
                                await buildinTtsServices[serviceName].tts(
                                    result,
                                    buildinTtsServices[serviceName].Language[targetLanguage]
                                );
                            }
                        }}
                    >
                        <HiOutlineVolumeUp className='text-[16px]' />
                    </Button>
                    <Button
                        isIconOnly
                        variant='light'
                        size='sm'
                        onPress={() => {
                            if (typeof result === 'string' && result !== '') {
                                writeText(result);
                            }
                        }}
                    >
                        <MdContentCopy className='text-[16px]' />
                    </Button>
                    <Button
                        isIconOnly
                        variant='light'
                        size='sm'
                        onPress={() => {
                            setError('');
                            if (typeof result === 'string' && result !== '') {
                                let newTargetLanguage = sourceLanguage;
                                if (sourceLanguage === 'auto') {
                                    newTargetLanguage = detectLanguage;
                                }
                                let newSourceLanguage = targetLanguage;
                                if (sourceLanguage === 'auto') {
                                    newSourceLanguage = 'auto';
                                }
                                if (newSourceLanguage in LanguageEnum && newTargetLanguage in LanguageEnum) {
                                    setIsLoading(true);
                                    buildinServices[name]
                                        .translate(
                                            result,
                                            LanguageEnum[newSourceLanguage],
                                            LanguageEnum[newTargetLanguage]
                                        )
                                        .then(
                                            (v) => {
                                                setResult(v);
                                                setIsLoading(false);
                                            },
                                            (e) => {
                                                setError(e.toString());
                                                setIsLoading(false);
                                            }
                                        );
                                } else {
                                    setError('Language not supported');
                                }
                            }
                        }}
                    >
                        <TbTransformFilled className='text-[16px]' />
                    </Button>
                    {collectionServiceList &&
                        collectionServiceList.map((serviceName) => {
                            return (
                                <Button
                                    key={serviceName}
                                    isIconOnly
                                    variant='light'
                                    size='sm'
                                    onPress={async () => {
                                        if (serviceName.startsWith('[plugin]')) {
                                            const pluginConfig = (await store.get(serviceName)) ?? {};
                                            invoke('invoke_plugin', {
                                                name: serviceName,
                                                pluginType: 'collection',
                                                from: sourceText,
                                                to: result.toString(),
                                                needs: pluginConfig,
                                            }).then(
                                                (_) => {
                                                    toast.success(t('translate.add_collection_success'), {
                                                        style: toastStyle,
                                                    });
                                                },
                                                (e) => {
                                                    toast.error(e.toString(), { style: toastStyle });
                                                }
                                            );
                                        } else {
                                            buildinCollectionServices[serviceName]
                                                .collection(sourceText, result.toString())
                                                .then(
                                                    (_) => {
                                                        toast.success(t('translate.add_collection_success'), {
                                                            style: toastStyle,
                                                        });
                                                    },
                                                    (e) => {
                                                        toast.error(e.toString(), { style: toastStyle });
                                                    }
                                                );
                                        }
                                    }}
                                >
                                    <img
                                        src={
                                            serviceName.startsWith('[plugin]')
                                                ? pluginList['collection'][serviceName].icon
                                                : buildinCollectionServices[serviceName].info.icon
                                        }
                                        className='h-[16px] w-[16px]'
                                    />
                                </Button>
                            );
                        })}
                </ButtonGroup>
            </CardFooter>
        </Card>
    );
}
