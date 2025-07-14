import { Card, CardBody, CardFooter, Button, Skeleton, ButtonGroup, Tooltip } from '@nextui-org/react';
import { sendNotification } from '@tauri-apps/api/notification';
import { writeText } from '@tauri-apps/api/clipboard';
import { atom, useAtom, useAtomValue } from 'jotai';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { CgSpaceBetween } from 'react-icons/cg';
import { MdContentCopy } from 'react-icons/md';
import { MdSmartButton } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { nanoid } from 'nanoid';

import { getServiceName, getServiceSouceType, ServiceSourceType } from '../../../utils/service_instance';
import { currentServiceInstanceKeyAtom, languageAtom, recognizeFlagAtom } from '../ControlArea';
import { invoke_plugin } from '../../../utils/invoke_plugin';
import * as builtinServices from '../../../services/recognize';
import { useConfig } from '../../../hooks';
import { base64Atom } from '../ImageArea';
import { pluginListAtom } from '..';

export const textAtom = atom();
let recognizeId = 0;

// 流式结果处理Hook
const useStreamHandler = (setText, setLoading, deleteNewline, autoCopy, hideWindow, t) => {
    const throttleRef = useRef(null);
    const hasReceivedDataRef = useRef(false);

    const handler = useCallback((result) => {
        // 兼容性检查：如果结果以 '_' 结尾，认为是流式数据
        const isStreaming = typeof result === 'string' && result.endsWith('_');
        const content = isStreaming ? result.slice(0, -1) : (typeof result === 'string' ? result.trim() : result);

        if (isStreaming) {
            // 首次流式数据立即显示并隐藏loading
            if (!hasReceivedDataRef.current) {
                hasReceivedDataRef.current = true;
                setLoading(false);
                setText(content);
                return;
            }

            // 节流更新流式内容
            if (throttleRef.current) clearTimeout(throttleRef.current);
            throttleRef.current = setTimeout(() => setText(content), 50);
        } else {
            // 处理最终结果或非流式结果
            hasReceivedDataRef.current = true;
            if (throttleRef.current) {
                clearTimeout(throttleRef.current);
                throttleRef.current = null;
            }

            let finalText = content;
            if (deleteNewline && typeof finalText === 'string') {
                finalText = finalText.replace(/\-\s+/g, '').replace(/\s+/g, ' ');
            }

            setText(finalText);
            setLoading(false);

            // 自动复制处理
            if (autoCopy && finalText) {
                writeText(finalText).then(() => {
                    if (hideWindow) {
                        sendNotification({
                            title: t('common.write_clipboard'),
                            body: finalText,
                        });
                    }
                });
            }
        }
    }, [setText, setLoading, deleteNewline, autoCopy, hideWindow, t]);

    // 暴露内部状态引用以便重置
    handler.hasReceivedDataRef = hasReceivedDataRef;

    return handler;
};

