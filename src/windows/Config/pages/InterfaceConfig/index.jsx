import { TextField, Switch, FormControlLabel } from '@mui/material';
import { useAtom } from 'jotai';
import { nanoid } from 'nanoid';
import React from 'react';
import ConfigList from '../../components/ConfigList';
import ConfigItem from '../../components/ConfigItem';
import { set } from '../../../../global/config';
import { interfaceConfigsAtom } from '../..';

export default function InterfaceConfig() {
    const [interfaceConfigs, setInterfaceConfigs] = useAtom(interfaceConfigsAtom);

    return (
        <ConfigList label='翻译接口'>
            {Object.keys(interfaceConfigs).map((x) => {
                return (
                    <ConfigItem
                        key={nanoid()}
                        label={interfaceConfigs[x]['interface_name']}
                        labelItem={
                            <FormControlLabel
                                label='启用'
                                control={
                                    <Switch
                                        checked={interfaceConfigs[x]['enable']}
                                        onChange={(e) => {
                                            let i = { ...interfaceConfigs[x], enable: e.target.checked };
                                            let configs = { ...interfaceConfigs, [x]: i };
                                            setInterfaceConfigs(configs);
                                            set(`${x}_enable`, e.target.checked);
                                        }}
                                    />
                                }
                            />
                        }
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
                                            if (configs[x]['needs'][j]['needs_config_key'] == y['needs_config_key']) {
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
            })}
        </ConfigList>
    );
}
