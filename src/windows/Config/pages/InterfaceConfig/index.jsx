import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import { TextField, Select, MenuItem, Tooltip, IconButton, InputAdornment } from '@mui/material';
import { useAtom } from 'jotai';
import { nanoid } from 'nanoid';
import React, { useState } from 'react';
import { interfaceConfigsAtom, openaiServiceAtom } from '../..';
import ConfigList from '../../components/ConfigList';
import ConfigItem from '../../components/ConfigItem';
import { set } from '../../../../global/config';

export default function InterfaceConfig() {
    const [interfaceConfigs, setInterfaceConfigs] = useAtom(interfaceConfigsAtom);
    const [openaiService, setOpenaiService] = useAtom(openaiServiceAtom);

    const [visible, setVisible] = useState(false);

    return (
        <ConfigList label='翻译接口'>
            <ConfigItem
                label='OpenAI 服务提供商'
                help='仅在你明确清楚自己使用的是Azure的OpenAI Service的时候需要设置此项，其他情况下一律使用默认openai服务'
            >
                <Tooltip>
                    <Select
                        size='small'
                        sx={{ width: '300px' }}
                        value={openaiService}
                        onChange={(e) => {
                            setOpenaiService(e.target.value);
                            set('openai_service', e.target.value);
                        }}
                    >
                        <MenuItem value='openai'>OpenAI</MenuItem>
                        <MenuItem value='azure'>Azure</MenuItem>
                    </Select>
                </Tooltip>
            </ConfigItem>
            {Object.keys(interfaceConfigs).map((x) => {
                return (
                    <>
                        {interfaceConfigs[x]['needs'].map((y) => {
                            return (
                                <ConfigItem
                                    label={`${interfaceConfigs[x]['interface_name']}-${y['needs_display_name']}`}
                                >
                                    <TextField
                                        size='small'
                                        type={visible ? 'text' : 'password'}
                                        sx={{ width: '300px' }}
                                        key={nanoid()}
                                        placeholder={y['needs_place_hold']}
                                        defaultValue={y['needs_config_value']}
                                        onChange={(e) => {
                                            let configs = interfaceConfigs;
                                            for (let j in configs[x]['needs']) {
                                                if (
                                                    configs[x]['needs'][j]['needs_config_key'] == y['needs_config_key']
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
    );
}
