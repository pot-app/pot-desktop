import { Card, Box, InputBase, Select, MenuItem, IconButton, Tooltip } from '@mui/material';
import LibraryAddCheckRoundedIcon from '@mui/icons-material/LibraryAddCheckRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import LibraryAddRoundedIcon from '@mui/icons-material/LibraryAddRounded';
import GraphicEqRoundedIcon from '@mui/icons-material/GraphicEqRounded';
import { writeText } from '@tauri-apps/api/clipboard';
import PulseLoader from 'react-spinners/PulseLoader';
import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useTheme } from '@mui/material/styles';
import { useAtomValue } from 'jotai';
import { nanoid } from 'nanoid';
import { sourceLanguageAtom, targetLanguageAtom } from '../LanguageSelector';
import { ankiConnect } from '../../../../global/ankiConnect';
import { addToEudic } from '../../../../global/addToEudic';
import * as interfaces from '../../../../interfaces';
import { speak } from '../../../../global/speak';
import { sourceTextAtom } from '../SourceArea';
import { get } from '../../../main';
import './style.css';

export let translateID = [];

export default function TargetArea(props) {
    const { i, q } = props;
    const defaultInterfaceList = get('default_interface_list') ?? ['deepl', 'bing'];
    const sourceText = useAtomValue(sourceTextAtom);
    const sourceLanguage = useAtomValue(sourceLanguageAtom);
    const targetLanguage = useAtomValue(targetLanguageAtom);

    const [translateInterface, setTranslateInterface] = useState(i);
    const [loading, setLoading] = useState(false);
    const [targetText, setTargetText] = useState('');
    const [addedAnki, setAddedAnki] = useState(false);
    const [addedEudic, setAddedEudic] = useState(false);
    const theme = useTheme();

    useEffect(() => {
        if (sourceText != '') {
            translate(sourceText.trim(), sourceLanguage, targetLanguage);
        }
    }, [sourceText, translateInterface, targetLanguage, sourceLanguage]);

    useEffect(() => {
        if (!targetText.endsWith('_')) {
            let autoCopy = get('auto_copy') ?? 4;
            if (autoCopy == 4) {
                return;
            } else if (autoCopy == 1) {
                if (sourceText != '') {
                    copy(sourceText);
                }
            } else if (autoCopy == 2) {
                if (targetText != '') {
                    copy(targetText);
                }
            } else {
                if (targetText && sourceText != '') {
                    copy(sourceText + '\n\n' + targetText);
                }
            }
        }
    }, [targetText]);

    // 开始翻译的回调
    function translate(text, from, to) {
        setTargetText('');
        setAddedAnki(false);
        setLoading(true);
        let translator = interfaces[translateInterface];
        let id = nanoid();
        translateID[q] = id;
        translator.translate(text, from, to, setTargetText, id).then(
            (_) => {
                setLoading(false);
            },
            (e) => {
                setTargetText(e.toString());
                setLoading(false);
            }
        );
    }

    // 复制文本的回调
    function copy(who) {
        writeText(who).then((_) => {
            toast.success('已写入剪切板', {
                style: {
                    background: theme.palette.background.default,
                    color: theme.palette.text.primary,
                },
            });
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
                toast.error('Anki没有启动或配置错误', {
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
                height: defaultInterfaceList.length == 1 && '100%',
                marginTop: q && '8px',
                padding: '8px 0',
            }}
        >
            <Toaster />
            <Box className='interface-selector-area'>
                <Select
                    size='small'
                    sx={{ boxShadow: 'none', '.MuiOutlinedInput-notchedOutline': { border: 0 } }}
                    className='interface-selector'
                    value={translateInterface}
                    onChange={(e) => {
                        setTranslateInterface(e.target.value);
                    }}
                >
                    {Object.keys(interfaces).map((x) => {
                        if (get(`${x}_enable`) ?? true) {
                            return (
                                <MenuItem
                                    value={x}
                                    key={nanoid()}
                                >
                                    <Box>
                                        <img
                                            src={`/${x}.svg`}
                                            className='interface-icon'
                                        />
                                        <span className='interface-name'>{interfaces[x]['info']['name']}</span>
                                    </Box>
                                </MenuItem>
                            );
                        }
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
            {targetText != '' && (
                <>
                    <Box className='overflow-textarea'>
                        <InputBase
                            multiline
                            fullWidth
                            value={targetText}
                            onChange={(e) => {
                                setTargetText(e.target.value);
                            }}
                        />
                    </Box>
                    <Box className='target-buttonarea'>
                        <IconButton
                            className='target-button'
                            onClick={async () => {
                                await speak(targetText);
                            }}
                        >
                            <Tooltip title='朗读'>
                                <GraphicEqRoundedIcon />
                            </Tooltip>
                        </IconButton>
                        <IconButton
                            className='target-button'
                            onClick={() => {
                                copy(targetText);
                            }}
                        >
                            <Tooltip title='复制'>
                                <ContentCopyRoundedIcon />
                            </Tooltip>
                        </IconButton>
                        {get('anki_enable') ?? true ? (
                            addedAnki ? (
                                <IconButton className='target-button'>
                                    <Tooltip title='已添加到Anki'>
                                        <LibraryAddCheckRoundedIcon color='primary' />
                                    </Tooltip>
                                </IconButton>
                            ) : (
                                <IconButton
                                    className='target-button'
                                    onClick={addToAnki}
                                >
                                    <Tooltip title='添加到Anki'>
                                        <LibraryAddRoundedIcon />
                                    </Tooltip>
                                </IconButton>
                            )
                        ) : (
                            <></>
                        )}
                        {get('eudic_enable') ?? true ? (
                            addedEudic ? (
                                <IconButton className='target-button'>
                                    <Tooltip title='已添加到欧路词典'>
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
                                    <Tooltip title='添加到欧路词典'>
                                        <LibraryAddRoundedIcon />
                                    </Tooltip>
                                </IconButton>
                            )
                        ) : (
                            <></>
                        )}
                    </Box>
                </>
            )}
        </Card>
    );
}
