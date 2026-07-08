import { Button, Card, CardBody, CardHeader, Tooltip } from '@nextui-org/react';
import { BaseDirectory, readTextFile } from '@tauri-apps/api/fs';
import React, { useEffect, useRef, useState } from 'react';
import { HiOutlineVolumeUp } from 'react-icons/hi';
import PulseLoader from 'react-spinners/PulseLoader';
import { semanticColors } from '@nextui-org/theme';
import toast, { Toaster } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';
import { useAtomValue } from 'jotai';
import { nanoid } from 'nanoid';

import { sourceLanguageAtom, targetLanguageAtom } from '../LanguageArea';
import { useConfig, useToastStyle, useVoice } from '../../../../hooks';
import { invoke_plugin } from '../../../../utils/invoke_plugin';
import * as builtinServices from '../../../../services/translate';
import * as builtinTtsServices from '../../../../services/tts';
import detect from '../../../../utils/lang_detect';
import { sourceTextAtom } from '../SourceArea';
import {
    ServiceSourceType,
    getServiceName,
    getServiceSouceType,
    whetherPluginService,
} from '../../../../utils/service_instance';

// 选中文本的最大长度，超过则认为不是单词/词组，不弹出弹窗
const MAX_SELECTION_LENGTH = 100;
const POPUP_WIDTH = 320;

