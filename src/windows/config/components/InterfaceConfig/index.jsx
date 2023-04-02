import { TextField, Switch, FormControlLabel } from '@mui/material';
import React, { useEffect } from 'react';
import { atom, useAtom } from 'jotai';
import { nanoid } from 'nanoid';
import * as interfaces from '../../../../interfaces';
import { get } from '../../main';
import ConfigList from '../ConfigList';
import ConfigItem from '../ConfigItem';

export const interfaceConfigsAtom = atom({});

export default function InterfaceConfig() {
    const [interfaceConfigs, setInterfaceConfigs] = useAtom(interfaceConfigsAtom);

    useEffect(() => {
        let interface_configs = {};

        Object.keys(interfaces).map(
            i => {
                interface_configs[i] = {
                    'enable': get(`${i}_enable`) ?? true,
                    'interface_key': i,
                    'interface_name': interfaces[i]['info']['name'],
                    'needs': []
                }
                const needs = interfaces[i]['info']['needs'];
                needs.map(
                    n => {
                        interface_configs[i]['needs'].push({
                            'needs_config_key': n['config_key'],
                            'needs_display_name': n['display_name'],
                            'needs_place_hold': n['place_hold'],
                            'needs_config_value': get(n['config_key']) ?? ''
                        })
                    }
                )
            }
        )
        setInterfaceConfigs(interface_configs)
    }, [])

    return (
        <ConfigList label="🛠️接口设置🛠️">
            {
                Object.keys(interfaceConfigs).map(
                    x => {
                        return <ConfigItem
                            key={nanoid()}
                            label={interfaceConfigs[x]['interface_name']}
                            labelItem={
                                <FormControlLabel
                                    label="启用"
                                    control={
                                        <Switch
                                            defaultChecked={interfaceConfigs[x]['enable']}
                                            onChange={e => {
                                                let configs = interfaceConfigs;
                                                configs[x]['enable'] = e.target.checked
                                                setInterfaceConfigs(configs)
                                            }}
                                        />}
                                />
                            }
                        >

                            {
                                interfaceConfigs[x]['needs'].map(y => {
                                    return <TextField
                                        fullWidth
                                        sx={{ marginTop: '16px' }}
                                        key={nanoid()}
                                        label={y['needs_display_name']}
                                        placeholder={y['needs_place_hold']}
                                        defaultValue={y['needs_config_value']}
                                        onChange={(e) => {
                                            let configs = interfaceConfigs;
                                            for (let j in configs[x]['needs']) {
                                                if (configs[x]['needs'][j]['needs_config_key'] == y['needs_config_key']) {
                                                    configs[x]['needs'][j]['needs_config_value'] = e.target.value
                                                    break;
                                                }
                                            }
                                            setInterfaceConfigs(configs)
                                        }}
                                    />
                                })
                            }
                        </ConfigItem>
                    }
                )
            }
        </ConfigList>
    )
}
