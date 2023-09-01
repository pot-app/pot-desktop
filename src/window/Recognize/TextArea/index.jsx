import { Card, CardBody, CardFooter, Button, Skeleton } from '@nextui-org/react';
import { writeText } from '@tauri-apps/api/clipboard';
import { atom, useAtom, useAtomValue } from 'jotai';
import React, { useEffect, useState } from 'react';
import { MdContentCopy } from 'react-icons/md';
import { invoke } from '@tauri-apps/api';
import { nanoid } from 'nanoid';

import { serviceNameAtom, languageAtom, recognizeFlagAtom } from '../ControlArea';
import * as buildinServices from '../../../services/recognize';
import { useConfig } from '../../../hooks';
import { base64Atom } from '../ImageArea';

export const textAtom = atom();
let recognizeId = 0;

export default function TextArea() {
    const [autoCopy] = useConfig('recognize_auto_copy', false);
    const recognizeFlag = useAtomValue(recognizeFlagAtom);
    const serviceName = useAtomValue(serviceNameAtom);
    const language = useAtomValue(languageAtom);
    const base64 = useAtomValue(base64Atom);

    const [loading, setLoading] = useState(false);
    const [text, setText] = useAtom(textAtom);
    const [error, setError] = useState('');

    useEffect(() => {
        if (base64 !== '' && serviceName && autoCopy !== null) {
            setLoading(true);
            setText('');
            setError('');
            if (language in buildinServices[serviceName].Language) {
                let id = nanoid();
                recognizeId = id;
                buildinServices[serviceName].recognize(base64, buildinServices[serviceName].Language[language]).then(
                    (v) => {
                        if (recognizeId !== id) return;
                        setText(v);
                        setLoading(false);
                        if (autoCopy) {
                            writeText(v);
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
    }, [base64, serviceName, language, recognizeFlag, autoCopy]);

    return (
        <Card
            shadow='none'
            className='bg-content1 h-full ml-[6px] mr-[12px]'
            radius='10'
        >
            <CardBody className='bg-content1 p-0 h-full'>
                {loading ? (
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
                                onChange={(e) => {
                                    setText(e.target.value);
                                }}
                            />
                        )}
                    </>
                )}
            </CardBody>
            <CardFooter className='bg-content1 flex justify-start px-[12px]'>
                <Button
                    isIconOnly
                    size='sm'
                    variant='light'
                    onPress={async () => {
                        await invoke('copy_img', {
                            width: imgRef.current.naturalWidth,
                            height: imgRef.current.naturalHeight,
                        });
                    }}
                >
                    <MdContentCopy className='text-[16px]' />
                </Button>
            </CardFooter>
        </Card>
    );
}
