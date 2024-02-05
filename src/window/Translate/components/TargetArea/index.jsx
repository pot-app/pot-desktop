import {
    Card,
    CardBody,
    CardHeader,
    CardFooter,
    Button,
    ButtonGroup,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Tooltip,
} from '@nextui-org/react';
import { BiCollapseVertical, BiExpandVertical } from 'react-icons/bi';
import { BaseDirectory, readTextFile } from '@tauri-apps/api/fs';
import { sendNotification } from '@tauri-apps/api/notification';
import React, { useEffect, useState, useRef } from 'react';
import { writeText } from '@tauri-apps/api/clipboard';
import PulseLoader from 'react-spinners/PulseLoader';
import { TbTransformFilled } from 'react-icons/tb';
import { HiOutlineVolumeUp } from 'react-icons/hi';
import { semanticColors } from '@nextui-org/theme';
import toast, { Toaster } from 'react-hot-toast';
import { MdContentCopy } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { emit } from '@tauri-apps/api/event';
import Database from 'tauri-plugin-sql-api';
import { invoke } from '@tauri-apps/api';
import { GiCycle } from 'react-icons/gi';
import { useTheme } from 'next-themes';
import { useAtomValue } from 'jotai';
import { nanoid } from 'nanoid';
import { useSpring, animated } from '@react-spring/web';
import useMeasure from 'react-use-measure';

import * as builtinCollectionServices from '../../../../services/collection';
import { sourceLanguageAtom, targetLanguageAtom } from '../LanguageArea';
import { useConfig, useToastStyle, useVoice } from '../../../../hooks';
import { sourceTextAtom, detectLanguageAtom } from '../SourceArea';
import * as builtinServices from '../../../../services/translate';
import * as builtinTtsServices from '../../../../services/tts';

import { store } from '../../../../utils/store';

let translateID = [];

