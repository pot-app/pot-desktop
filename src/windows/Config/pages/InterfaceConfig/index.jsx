import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import { TextField, Select, MenuItem, IconButton, InputAdornment } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';
import { nanoid } from 'nanoid';
import React, { useState } from 'react';
import { interfaceConfigsAtom, openaiServiceAtom, ocrInterfaceConfigsAtom } from '../..';
import ConfigList from '../../components/ConfigList';
import ConfigItem from '../../components/ConfigItem';
import { set } from '../../../../global/config';

export default function InterfaceConfig() {
    const [interfaceConfigs, setInterfaceConfigs] = useAtom(interfaceConfigsAtom);
    const [ocrInterfaceConfigs, setOcrInterfaceConfigs] = useAtom(ocrInterfaceConfigsAtom);
    const [openaiService, setOpenaiService] = useAtom(openaiServiceAtom);

    const [visible, setVisible] = useState(false);

    const { t } = useTranslation();

    return (
        <>
            <ConfigList label={t('config.interface.title')}>
                <ConfigItem
                    label={t('config.interface.openaiservice')}
                    help={t('config.interface.openaiservicehelp')}
                >
                    <Select
                        size='small'
                        sx={{ width: '50%' }}
                        value={openaiService}
                        onChange={(e) => {
                            setOpenaiService(e.target.value);
                            set('openai_service', e.target.value);
                        }}
                    >
                        <MenuItem value='openai'>OpenAI</MenuItem>
                        <MenuItem value='azure'>Azure</MenuItem>
                    </Select>
                </ConfigItem>
                {Object.keys(interfaceConfigs).map((x) => {
                    return (
                        <>
                            {interfaceConfigs[x]['needs'].map((y) => {
                                return (
                                    <ConfigItem
                                        label={`${t(`config.interface.${interfaceConfigs[x]['interface_name']}`)}-${t(
                                            `config.interface.${y['needs_config_key']}`
                                        )}`}
                                        help={t(y['needs_place_hold'])}
                                    >
                                        <TextField
                                            size='small'
                                            type={visible ? 'text' : 'password'}
                                            sx={{ width: '50%' }}
                                            key={nanoid()}
                                            defaultValue={y['needs_config_value']}
                                            onChange={(e) => {
                                                let configs = interfaceConfigs;
                                                for (let j in configs[x]['needs']) {
                                                    if (
                                                        configs[x]['needs'][j]['needs_config_key'] ==
                                                        y['needs_config_key']
                                                    ) {
                                                        configs[x]['needs'][j]['needs_config_value'] = e.target.value;
                                                        break;
                                                    }
                                                }
                                                setInterfaceConfigs(configs);
                                                set(`${y['needs_config_key']}`, e.target.value);
                                            }}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position='end'>
                                                        <IconButton
                                                            size='small'
                                                            onClick={() => {
                                                                setVisible(!visible);
                                                            }}
                                                        >
                                                            {visible ? (
                                                                <VisibilityOffRoundedIcon />
                                                            ) : (
                                                                <VisibilityRoundedIcon />
                                                            )}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </ConfigItem>
                                );
                            })}
                        </>
                    );
                })}
            </ConfigList>
            <ConfigList label={t('config.ocr_interface.title')}>
                {Object.keys(ocrInterfaceConfigs).map((x) => {
                    return (
                        <>
                            {ocrInterfaceConfigs[x]['needs'].map((y) => {
                                return (
                                    <ConfigItem
                                        label={`${t(
                                            `config.ocr_interface.${ocrInterfaceConfigs[x]['interface_name']}`
                                        )}-${t(`config.ocr_interface.${y['needs_config_key']}`)}`}
                                        help={t(y['needs_place_hold'])}
                                    >
                                        <TextField
                                            size='small'
                                            type={visible ? 'text' : 'password'}
                                            sx={{ width: '50%' }}
                                            key={nanoid()}
                                            defaultValue={y['needs_config_value']}
                                            onChange={(e) => {
                                                let configs = ocrInterfaceConfigs;
                                                for (let j in configs[x]['needs']) {
                                                    if (
                                                        configs[x]['needs'][j]['needs_config_key'] ==
                                                        y['needs_config_key']
                                                    ) {
                                                        configs[x]['needs'][j]['needs_config_value'] = e.target.value;
                                                        break;
                                                    }
                                                }
                                                setOcrInterfaceConfigs(configs);
                                                set(`${y['needs_config_key']}`, e.target.value);
                                            }}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position='end'>
                                                        <IconButton
                                                            size='small'
                                                            onClick={() => {
                                                                setVisible(!visible);
                                                            }}
                                                        >
                                                            {visible ? (
                                                                <VisibilityOffRoundedIcon />
                                                            ) : (
                                                                <VisibilityRoundedIcon />
                                                            )}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </ConfigItem>
                                );
                            })}
                        </>
                    );
                })}
            </ConfigList>
        </>
    );
}
