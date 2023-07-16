import { Card, Box, InputBase, Select, MenuItem, IconButton, Tooltip } from '@mui/material';
import LibraryAddCheckRoundedIcon from '@mui/icons-material/LibraryAddCheckRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import UnfoldMoreRoundedIcon from '@mui/icons-material/UnfoldMoreRounded';
import UnfoldLessRoundedIcon from '@mui/icons-material/UnfoldLessRounded';
import LibraryAddRoundedIcon from '@mui/icons-material/LibraryAddRounded';
import GraphicEqRoundedIcon from '@mui/icons-material/GraphicEqRounded';
import { writeText } from '@tauri-apps/api/clipboard';
import PulseLoader from 'react-spinners/PulseLoader';
import { appWindow } from '@tauri-apps/api/window';
import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { nanoid } from 'nanoid';
import { sourceLanguageAtom, targetLanguageAtom } from '../LanguageSelector';
import { ankiConnect } from '../../../../global/ankiConnect';
import { addToEudic } from '../../../../global/addToEudic';
import * as interfaces from '../../../../interfaces';
import { speak } from '../../../../global/speak';
import { sourceTextAtom } from '../SourceArea';
import { listenCopyAtom } from '../TopBar';
import { get } from '../../../main';
import './style.css';

export let translateID = [];
let copyTimeout = null;

