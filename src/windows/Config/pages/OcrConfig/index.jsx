import { Select, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';
import 'flag-icons/css/flag-icons.min.css';
import { useAtom } from 'jotai';
import { nanoid } from 'nanoid';
import React from 'react';
import * as ocrs from '../../../../interfaces_ocr';
import ConfigList from '../../components/ConfigList';
import ConfigItem from '../../components/ConfigItem';
import language from '../../../../global/language';
import { set } from '../../../../global/config';
import { ocrInterfaceAtom, ocrLanguageAtom } from '../..';

export default function OcrConfig() {
    const [ocrInterface, setOcrInterface] = useAtom(ocrInterfaceAtom);
    const [ocrLanguage, setOcrLanguage] = useAtom(ocrLanguageAtom);
    const { t } = useTranslation();

    return (
        <ConfigList label={t('config.ocr.title')}>
            <ConfigItem label={t('config.ocr.interface')}>
                <Select
                    size='small'
                    sx={{ width: '300px' }}
                    value={ocrInterface}
                    onChange={async (e) => {
                        setOcrInterface(e.target.value);
                        await set('ocr_interface', e.target.value);
                    }}
                >
                    {Object.keys(ocrs).map((x) => {
                        return (
                            <MenuItem
                                value={x}
                                key={nanoid()}
                            >
                                {t(`config.ocr_interface.${ocrs[x]['info']['name']}`)}
                            </MenuItem>
                        );
                    })}
                </Select>
            </ConfigItem>
            <ConfigItem label={t('config.ocr.language')}>
                <Select
                    size='small'
                    sx={{ width: '300px' }}
                    value={ocrLanguage}
                    onChange={async (e) => {
                        setOcrLanguage(e.target.value);
                        await set('ocr_language', e.target.value);
                    }}
                >
                    <MenuItem value={'auto'}>
                        <span>
                            <img
                                style={{
                                    verticalAlign: 'middle',
                                    marginRight: '8px',
                                    height: '20px',
                                }}
                                src='/auto.png'
                                alt='auto detect'
                            />
                        </span>
                        <span>{t('language.auto')}</span>
                    </MenuItem>
                    {language.map((x) => {
                        return (
                            <MenuItem
                                value={x.value}
                                key={nanoid()}
                            >
                                <span className={`fi fi-${x.code}`} />
                                <span>{t(`language.${x.value}`)}</span>
                            </MenuItem>
                        );
                    })}
                </Select>
            </ConfigItem>
        </ConfigList>
    );
}