export default function TextArea(props) {
    const { serviceInstanceConfigMap } = props;
    const [autoCopy] = useConfig('recognize_auto_copy', false);
    const [deleteNewline] = useConfig('recognize_delete_newline', false);
    const [hideWindow] = useConfig('recognize_hide_window', false);
    const recognizeFlag = useAtomValue(recognizeFlagAtom);
    const currentServiceInstanceKey = useAtomValue(currentServiceInstanceKeyAtom);
    const language = useAtomValue(languageAtom);
    const base64 = useAtomValue(base64Atom);
    const [loading, setLoading] = useState(false);
    const [text, setText] = useAtom(textAtom);
    const [error, setError] = useState('');
    const pluginList = useAtomValue(pluginListAtom);
    const { t } = useTranslation();

    // 创建流式处理器
    const streamHandler = useStreamHandler(setText, setLoading, deleteNewline, autoCopy, hideWindow, t);

    // 智能调用内置服务的包装函数
    const callBuiltinService = useCallback((serviceName, base64, language, config, streamHandler) => {
        const recognizeFunc = builtinServices[serviceName].recognize;
        const languageEnum = builtinServices[serviceName].Language[language];

        // 检查函数参数个数来判断是否支持options
        if (recognizeFunc.length >= 3) {
            // 支持options参数的新式服务
            return recognizeFunc(base64, languageEnum, {
                config,
                setResult: streamHandler,
            });
        } else {
            // 传统服务，只接受base64和language参数
            return recognizeFunc(base64, languageEnum);
        }
    }, []);

    useEffect(() => {
        setText('');
        setError('');
        if (
            base64 !== '' &&
            currentServiceInstanceKey &&
            autoCopy !== null &&
            deleteNewline !== null &&
            hideWindow !== null
        ) {
            setLoading(true);

            if (getServiceSouceType(currentServiceInstanceKey) === ServiceSourceType.PLUGIN) {
                if (language in pluginList[getServiceName(currentServiceInstanceKey)].language) {
                    let id = nanoid();
                    recognizeId = id;
                    const pluginConfig = serviceInstanceConfigMap[currentServiceInstanceKey] ?? {};

                    invoke_plugin('recognize', getServiceName(currentServiceInstanceKey)).then(([func, utils]) => {
                        func(base64, pluginList[getServiceName(currentServiceInstanceKey)].language[language], {
                            config: pluginConfig,
                            setResult: streamHandler,
                            utils,
                        }).then(
                            (v) => {
                                if (recognizeId !== id) return;
                                v = v.trim();
                                if (deleteNewline) {
                                    v = v.replace(/\-\s+/g, '').replace(/\s+/g, ' ');
                                }
                                setText(v);
                                setLoading(false);
                                if (autoCopy) {
                                    writeText(v).then(() => {
                                        if (hideWindow) {
                                            sendNotification({
                                                title: t('common.write_clipboard'),
                                                body: v,
                                            });
                                        }
                                    });
                                }
                            },
                            (e) => {
                                if (recognizeId !== id) return;
                                setError(e.toString());
                                setLoading(false);
                            }
                        );
                    });
                }
            } else {
                const instanceConfig = serviceInstanceConfigMap[currentServiceInstanceKey] ?? {};
                if (language in builtinServices[getServiceName(currentServiceInstanceKey)].Language) {
                    let id = nanoid();
                    recognizeId = id;
                    // 重置流式状态
                    streamHandler.hasReceivedDataRef.current = false;

                    callBuiltinService(
                        getServiceName(currentServiceInstanceKey),
                        base64,
                        language,
                        instanceConfig,
                        streamHandler
                    ).then(
                        (v) => {
                            if (recognizeId !== id) return;
                            // 如果流式处理器已经处理过数据，就不再处理
                            if (streamHandler.hasReceivedDataRef?.current) return;

                            v = v.trim();
                            if (deleteNewline) {
                                v = v.replace(/\-\s+/g, '').replace(/\s+/g, ' ');
                            }
                            setText(v);
                            setLoading(false);
                            if (autoCopy) {
                                writeText(v).then(() => {
                                    if (hideWindow) {
                                        sendNotification({
                                            title: t('common.write_clipboard'),
                                            body: v,
                                        });
                                    }
                                });
                            }
                        },
                        (e) => {
                            if (recognizeId !== id) return;
                            setError(e.toString());
                            setLoading(false);
                        }
                    );
                } else {
                    setError('Language not supported');
                    setLoading(false);
                }
            }
        }
    }, [base64, currentServiceInstanceKey, language, recognizeFlag, autoCopy, deleteNewline, hideWindow]);

    return (
        <Card
            shadow='none'
            className='bg-content1 h-full ml-[6px] mr-[12px]'
            radius='10'
        >
            <CardBody className='bg-content1 p-0 h-full'>
                {loading && !text ? (
                    <div className='space-y-3 m-[12px]'>
                        <Skeleton className='w-3/5 rounded-lg'>
                            <div className='h-3 w-3/5 rounded-lg bg-default-200'></div>
                        </Skeleton>
                        <Skeleton className='w-4/5 rounded-lg'>
                            <div className='h-3 w-4/5 rounded-lg bg-default-200'></div>
                        </Skeleton>
                        <Skeleton className='w-2/5 rounded-lg'>
                            <div className='h-3 w-2/5 rounded-lg bg-default-300'></div>
                        </Skeleton>
                    </div>
                ) : (
                    <>
                        {text && (
                            <textarea
                                value={text}
                                className='bg-content1 h-full m-[12px] mb-0 resize-none focus:outline-none'
                                onChange={(e) => {
                                    setText(e.target.value);
                                }}
                            />
                        )}
                        {error && (
                            <textarea
                                value={error}
                                readOnly
                                className='bg-content1 h-full m-[12px] mb-0 resize-none focus:outline-none text-red-500'
                            />
                        )}
                    </>
                )}
            </CardBody>
            <CardFooter className='bg-content1 flex justify-start px-[12px]'>
                <ButtonGroup>
                    <Tooltip content={t('recognize.copy_text')}>
                        <Button
                            isIconOnly
                            size='sm'
                            variant='light'
                            onPress={() => {
                                writeText(text);
                            }}
                        >
                            <MdContentCopy className='text-[16px]' />
                        </Button>
                    </Tooltip>
                    <Tooltip content={t('recognize.delete_newline')}>
                        <Button
                            isIconOnly
                            variant='light'
                            size='sm'
                            onPress={() => {
                                setText(text.replace(/\-\s+/g, '').replace(/\s+/g, ' '));
                            }}
                        >
                            <MdSmartButton className='text-[16px]' />
                        </Button>
                    </Tooltip>
                    <Tooltip content={t('recognize.delete_space')}>
                        <Button
                            isIconOnly
                            variant='light'
                            size='sm'
                            onPress={() => {
                                setText(text.replaceAll(' ', ''));
                            }}
                        >
                            <CgSpaceBetween className='text-[16px]' />
                        </Button>
                    </Tooltip>
                </ButtonGroup>
            </CardFooter>
        </Card>
    );
}
