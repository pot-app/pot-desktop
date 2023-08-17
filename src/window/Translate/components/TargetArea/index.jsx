import { Card, CardBody, CardHeader, CardFooter, Spacer, Button, ButtonGroup } from '@nextui-org/react';
import React, { useEffect, useState } from 'react';
import { HiOutlineVolumeUp } from 'react-icons/hi';
import { MdContentCopy } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';

import * as buildinServices from '../../../../services/translate/index';
import { sourceLanguageAtom, targetLanguageAtom } from '../LanguageArea';
import { sourceTextAtom } from '../SourceArea';

export default function TargetArea(props) {
    const { name, index, ...drag } = props;
    const [text, setText] = useState('');
    const sourceText = useAtomValue(sourceTextAtom);
    const sourceLanguage = useAtomValue(sourceLanguageAtom);
    const targetLanguage = useAtomValue(targetLanguageAtom);
    const { t } = useTranslation();

    useEffect(() => {
        // Translate
        if (sourceText !== '' && sourceLanguage && targetLanguage) {
            setText(sourceText);
        }
    }, [sourceText, targetLanguage, sourceLanguage]);
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
            <CardBody className='p-[12px] select-text'>{text}</CardBody>
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
                    >
                        <MdContentCopy className='text-[16px]' />
                    </Button>
                </ButtonGroup>
            </CardFooter>
        </Card>
    );
}
