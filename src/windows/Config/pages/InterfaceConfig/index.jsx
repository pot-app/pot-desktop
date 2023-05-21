import { TextField, Switch, FormControlLabel, Select, MenuItem, Tooltip } from '@mui/material';
import { useAtom } from 'jotai';
import { nanoid } from 'nanoid';
import React from 'react';
import { interfaceConfigsAtom, openaiServiceAtom } from '../..';
import ConfigList from '../../components/ConfigList';
import ConfigItem from '../../components/ConfigItem';
import { set } from '../../../../global/config';

export default function InterfaceConfig() {
    const [interfaceConfigs, setInterfaceConfigs] = useAtom(interfaceConfigsAtom);
    const [openaiService, setOpenaiService] = useAtom(openaiServiceAtom);

    return (
        <ConfigList label='翻译接口'>
            <ConfigItem label='OpenAI 服务提供商'>
                <Tooltip title='仅在你明确清楚自己使用的是Azure的OpenAI Service的时候需要设置此项，其他情况下一律使用默认openai服务'>
                    <Select
                        fullWidth
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
                if (interfaceConfigs[x]['needs'][0]) {
                    return (
                        <ConfigItem
                            key={nanoid()}
                            label={interfaceConfigs[x]['interface_name']}
                        >
                            {interfaceConfigs[x]['needs'].map((y) => {
                                return (
                                    <TextField
                                        fullWidth
                                        sx={{ marginTop: '16px' }}
                                        key={nanoid()}
                                        label={y['needs_display_name']}
                                        placeholder={y['needs_place_hold']}
                                        defaultValue={y['needs_config_value']}
                                        disabled={!interfaceConfigs[x]['enable']}
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
                                    />
                                );
                            })}
                        </ConfigItem>
                    );
                }
            })}
        </ConfigList>
    );
}
