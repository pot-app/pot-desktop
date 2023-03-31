import React, { useEffect } from 'react';
import { atom, useAtom } from 'jotai';
import { TextField } from '@mui/material';
import { nanoid } from 'nanoid';
import * as interfaces from '../../../../interfaces';
import { get } from '../../main';
import ConfigList from '../ConfigList';
import ConfigItem from '../ConfigItem';

export const interfaceConfigsAtom = atom([]);

export default function InterfaceConfig() {
    const [interfaceConfigs, setInterfaceConfigs] = useAtom(interfaceConfigsAtom);

    useEffect(() => {
        let interface_configs = [];
        Object.keys(interfaces).map(
            i => {
                const needs = interfaces[i]['info']['needs'];
                needs.map(
                    n => {
                        interface_configs.push({
                            'interface_key': i,
                            'interface_name': interfaces[i]['info']['name'],
                            'needs_config_key': n['config_key'],
                            'needs_display_name': n['display_name'],
                            'needs_place_hold': n['place_hold'],
                            'needs_config_value': get(n['config_key']) || ''
                        })
                    }
                )
            }
        )
        setInterfaceConfigs(interface_configs)
    }, [])

    return (
        <ConfigList label="接口设置">
            {
                interfaceConfigs.map(
                    x => {
                        return <ConfigItem key={nanoid()} label={`${x['interface_name']} ${x['needs_display_name']}`}>
                            <TextField
                                fullWidth
                                placeholder={x['needs_place_hold']}
                                defaultValue={x['needs_config_value']}
                                onChange={(e) => {
                                    let configs = interfaceConfigs;
                                    for (let i in configs) {
                                        if (configs[i]['needs_config_key'] == x['needs_config_key']) {
                                            configs[i]['needs_config_value'] = e.target.value
                                            break;
                                        }
                                    }
                                    setInterfaceConfigs(configs)
                                }}
                            />
                        </ConfigItem>
                    }
                )
            }
        </ConfigList>
    )
}