export default function TargetArea(props) {
    const { i, q, ...drag } = props;
    const defaultInterfaceList = get('default_interface_list') ?? ['deepl', 'bing'];
    const sourceText = useAtomValue(sourceTextAtom);
    const sourceLanguage = useAtomValue(sourceLanguageAtom);
    const targetLanguage = useAtomValue(targetLanguageAtom);
    const listenCopy = useAtomValue(listenCopyAtom);
    const [translateInterface, setTranslateInterface] = useState(i);
    const [loading, setLoading] = useState(false);
    const [targetText, setTargetText] = useState('');
    const [targetTextSetNum, setTargetTextSetNum] = useState(0);
    const [errMessage, setErrMessage] = useState('');
    const [addedAnki, setAddedAnki] = useState(false);
    const [addedEudic, setAddedEudic] = useState(false);
    const [expand, setExpand] = useState(false);

    const { t } = useTranslation();
    const theme = useTheme();

    useEffect(() => {
        if (sourceText !== '') {
            translate(sourceText.trim(), sourceLanguage, targetLanguage);
        }
    }, [sourceText, translateInterface, targetLanguage, sourceLanguage]);

    useEffect(() => {
        let autoCopy = get('auto_copy') ?? 4;
        if (!listenCopy && autoCopy === 1) {
            if (sourceText !== '') {
                if (copyTimeout) {
                    clearTimeout(copyTimeout);
                }
                copyTimeout = setTimeout(() => {
                    copy(sourceText);
                    if (get('hide_window') ?? false) {
                        void appWindow.close();
                    }
                }, 5);
            }
        }
    }, [sourceText]);

    useEffect(() => {
        if (targetText !== '') {
            if (targetTextSetNum === 0) {
                setExpand(true);
                setTargetTextSetNum(targetTextSetNum + 1);
            }
        } else {
            setTargetTextSetNum(0);
        }
        if (q === 0) {
            if (!targetText.endsWith('_') && targetLanguage !== '') {
                let autoCopy = get('auto_copy') ?? 4;
                if (!listenCopy) {
                    if (autoCopy === 2) {
                        if (targetText !== '') {
                            copy(targetText);
                            if (get('hide_window') ?? false) {
                                void appWindow.close();
                            }
                        }
                    } else if (autoCopy === 3) {
                        if (targetText && sourceText !== '') {
                            copy(sourceText + '\n\n' + targetText);
                            if (get('hide_window') ?? false) {
                                void appWindow.close();
                            }
                        }
                    } else if (autoCopy === 4) {
                        if (get('hide_window') ?? false) {
                            void appWindow.close();
                        }
                    }
                }
            }
        }
    }, [targetText]);

    // 开始翻译的回调
    function translate(text, from, to) {
        setTargetText('');
        setErrMessage('');
        setAddedAnki(false);
        setAddedEudic(false);
        setExpand(false);
        setLoading(true);
        let translator = interfaces[translateInterface];
        let id = nanoid();
        translateID[q] = id;
        translator.translate(text, from, to, setTargetText, id).then(
            (_) => {
                setLoading(false);
            },
            (e) => {
                setErrMessage(e);
                setLoading(false);
                setExpand(true);
            }
        );
    }

    // 复制文本的回调
    function copy(who) {
        writeText(who).then((_) => {
            toast.success(t('info.writeclipboard'), {
                duration: 500,
                style: {
                    background: theme.palette.background.default,
                    color: theme.palette.text.primary,
                },
            });
            return true;
        });
    }

    function addToAnki() {
        ankiConnect('createDeck', 6, { deck: 'Pot' }).then(
            (_) => {
                ankiConnect('createModel', 6, {
                    modelName: 'Pot Card',
                    inOrderFields: ['Front', 'Back'],
                    isCloze: false,
                    cardTemplates: [
                        {
                            Name: 'Pot Card',
                            Front: '{{Front}}',
                            Back: '{{Back}}',
                        },
                    ],
                }).then((x) => {
                    ankiConnect('addNote', 6, {
                        note: {
                            deckName: 'Pot',
                            modelName: 'Pot Card',
                            fields: {
                                Front: sourceText,
                                Back: targetText,
                            },
                        },
                    }).then((v) => {
                        setAddedAnki(true);
                    });
                });
            },
            (_) => {
                toast.error(t('translator.targetarea.ankierror'), {
                    style: {
                        background: theme.palette.background.default,
                        color: theme.palette.text.primary,
                    },
                });
            }
        );
    }

    return (
        <Card
            style={{
                height: defaultInterfaceList.length === 1 && '100%',
                marginTop: q && '8px',
            }}
        >
            <Toaster />
            <Box
                {...drag}
                className='interface-selector-area'
                sx={{ backgroundColor: theme.palette.background.bar }}
            >
                <Box>
                    <Select
                        size='small'
                        sx={{
                            height: '35px',
                            '.MuiOutlinedInput-notchedOutline': { border: 0 },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: 0 },
                        }}
                        value={translateInterface}
                        onChange={(e) => {
                            setTranslateInterface(e.target.value);
                        }}
                    >
                        {Object.keys(interfaces).map((x) => {
                            return (
                                <MenuItem
                                    value={x}
                                    key={nanoid()}
                                >
                                    <Box>
                                        <img
                                            src={`/${x}.svg`}
                                            className='interface-icon'
                                            alt='interface icon'
                                        />
                                        <span className='interface-name'>
                                            {t(`config.interface.${interfaces[x]['info']['name']}`)}
                                        </span>
                                    </Box>
                                </MenuItem>
                            );
                        })}
                    </Select>
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
                <IconButton
                    sx={{ '&:hover': { backgroundColor: 'inherit' } }}
                    onClick={() => {
                        setExpand(!expand);
                    }}
                >
                    {expand ? <UnfoldLessRoundedIcon /> : <UnfoldMoreRoundedIcon />}
                </IconButton>
            </Box>
            <Box className='overflow-textarea'>
                <InputBase
                    multiline
                    fullWidth
                    readOnly
                    value={targetText}
                    sx={{
                        display: (!expand || targetText === '') && 'none',
                        fontSize: get('font_size') ?? '1rem',
                    }}
                />
                <InputBase
                    multiline
                    fullWidth
                    readOnly
                    value={errMessage}
                    sx={{
                        color: 'red',
                        display: (!expand || errMessage === '') && 'none',
                        fontSize: get('font_size') ?? '1rem',
                    }}
                />
            </Box>
            <Box
                className='target-buttonarea'
                sx={{ display: !expand && 'none' }}
            >
                <IconButton
                    className='target-button'
                    onClick={async () => {
                        await speak(targetText);
                    }}
                >
                    <Tooltip title={t('translator.speak')}>
                        <GraphicEqRoundedIcon />
                    </Tooltip>
                </IconButton>
                <IconButton
                    className='target-button'
                    onClick={() => {
                        if (targetText !== '') {
                            copy(targetText);
                        } else {
                            if (errMessage !== '') {
                                copy(errMessage);
                            }
                        }
                    }}
                >
                    <Tooltip title={t('translator.copy')}>
                        <ContentCopyRoundedIcon />
                    </Tooltip>
                </IconButton>
                {get('anki_enable') ?? false ? (
                    addedAnki ? (
                        <IconButton className='target-button'>
                            <Tooltip title={t('translator.targetarea.addedtoanki')}>
                                <LibraryAddCheckRoundedIcon color='primary' />
                            </Tooltip>
                        </IconButton>
                    ) : (
                        <IconButton
                            className='target-button'
                            onClick={addToAnki}
                        >
                            <Tooltip title={t('translator.targetarea.addtoanki')}>
                                <LibraryAddRoundedIcon />
                            </Tooltip>
                        </IconButton>
                    )
                ) : (
                    <></>
                )}
                {get('eudic_enable') ?? false ? (
                    addedEudic ? (
                        <IconButton className='target-button'>
                            <Tooltip title={t('translator.targetarea.addedtoeudic')}>
                                <LibraryAddCheckRoundedIcon color='primary' />
                            </Tooltip>
                        </IconButton>
                    ) : (
                        <IconButton
                            className='target-button'
                            onClick={() => {
                                addToEudic(sourceText).then(
                                    (v) => {
                                        toast.success(v, {
                                            style: {
                                                background: theme.palette.background.default,
                                                color: theme.palette.text.primary,
                                            },
                                        });
                                        setAddedEudic(true);
                                    },
                                    (e) => {
                                        toast.error(String(e), {
                                            style: {
                                                background: theme.palette.background.default,
                                                color: theme.palette.text.primary,
                                            },
                                        });
                                    }
                                );
                            }}
                        >
                            <Tooltip title={t('translator.targetarea.addtoeudic')}>
                                <LibraryAddRoundedIcon />
                            </Tooltip>
                        </IconButton>
                    )
                ) : (
                    <></>
                )}
            </Box>
        </Card>
    );
}
