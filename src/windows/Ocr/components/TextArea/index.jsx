import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import SmartButtonRoundedIcon from '@mui/icons-material/SmartButtonRounded';
import { Box, IconButton, InputBase, Tooltip } from '@mui/material';
import { writeText } from '@tauri-apps/api/clipboard';
import PulseLoader from 'react-spinners/PulseLoader';
import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { atom, useAtom, useAtomValue } from 'jotai';
import { nanoid } from 'nanoid';
import { ocrInterfaceAtom, ocrLanguageAtom, ocrStartFlagAtom } from '../OcrController';
import * as ocrs from '../../../../interfaces_ocr';
import { base64Atom } from '../ImageArea';
import { get } from '../../../main';
import './style.css';

export const resultTextAtom = atom('');
export let ocrID = 0;

export default function TextArea() {
    const [loading, setLoading] = useState(false);
    const [resultText, setResultText] = useAtom(resultTextAtom);
    const [errorText, setErrorText] = useState('');
    const base64 = useAtomValue(base64Atom);
    const ocrLanguage = useAtomValue(ocrLanguageAtom);
    const ocrInterface = useAtomValue(ocrInterfaceAtom);
    const ocrStartFlag = useAtomValue(ocrStartFlagAtom);
    const { t } = useTranslation();
    const theme = useTheme();

    // 复制内容
    function copy(who) {
        writeText(who).then((_) => {
            toast.success(t('info.writeclipboard'), {
                duration: 500,
                style: {
                    background: theme.palette.background.default,
                    color: theme.palette.text.primary,
                },
            });
        });
    }

    useEffect(() => {
        let ocrCopy = get('ocr_copy') ?? false;
        if (ocrCopy && resultText !== '' && loading === false) {
            copy(resultText);
        }
    }, [resultText, loading]);

    useEffect(() => {
        if (base64 !== '') {
            setLoading(true);
            setResultText('');
            setErrorText('');
            let ocror = ocrs[ocrInterface];
            let id = nanoid();
            ocrID = id;
            ocror.ocr(base64, ocrLanguage, setResultText, id).then(
                (_) => {
                    setLoading(false);
                },
                (e) => {
                    setErrorText(e.toString());
                    setLoading(false);
                }
            );
        }
    }, [base64, ocrInterface, ocrLanguage, ocrStartFlag]);

    return (
        <>
            <Box className='text-content'>
                <Toaster />
                <InputBase
                    multiline
                    fullWidth
                    sx={{ display: resultText === '' && 'none' }}
                    value={resultText}
                    onChange={(e) => {
                        setResultText(e.target.value);
                    }}
                />
                <InputBase
                    multiline
                    fullWidth
                    sx={{ display: errorText === '' && 'none', color: 'red' }}
                    value={errorText}
                />
            </Box>
            <Box className='text-control'>
                <IconButton
                    className='control-button'
                    onClick={() => {
                        copy(resultText);
                    }}
                >
                    <Tooltip title={t('translator.copy')}>
                        <ContentCopyRoundedIcon />
                    </Tooltip>
                </IconButton>
                <IconButton
                    className='control-button'
                    onClick={() => {
                        setResultText(resultText.replace(/\s+/g, ' '));
                    }}
                >
                    <Tooltip title={t('translator.sourcearea.deletenewline')}>
                        <SmartButtonRoundedIcon />
                    </Tooltip>
                </IconButton>
                <PulseLoader
                    loading={loading}
                    color={theme.palette.text.primary}
                    size={10}
                    cssOverride={{
                        display: 'inline-block',
                        margin: 'auto',
                        marginLeft: '20px',
                    }}
                />
            </Box>
        </>
    );
}
