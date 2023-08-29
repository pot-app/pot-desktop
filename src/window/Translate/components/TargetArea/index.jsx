import { Card, CardBody, CardHeader, CardFooter, Spacer, Button, ButtonGroup, Skeleton } from '@nextui-org/react';
import { writeText } from '@tauri-apps/api/clipboard';
import React, { useEffect, useState } from 'react';
import { TbTransformFilled } from 'react-icons/tb';
import { HiOutlineVolumeUp } from 'react-icons/hi';
import { MdContentCopy } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { nanoid } from 'nanoid';

import * as buildinServices from '../../../../services/translate/index';
import { sourceLanguageAtom, targetLanguageAtom } from '../LanguageArea';
import { sourceTextAtom, detectLanguageAtom } from '../SourceArea';
import { store } from '../../../../utils/store';

export default function TargetArea(props) {
    const { name, index, ...drag } = props;
    const [result, setResult] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const sourceText = useAtomValue(sourceTextAtom);
    const sourceLanguage = useAtomValue(sourceLanguageAtom);
    const targetLanguage = useAtomValue(targetLanguageAtom);
    const detectLanguage = useAtomValue(detectLanguageAtom);
    const LanguageEnum = buildinServices[name].Language;
    const { t } = useTranslation();

    useEffect(() => {
        if (sourceText !== '' && sourceLanguage && targetLanguage) {
            setResult('');
            setError('');
            translate();
        }
    }, [sourceText, targetLanguage, sourceLanguage]);

    const translate = async () => {
        if (sourceLanguage in LanguageEnum && targetLanguage in LanguageEnum) {
            let newTargetLanguage = targetLanguage;
            if (sourceLanguage === 'auto' && targetLanguage === detectLanguage) {
                newTargetLanguage = await store.get('translate_second_language');
            }
            setIsLoading(true);
            buildinServices[name]
                .translate(sourceText, LanguageEnum[sourceLanguage], LanguageEnum[newTargetLanguage])
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
    };
    return (
        <Card className='rounded-[10px]'>
            <CardHeader
                className='rounded-t-[10px] bg-content2 h-[30px]'
                {...drag}
            >
                <img
                    src={buildinServices[name].info.icon}
                    className='h-[20px]'
                />
                <Spacer x={2} />
                {t(`services.translate.${name}.title`)}
            </CardHeader>
            <CardBody className='p-[12px] pb-0'>
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
                    result.split('\n').map((v) => {
                        if (v.trim() === '') {
                            return <br key={nanoid()} />;
                        } else {
                            return (
                                <p
                                    key={nanoid()}
                                    className='select-text'
                                >
                                    {v.replaceAll(' ', '\u00a0')}
                                </p>
                            );
                        }
                    })
                ) : (
                    <></>
                )}
                {error !== '' ? <p className='text-red-500'>{error}</p> : <></>}
            </CardBody>
            <CardFooter className='bg-content1 rounded-none rounded-b-[10px] flex px-[12px] p-[5px]'>
                <ButtonGroup>
                    <Button
                        isIconOnly
                        variant='light'
                        size='sm'
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
                </ButtonGroup>
            </CardFooter>
        </Card>
    );
}
