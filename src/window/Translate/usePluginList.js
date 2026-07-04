import { useEffect, useState } from 'react';
import { readDir, readTextFile, exists } from '@tauri-apps/api/fs';
import { appConfigDir, join } from '@tauri-apps/api/path';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import { listen } from '@tauri-apps/api/event';
import { BaseDirectory } from '@tauri-apps/api/fs';

/**
 * Loads installed plugin metadata (info.json) for all service types,
 * and listens for 'reload_plugin_list' events.
 */
export default function usePluginList() {
    const [pluginList, setPluginList] = useState(null);

    useEffect(() => {
        loadPluginList();

        const unsub = listen('reload_plugin_list', loadPluginList);
        return () => { unsub.then((f) => f()); };
    }, []);

    const loadPluginList = async () => {
        const serviceTypes = ['translate', 'tts', 'recognize', 'collection'];
        const result = {};
        for (const type of serviceTypes) {
            result[type] = {};
            const dir = `plugins/${type}`;
            if (await exists(dir, { dir: BaseDirectory.AppConfig })) {
                const plugins = await readDir(dir, { dir: BaseDirectory.AppConfig });
                for (const plugin of plugins) {
                    const infoPath = `${dir}/${plugin.name}/info.json`;
                    const infoStr = await readTextFile(infoPath, { dir: BaseDirectory.AppConfig });
                    const info = JSON.parse(infoStr);
                    if (info.icon) {
                        const configDir = await appConfigDir();
                        info.icon = convertFileSrc(await join(configDir, dir, plugin.name, info.icon));
                    }
                    result[type][plugin.name] = info;
                }
            }
        }
        setPluginList(result);
    };

    return pluginList;
}