export default function TargetArea(props) {
    const [appFontSize] = useConfig('app_font_size', 16);
    const [collectionServiceList] = useConfig('collection_service_list', []);
    const [ttsServiceList] = useConfig('tts_service_list', ['lingva_tts']);
    const [translateSecondLanguage] = useConfig('translate_second_language', 'en');
    const [autoCopy] = useConfig('translate_auto_copy', 'disable');
    const [clipboardMonitor] = useConfig('clipboard_monitor', false);
    const [hideWindow] = useConfig('translate_hide_window', false);
    const { name, index, translateServiceList, pluginList, ...drag } = props;
    const [translateServiceName, setTranslateServiceName] = useState(name);
    const [result, setResult] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hide, setHide] = useState(true);
    const sourceText = useAtomValue(sourceTextAtom);
    const sourceLanguage = useAtomValue(sourceLanguageAtom);
    const targetLanguage = useAtomValue(targetLanguageAtom);
    const detectLanguage = useAtomValue(detectLanguageAtom);
    const [ttsPluginInfo, setTtsPluginInfo] = useState();
    const { t } = useTranslation();
    const textAreaRef = useRef();
    const toastStyle = useToastStyle();
    const speak = useVoice();
    const theme = useTheme();

    useEffect(() => {
        setResult('');
        setError('');
        if (
            sourceText.trim() !== '' &&
            sourceLanguage &&
            targetLanguage &&
            autoCopy !== null &&
            hideWindow !== null &&
            clipboardMonitor !== null
        ) {
            if (autoCopy === 'source' && !clipboardMonitor) {
                writeText(sourceText).then(() => {
                    if (hideWindow) {
                        sendNotification({ title: t('common.write_clipboard'), body: sourceText });
                    }
                });
            }
            translate();
        }
    }, [sourceText, targetLanguage, sourceLanguage, autoCopy, hideWindow, translateServiceName, clipboardMonitor]);

    async function getDB(){
        return await Database.load('sqlite:history.db');
    }
    
    const addToHistory = async (text, source, target, service, result) => {
        const db = await getDB();
        await db.execute(
            'INSERT into history (text, source, target, service, result, timestamp) VALUES ($1, $2, $3, $4, $5, $6)',
            [text, source, target, service, result, Date.now()]
        ).then(
            () => {
                db.close();
            },
            () => {
                db.execute('CREATE TABLE history(id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT NOT NULL,source TEXT NOT NULL,target TEXT NOT NULL,service TEXT NOT NULL, result TEXT NOT NULL,timestamp INTEGER NOT NULL)').then(() => {
                    db.close();
                    addToHistory(text, source, target, service, result);
                });
            }
        );
    };
    
    const getHistory = async (text, source, target, service) => {
        const db = await getDB();
        try {
            let res = await db.select(
                `select result from history where text = $1 and source = $2 and target = $3 and service = $4`,
                [text, source, target, service]
            )
            if (res.length) {
               res = res[0]['result']
               try {
                   const json = JSON.parse(res)
                   return typeof json === 'string' ? res : json
               } catch {
                   return res
               }
            }
        } catch {}
        db.close().catch(() => {})
        return undefined
    }

    function invokeOnce(fn) {
        let isInvoke = false;
        return (...args) => {
            if (!isInvoke) {
                fn(...args);
                isInvoke = true;
            }
        };
    }

    const translate = async () => {
        let id = nanoid();
        translateID[index] = id;
        let newTargetLanguage
        const setHideOnce = invokeOnce(setHide);
        const srcText = sourceText.trim()
        function handleTranslateResult(v, hideOne = true) {
            if (translateID[index] !== id) return;
            const result = typeof v === 'string' ? v.trim() : v;
            setResult(result);
            setIsLoading(false);
            if (result !== '') {
                hideOne ? setHideOnce(false) : setHide(false);
            }
            addToHistory(
                srcText,
                detectLanguage,
                newTargetLanguage,
                translateServiceName,
                result
            );
            if (index === 0 && !clipboardMonitor && typeof result === 'string') {
                let text = result;
                if (autoCopy === 'source_target') {
                    text = srcText + '\n\n' + text;
                } else if (autoCopy !== 'target') {
                    return;
                }
                writeText(text).then(() => {
                    if (hideWindow) {
                        sendNotification({ title: t('common.write_clipboard'), body: text });
                    }
                });
            }
        }
        function handleTranslateError(e){
            if (translateID[index] !== id) return;
            setError(e.toString());
            setIsLoading(false);
        }
        setIsLoading(true);
        setHide(true);
        
        if (translateServiceName.startsWith('[plugin]')) {
            const pluginInfo = pluginList['translate'][translateServiceName];
            if (sourceLanguage in pluginInfo.language && targetLanguage in pluginInfo.language) {
                newTargetLanguage = targetLanguage;
                if (sourceLanguage === 'auto' && targetLanguage === detectLanguage) {
                    newTargetLanguage = translateSecondLanguage;
                }
                const pluginConfig = (await store.get(translateServiceName)) ?? {};
                pluginConfig['enable'] = 'true';
                const temp = await getHistory(srcText,detectLanguage, newTargetLanguage, translateServiceName)
                if (temp) {
                    handleTranslateResult(temp, false)
                    return
                }
                
                invoke('invoke_plugin', {
                    name: translateServiceName,
                    pluginType: 'translate',
                    source: srcText,
                    from: pluginInfo.language[sourceLanguage],
                    to: pluginInfo.language[newTargetLanguage],
                    lang: detectLanguage,
                    needs: pluginConfig,
                }).then(
                    (v) => handleTranslateResult(v, false),
                    (e) => handleTranslateError(e)
                );
            } else {
                setError('Language not supported');
            }
        } else {
            const LanguageEnum = builtinServices[translateServiceName].Language;
            if (sourceLanguage in LanguageEnum && targetLanguage in LanguageEnum) {
                newTargetLanguage = targetLanguage;
                if (sourceLanguage === 'auto' && targetLanguage === detectLanguage) {
                    newTargetLanguage = translateSecondLanguage;
                }
                const temp = await getHistory(srcText,detectLanguage, newTargetLanguage, translateServiceName)
                if (temp) {
                    handleTranslateResult(temp, true)
                    return
                }
                builtinServices[translateServiceName]
                    .translate(srcText, LanguageEnum[sourceLanguage], LanguageEnum[newTargetLanguage], {
                        detect: detectLanguage,
                        setResult: (v) => {
                            if (translateID[index] !== id) return;
                            setResult(v);
                            setHideOnce(false);
                        },
                    })
                    .then(
                        (v) => handleTranslateResult(v, true),
                        (e) => handleTranslateError(e)
                    );
            } else {
                setError('Language not supported');
            }
        }
    };

    const handleSpeak = async () => {
        const serviceName = ttsServiceList[0];
        if (serviceName.startsWith('[plugin]')) {
            const config = (await store.get(serviceName)) ?? {};
            if (!(targetLanguage in ttsPluginInfo.language)) {
                throw new Error('Language not supported');
            }
            let data = await invoke('invoke_plugin', {
                name: serviceName,
                pluginType: 'tts',
                source: result,
                lang: ttsPluginInfo.language[targetLanguage],
                needs: config,
            });
            speak(data);
        } else {
            if (!(targetLanguage in builtinTtsServices[serviceName].Language)) {
                throw new Error('Language not supported');
            }
            let data = await builtinTtsServices[serviceName].tts(
                result,
                builtinTtsServices[serviceName].Language[targetLanguage]
            );
            speak(data);
        }
    };
    useEffect(() => {
        if (textAreaRef.current !== null) {
            textAreaRef.current.style.height = '0px';
            if (result !== '') {
                textAreaRef.current.style.height = textAreaRef.current.scrollHeight + 'px';
            }
        }
        emit('trans:window:resize').catch(() => {});
    }, [result]);

    useEffect(() => {
        if (ttsServiceList && ttsServiceList[0].startsWith('[plugin]')) {
            readTextFile(`plugins/tts/${ttsServiceList[0]}/info.json`, {
                dir: BaseDirectory.AppConfig,
            }).then((infoStr) => {
                setTtsPluginInfo(JSON.parse(infoStr));
            });
        }
    }, [ttsServiceList]);

    useEffect(() => {
        emit('trans:window:resize').catch(() => {});
    }, [hide]);

    return (
        <Card shadow='none' className='rounded-[10px]'>
            <Toaster />
            <CardHeader className={ `flex justify-between py-1 px-0 bg-header h-[30px] ${
                    hide ? 'rounded-[10px]' : 'rounded-t-[10px]'
                }`} {...drag}>
                <div className='flex'>
                    <Dropdown>
                        <DropdownTrigger>
                            <Button size='sm' variant='solid' className='bg-transparent'
                                startContent={ translateServiceName.startsWith('[plugin]')
                                    ? <img src={pluginList['translate'][translateServiceName].icon} className='h-[20px] my-auto' />
                                    : <img src={builtinServices[translateServiceName].info.icon} className='h-[20px] my-auto' />
                                }
                            >
                                {
                                    translateServiceName.startsWith('[plugin]')
                                        ?
                                        <div className='my-auto'>
                                            {`${pluginList['translate'][translateServiceName].display} `}
                                        </div>
                                        :
                                        <div className='my-auto'>
                                            {t(`services.translate.${translateServiceName}.title`)}
                                        </div>
                                }
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label='app language' className='max-h-[40vh] overflow-y-auto'
                            onAction={(key) => setTranslateServiceName(key)}>
                            {translateServiceList.map((x) => (
                                <DropdownItem key={x}
                                    startContent={ x.startsWith('[plugin]')
                                        ? <img src={pluginList['translate'][x].icon} className='h-[20px] my-auto' />
                                        : <img src={builtinServices[x].info.icon} className='h-[20px] my-auto' />
                                    }
                                >
                                    {
                                        x.startsWith('[plugin]')
                                        ? <div className='my-auto'>{`${pluginList['translate'][x].display} `}</div>
                                        : <div className='my-auto'>{t(`services.translate.${x}.title`)}</div>
                                    }
                                </DropdownItem>
                            ))}
                        </DropdownMenu>
                    </Dropdown>
                    <PulseLoader
                        loading={isLoading}
                        color={theme === 'dark' ? semanticColors.dark.default[500] : semanticColors.light.default[500]}
                        size={8} cssOverride={{ display: 'inline-block', margin: 'auto', marginLeft: '20px' }}
                    />
                </div>
                {result || error ? (<div className='flex'>
                    <Button size='sm' isIconOnly variant='light' className='h-[20px] w-[20px] mr-[5px]'
                        onPress={() => setHide(!hide)}>
                        {hide ? (
                            <BiExpandVertical className='text-[16px]' />
                        ) : (
                            <BiCollapseVertical className='text-[16px]' />
                        )}
                    </Button>
                </div>) : <></>}
            </CardHeader>
            <CardBody className={`p-[12px] pb-0 ${hide && 'h-0 p-0'}`}>
                {typeof result === 'string' ? (
                    <textarea
                        ref={textAreaRef}
                        className={`text-[${appFontSize}px] h-0 resize-none bg-transparent select-text outline-none`}
                        readOnly
                        value={result}
                    />
                ) : (
                    <div>
                        {result['pronunciations'] &&
                            result['pronunciations'].map((pronunciation) => {
                                return (
                                    <div key={nanoid()}>
                                        {pronunciation['region'] && (
                                            <span className={`text-[${appFontSize}px] mr-[12px] text-default-500`}>
                                                {pronunciation['region']}
                                            </span>
                                        )}
                                        {pronunciation['symbol'] && (
                                            <span className={`text-[${appFontSize}px] mr-[12px] text-default-500`}>
                                                [{pronunciation['symbol']}]
                                            </span>
                                        )}
                                        {pronunciation['voice'] && pronunciation['voice'] !== '' && (
                                            <HiOutlineVolumeUp
                                                className={`text-[${appFontSize}px] inline-block my-auto cursor-pointer text-btn`}
                                                onClick={() => {
                                                    speak(pronunciation['voice']);
                                                }}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        {result['explanations'] && result['explanations'].map((explanations) => (
                            <div className="flex items-start mb-[5px] pr-[10px]" key={nanoid()}>
                                {
                                    explanations['trait'] ? (
                                        <>
                                            <div className={`text-[${ appFontSize - 4 }px] text-[#A7A6A6] mr-[5px] min-w-[40px] max-w-[60px]`}>
                                                {explanations['trait']}
                                            </div>
                                            <div className={`text-[${appFontSize - 2}px] select-text grow`}>
                                                {explanations['explains']?.map(x => x.trim()).join('；')}
                                            </div>
                                        </>
                                    ) : <div className={ `text-[${ appFontSize - 2 }px] select-text` } key={ nanoid() }>
                                        {explanations['explains']?.map(x => x.trim()).join('；')}
                                    </div>
                                }
                            </div>
                        
                        ))}
                        {result['associations'] && result['associations'].map((association) => (
                            <div className={`text-[${appFontSize - 4}px] text-[#A7A6A6]`} key={nanoid()}>
                                {association}
                            </div>
                        ))}
                        {result['sentence'] &&
                            result['sentence'].map((sentence, index) => {
                                return (
                                    <div key={nanoid()}>
                                        <span className={`text-[${appFontSize - 2}px] mr-[12px]`}>{index + 1}.</span>
                                        <>
                                            {sentence['source'] && (
                                                <span className={`text-[${appFontSize}px] select-text`}
                                                    dangerouslySetInnerHTML={{
                                                        __html: sentence['source'],
                                                    }}
                                                />
                                            )}
                                        </>
                                        <>
                                            {sentence['target'] && (
                                                <div className={`text-[${appFontSize}px] select-text text-default-500`}
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
                {error !== '' && error.split('\n').map((v) => (
                    <p key={v} className={`text-[${appFontSize}px] text-red-500`}>
                        {v}
                    </p>
                ))}
            </CardBody>
            <CardFooter className={`bg-content1 rounded-none rounded-b-[10px] flex px-[12px] p-[5px] ${hide && 'hidden'}`}>
                <ButtonGroup>
                    <Tooltip content={t('translate.speak')} delay={0} closeDelay={0}>
                        <Button isIconOnly variant='light' size='sm' className="text-btn"
                            isDisabled={typeof result !== 'string' || result === ''}
                            onPress={() => {
                                handleSpeak().catch((e) => {
                                    toast.error(e.toString(), { style: toastStyle });
                                });
                            }}
                        >
                            <HiOutlineVolumeUp className='text-[16px] text-btn' />
                        </Button>
                    </Tooltip>
                    <Tooltip content={t('translate.copy')} delay={0} closeDelay={0}>
                        <Button isIconOnly variant='light' size='sm' className="text-btn"
                            isDisabled={typeof result !== 'string' || result === ''}
                            onPress={() => {
                                writeText(result);
                            }}
                        >
                            <MdContentCopy className='text-[16px]' />
                        </Button>
                    </Tooltip>
                    <Tooltip content={t('translate.translate_back')} delay={0} closeDelay={0}>
                        <Button isIconOnly variant='light' size='sm' className="text-btn"
                            isDisabled={typeof result !== 'string' || result === ''}
                            onPress={async () => {
                                setError('');
                                let newTargetLanguage = sourceLanguage;
                                if (sourceLanguage === 'auto') {
                                    newTargetLanguage = detectLanguage;
                                }
                                let newSourceLanguage = targetLanguage;
                                if (sourceLanguage === 'auto') {
                                    newSourceLanguage = 'auto';
                                }
                                if (translateServiceName.startsWith('[plugin]')) {
                                    const pluginInfo = pluginList['translate'][translateServiceName];
                                    if (
                                        newSourceLanguage in pluginInfo.language &&
                                        newTargetLanguage in pluginInfo.language
                                    ) {
                                        setIsLoading(true);
                                        setHide(true);
                                        const pluginConfig = (await store.get(translateServiceName)) ?? {};
                                        pluginConfig['enable'] = 'true';
                                        invoke('invoke_plugin', {
                                            name: translateServiceName,
                                            pluginType: 'translate',
                                            source: result.trim(),
                                            from: pluginInfo.language[newSourceLanguage],
                                            to: pluginInfo.language[newTargetLanguage],
                                            lang: newSourceLanguage,
                                            needs: pluginConfig,
                                        }).then(
                                            (v) => {
                                                if (v === result) {
                                                    setResult(v + ' ');
                                                } else {
                                                    setResult(v.trim());
                                                }
                                                setIsLoading(false);
                                                if (v !== '') {
                                                    setHide(false);
                                                }
                                            },
                                            (e) => {
                                                setError(e.toString());
                                                setIsLoading(false);
                                            }
                                        );
                                    } else {
                                        setError('Language not supported');
                                    }
                                } else {
                                    const LanguageEnum = builtinServices[translateServiceName].Language;
                                    if (newSourceLanguage in LanguageEnum && newTargetLanguage in LanguageEnum) {
                                        setIsLoading(true);
                                        setHide(true);
                                        const setHideOnce = invokeOnce(setHide);
                                        builtinServices[translateServiceName]
                                            .translate(
                                                result.trim(),
                                                LanguageEnum[newSourceLanguage],
                                                LanguageEnum[newTargetLanguage],
                                                {
                                                    detect: newSourceLanguage,
                                                    setResult: (v) => {
                                                        setResult(v);
                                                        setHideOnce(false);
                                                    },
                                                }
                                            )
                                            .then(
                                                (v) => {
                                                    if (v === result) {
                                                        setResult(v + ' ');
                                                    } else {
                                                        setResult(v.trim());
                                                    }
                                                    setIsLoading(false);
                                                    if (v !== '') {
                                                        setHideOnce(false);
                                                    }
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
                    </Tooltip>
                    <Tooltip content={t('translate.retry')} delay={0} closeDelay={0}>
                        <Button isIconOnly variant='light' size='sm'
                            className={`${error === '' && 'hidden'} text-btn`}
                            onPress={() => {
                                setError('');
                                setResult('');
                                translate();
                            }}
                        >
                            <GiCycle className='text-[16px]' />
                        </Button>
                    </Tooltip>
                    {collectionServiceList && collectionServiceList.map((serviceName) => {
                        return (
                            <Button key={serviceName} isIconOnly variant='light' size='sm' className="text-btn"
                                onPress={async () => {
                                    if (serviceName.startsWith('[plugin]')) {
                                        const pluginConfig = (await store.get(serviceName)) ?? {};
                                        invoke('invoke_plugin', {
                                            name: serviceName,
                                            pluginType: 'collection',
                                            source: sourceText.trim(),
                                            target: result.toString(),
                                            from: detectLanguage,
                                            to: targetLanguage,
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
                                        builtinCollectionServices[serviceName].collection(sourceText, result).then(
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
                                <img src={
                                        serviceName.startsWith('[plugin]')
                                            ? pluginList['collection'][serviceName].icon
                                            : builtinCollectionServices[serviceName].info.icon
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
