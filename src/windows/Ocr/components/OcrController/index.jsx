import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import SyncRoundedIcon from '@mui/icons-material/SyncRounded';
import { Select, Button, MenuItem } from '@mui/material';
import { appWindow } from '@tauri-apps/api/window';
import { useTranslation } from 'react-i18next';
import { emit } from '@tauri-apps/api/event';
import 'flag-icons/css/flag-icons.min.css';
import { nanoid } from 'nanoid';
import React from 'react';
import * as ocrs from '../../../../interfaces_ocr';
import language from '../../../../global/language';
import { resultTextAtom } from '../TextArea';
import { get } from '../../../main';
import { useEffect } from 'react';

export const ocrInterfaceAtom = atom('tesseract');
export const ocrLanguageAtom = atom('en');
export const ocrStartFlagAtom = atom();

export default function OcrController() {
    const [ocrInterface, setOcrInterface] = useAtom(ocrInterfaceAtom);
    const [ocrLanguage, setOcrLanguage] = useAtom(ocrLanguageAtom);
    const setOcrStartFlag = useSetAtom(ocrStartFlagAtom);
    const resultText = useAtomValue(resultTextAtom);
    const { t } = useTranslation();

    useEffect(() => {
        setOcrLanguage(get('ocr_language') ?? 'en');
        setOcrInterface(get('ocr_interface') ?? 'tesseract');
    }, []);
    return (
        <>
            <Select
                value={ocrInterface}
                sx={{ width: 160 }}
                onChange={(e) => {
                    setOcrInterface(e.target.value);
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
            <Select
                value={ocrLanguage}
                sx={{ width: 160 }}
                onChange={(e) => {
                    setOcrLanguage(e.target.value);
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
            <Button
                variant='outlined'
                sx={{ width: 160, textTransform: 'none' }}
                startIcon={<SyncRoundedIcon />}
                onClick={() => {
                    setOcrStartFlag(nanoid());
                }}
            >
                {t('ocr.recognize')}
            </Button>
            <Button
                variant='contained'
                sx={{ width: 160, textTransform: 'none' }}
                startIcon={<TranslateRoundedIcon />}
                onClick={async () => {
                    await emit('translate_from_ocr', resultText);
                    await appWindow.close();
                }}
            >
                {t('ocr.translate')}
            </Button>
        </>
    );
}
