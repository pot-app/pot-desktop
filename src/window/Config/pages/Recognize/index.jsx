import { DropdownTrigger } from '@nextui-org/react';
import { DropdownMenu } from '@nextui-org/react';
import { DropdownItem } from '@nextui-org/react';
import { useTranslation } from 'react-i18next';
import { CardBody } from '@nextui-org/react';
import { Dropdown } from '@nextui-org/react';
import { Switch } from '@nextui-org/react';
import { Button } from '@nextui-org/react';
import { Card } from '@nextui-org/react';
import React from 'react';

import { languageList } from '../../../../utils/language';
import { useConfig } from '../../../../hooks';

export default function Recognize() {
    const [recognizeLanguage, setRecognizeLanguage] = useConfig('recognize_language', 'auto');
    const [deleteNewline, setDeleteNewline] = useConfig('recognize_delete_newline', false);
    const [autoCopy, setAutoCopy] = useConfig('recognize_auto_copy', false);
    const [hideWindow, setHideWindow] = useConfig('recognize_hide_window', false);
    const { t } = useTranslation();
    return (
        <Card className='mb-[10px]'>
            <CardBody>
                <div className='config-item'>
                    <h3 className='my-auto mx-0'>{t('config.recognize.language')}</h3>
                    <Dropdown>
                        <DropdownTrigger>
                            <Button variant='bordered'>{t(`languages.${recognizeLanguage}`)}</Button>
                        </DropdownTrigger>
                        <DropdownMenu
                            aria-label='recognize language'
                            className='max-h-[50vh] overflow-y-auto'
                            onAction={(key) => {
                                setRecognizeLanguage(key);
                            }}
                        >
                            <DropdownItem key='auto'>{t('languages.auto')}</DropdownItem>
                            {languageList.map((item) => {
                                return <DropdownItem key={item}>{t(`languages.${item}`)}</DropdownItem>;
                            })}
                        </DropdownMenu>
                    </Dropdown>
                </div>
                <div className='config-item'>
                    <h3 className='my-auto mx-0'>{t('config.recognize.delete_newline')}</h3>
                    <Switch
                        isSelected={deleteNewline}
                        onValueChange={(v) => {
                            setDeleteNewline(v);
                        }}
                    />
                </div>
                <div className='config-item'>
                    <h3 className='my-auto mx-0'>{t('config.recognize.auto_copy')}</h3>
                    <Switch
                        isSelected={autoCopy}
                        onValueChange={(v) => {
                            setAutoCopy(v);
                        }}
                    />
                </div>
                <div className='config-item'>
                    <h3 className='my-auto mx-0'>{t('config.recognize.hide_window')}</h3>
                    <Switch
                        isSelected={hideWindow}
                        onValueChange={(v) => {
                            setHideWindow(v);
                        }}
                    />
                </div>
            </CardBody>
        </Card>
    );
}