export default function SelectionPopup(props) {
    const { translateServiceInstanceList, pluginList, serviceInstanceConfigMap } = props;

    const [appFontSize] = useConfig('app_font_size', 16);
    const [ttsServiceList] = useConfig('tts_service_list', ['lingva_tts']);
    const [translateSecondLanguage] = useConfig('translate_second_language', 'en');

    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [selectedText, setSelectedText] = useState('');
    const [detectedLanguage, setDetectedLanguage] = useState('');
    const [result, setResult] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [ttsPluginInfo, setTtsPluginInfo] = useState();

    const sourceText = useAtomValue(sourceTextAtom);
    const sourceLanguage = useAtomValue(sourceLanguageAtom);
    const targetLanguage = useAtomValue(targetLanguageAtom);

    const { t } = useTranslation();
    const toastStyle = useToastStyle();
    const speak = useVoice();
    const theme = useTheme();
    const popupRef = useRef(null);
    const selectionIdRef = useRef('');

    // 监听鼠标事件捕获选中的单词/词组
    useEffect(() => {
        const handleMouseUp = (event) => {
            if (popupRef.current && popupRef.current.contains(event.target)) {
                return;
            }
            // 等待浏览器更新选区后再读取
            setTimeout(() => {
                let text = '';
                if (event.target instanceof HTMLTextAreaElement) {
                    text = event.target.value.substring(event.target.selectionStart, event.target.selectionEnd);
                } else {
                    text = window.getSelection().toString();
                }
                text = text.trim();
                if (text === '' || text.length > MAX_SELECTION_LENGTH) {
                    setVisible(false);
                    return;
                }
                const x = Math.min(Math.max(event.clientX, 8), window.innerWidth - POPUP_WIDTH - 8);
                const y = Math.min(event.clientY + 12, window.innerHeight - 100);
                setPosition({ x, y });
                setSelectedText(text);
                setVisible(true);
            }, 0);
        };
        const handleMouseDown = (event) => {
            if (popupRef.current && popupRef.current.contains(event.target)) {
                return;
            }
            setVisible(false);
        };
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setVisible(false);
            }
        };
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // 原文变化时隐藏弹窗
    useEffect(() => {
        setVisible(false);
    }, [sourceText]);

    // refresh tts config
    useEffect(() => {
        if (ttsServiceList && getServiceSouceType(ttsServiceList[0]) === ServiceSourceType.PLUGIN) {
            readTextFile(`plugins/tts/${getServiceName(ttsServiceList[0])}/info.json`, {
                dir: BaseDirectory.AppConfig,
            }).then((infoStr) => {
                setTtsPluginInfo(JSON.parse(infoStr));
            });
        }
    }, [ttsServiceList]);

    // 在已启用的翻译服务实例中查找第一个支持该语言对的实例
    const findServiceInstance = (from, to) => {
        for (const instanceKey of translateServiceInstanceList ?? []) {
            const config = serviceInstanceConfigMap[instanceKey] ?? {};
            const enable = config['enable'] ?? true;
            if (!enable) {
                continue;
            }
            if (whetherPluginService(instanceKey)) {
                const pluginInfo = pluginList['translate'][getServiceName(instanceKey)];
                if (pluginInfo && from in pluginInfo.language && to in pluginInfo.language) {
                    return instanceKey;
                }
            } else {
                const LanguageEnum = builtinServices[getServiceName(instanceKey)].Language;
                if (from in LanguageEnum && to in LanguageEnum) {
                    return instanceKey;
                }
            }
        }
        return null;
    };

    // 翻译选中的单词/词组
    useEffect(() => {
        if (!visible || selectedText === '') {
            return;
        }
        const id = nanoid();
        selectionIdRef.current = id;
        setResult('');
        setError('');
        setDetectedLanguage('');
        setIsLoading(true);
        const translateSelection = async () => {
            const detected = await detect(selectedText);
            if (selectionIdRef.current !== id) return;
            setDetectedLanguage(detected);
            let newTargetLanguage = targetLanguage;
            if (detected === targetLanguage) {
                newTargetLanguage = sourceLanguage !== 'auto' ? sourceLanguage : translateSecondLanguage;
            }
            const instanceKey = findServiceInstance(detected, newTargetLanguage);
            if (instanceKey === null) {
                throw new Error('Language not supported');
            }
            const serviceName = getServiceName(instanceKey);
            const instanceConfig = serviceInstanceConfigMap[instanceKey] ?? {};
            let v;
            if (whetherPluginService(instanceKey)) {
                const pluginInfo = pluginList['translate'][serviceName];
                instanceConfig['enable'] = 'true';
                const [func, utils] = await invoke_plugin('translate', serviceName);
                v = await func(selectedText, pluginInfo.language[detected], pluginInfo.language[newTargetLanguage], {
                    config: instanceConfig,
                    detect: detected,
                    setResult: (r) => {
                        if (selectionIdRef.current === id) {
                            setResult(r);
                        }
                    },
                    utils,
                });
            } else {
                const LanguageEnum = builtinServices[serviceName].Language;
                v = await builtinServices[serviceName].translate(
                    selectedText,
                    LanguageEnum[detected],
                    LanguageEnum[newTargetLanguage],
                    {
                        config: instanceConfig,
                        detect: detected,
                        setResult: (r) => {
                            if (selectionIdRef.current === id) {
                                setResult(r);
                            }
                        },
                    }
                );
            }
            if (selectionIdRef.current !== id) return;
            setResult(typeof v === 'string' ? v.trim() : v);
            setIsLoading(false);
        };
        translateSelection().catch((e) => {
            if (selectionIdRef.current !== id) return;
            setError(e.toString());
            setIsLoading(false);
        });
    }, [visible, selectedText]);

    // 朗读选中的单词/词组
    const handleSpeak = async () => {
        const instanceKey = ttsServiceList[0];
        let lang = detectedLanguage;
        if (lang === '') {
            lang = await detect(selectedText);
            setDetectedLanguage(lang);
        }
        if (getServiceSouceType(instanceKey) === ServiceSourceType.PLUGIN) {
            if (!(lang in ttsPluginInfo.language)) {
                throw new Error('Language not supported');
            }
            const pluginConfig = serviceInstanceConfigMap[instanceKey];
            const [func, utils] = await invoke_plugin('tts', getServiceName(instanceKey));
            const data = await func(selectedText, ttsPluginInfo.language[lang], {
                config: pluginConfig,
                utils,
            });
            speak(data);
        } else {
            if (!(lang in builtinTtsServices[getServiceName(instanceKey)].Language)) {
                throw new Error('Language not supported');
            }
            const instanceConfig = serviceInstanceConfigMap[instanceKey];
            const data = await builtinTtsServices[getServiceName(instanceKey)].tts(
                selectedText,
                builtinTtsServices[getServiceName(instanceKey)].Language[lang],
                {
                    config: instanceConfig,
                }
            );
            speak(data);
        }
    };

    if (!visible) {
        return null;
    }

    return (
        <div
            ref={popupRef}
            className='fixed z-50'
            style={{ left: position.x, top: position.y, width: POPUP_WIDTH }}
        >
            <Toaster />
            <Card
                shadow='lg'
                className='rounded-[10px] border-1 border-default-200'
            >
                <CardHeader className='flex justify-between p-[8px] pb-0'>
                    <div className='flex items-center overflow-hidden'>
                        <span className={`text-[${appFontSize}px] font-bold truncate select-text mr-[8px]`}>
                            {selectedText}
                        </span>
                        {detectedLanguage !== '' && (
                            <span className={`text-[${appFontSize - 4}px] text-default-500 whitespace-nowrap`}>
                                {t(`languages.${detectedLanguage}`)}
                            </span>
                        )}
                    </div>
                    {/* speak button */}
                    <Tooltip content={t('translate.speak')}>
                        <Button
                            isIconOnly
                            variant='light'
                            size='sm'
                            onPress={() => {
                                handleSpeak().catch((e) => {
                                    toast.error(e.toString(), { style: toastStyle });
                                });
                            }}
                        >
                            <HiOutlineVolumeUp className='text-[16px]' />
                        </Button>
                    </Tooltip>
                </CardHeader>
                <CardBody className='p-[8px] max-h-[40vh] overflow-y-auto'>
                    <PulseLoader
                        loading={isLoading && result === '' && error === ''}
                        color={theme === 'dark' ? semanticColors.dark.default[500] : semanticColors.light.default[500]}
                        size={6}
                    />
                    {typeof result === 'string' ? (
                        result !== '' && (
                            <p className={`text-[${appFontSize}px] select-text whitespace-pre-wrap`}>{result}</p>
                        )
                    ) : (
                        <div>
                            {result['pronunciations'] &&
                                result['pronunciations'].map((pronunciation) => {
                                    return (
                                        <div key={nanoid()}>
                                            {pronunciation['region'] && (
                                                <span
                                                    className={`text-[${appFontSize - 2}px] mr-[12px] text-default-500`}
                                                >
                                                    {pronunciation['region']}
                                                </span>
                                            )}
                                            {pronunciation['symbol'] && (
                                                <span
                                                    className={`text-[${appFontSize - 2}px] mr-[12px] text-default-500`}
                                                >
                                                    {pronunciation['symbol']}
                                                </span>
                                            )}
                                            {pronunciation['voice'] && pronunciation['voice'] !== '' && (
                                                <HiOutlineVolumeUp
                                                    className={`text-[${appFontSize - 2}px] inline-block my-auto cursor-pointer`}
                                                    onClick={() => {
                                                        speak(pronunciation['voice']);
                                                    }}
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            {result['explanations'] &&
                                result['explanations'].map((explanations) => {
                                    return (
                                        <div key={nanoid()}>
                                            {explanations['explains'] &&
                                                explanations['explains'].map((explain, index) => {
                                                    return (
                                                        <span key={nanoid()}>
                                                            {index === 0 ? (
                                                                <>
                                                                    <span
                                                                        className={`text-[${appFontSize - 2}px] text-default-500 mr-[12px]`}
                                                                    >
                                                                        {explanations['trait']}
                                                                    </span>
                                                                    <span
                                                                        className={`font-bold text-[${appFontSize}px] select-text`}
                                                                    >
                                                                        {explain}
                                                                    </span>
                                                                    <br />
                                                                </>
                                                            ) : (
                                                                <span
                                                                    className={`text-[${appFontSize - 2}px] text-default-500 select-text mr-1`}
                                                                    key={nanoid()}
                                                                >
                                                                    {explain}
                                                                </span>
                                                            )}
                                                        </span>
                                                    );
                                                })}
                                        </div>
                                    );
                                })}
                            {result['associations'] &&
                                result['associations'].map((association) => {
                                    return (
                                        <div key={nanoid()}>
                                            <span className={`text-[${appFontSize - 2}px] text-default-500`}>
                                                {association}
                                            </span>
                                        </div>
                                    );
                                })}
                            {result['sentence'] &&
                                result['sentence'].map((sentence, index) => {
                                    return (
                                        <div key={nanoid()}>
                                            <span className={`text-[${appFontSize - 2}px] mr-[12px]`}>
                                                {index + 1}.
                                            </span>
                                            <>
                                                {sentence['source'] && (
                                                    <span
                                                        className={`text-[${appFontSize - 2}px] select-text`}
                                                        dangerouslySetInnerHTML={{
                                                            __html: sentence['source'],
                                                        }}
                                                    />
                                                )}
                                            </>
                                            <>
                                                {sentence['target'] && (
                                                    <div
                                                        className={`text-[${appFontSize - 2}px] select-text text-default-500`}
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
                    {error !== '' &&
                        error.split('\n').map((v) => {
                            return (
                                <p
                                    key={v}
                                    className={`text-[${appFontSize - 2}px] text-red-500`}
                                >
                                    {v}
                                </p>
                            );
                        })}
                </CardBody>
            </Card>
        </div>
    );
}
