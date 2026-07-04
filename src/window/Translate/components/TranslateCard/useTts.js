import { useEffect, useState } from 'react';
import { BaseDirectory, readTextFile } from '@tauri-apps/api/fs';
import { getServiceName, getServiceSouceType, ServiceSourceType } from '../../../../utils/service_instance';
import { invoke_plugin } from '../../../../utils/invoke_plugin';
import * as builtinTtsServices from '../../../../services/tts';

/**
 * Loads TTS plugin info (if plugin-based) and provides handleSpeak().
 */
export default function useTts(ttsServiceList, serviceInstanceConfigMap, targetLanguage, result, speak) {
    const [ttsPluginInfo, setTtsPluginInfo] = useState();

    useEffect(() => {
        if (ttsServiceList && getServiceSouceType(ttsServiceList[0]) === ServiceSourceType.PLUGIN) {
            readTextFile(`plugins/tts/${getServiceName(ttsServiceList[0])}/info.json`, {
                dir: BaseDirectory.AppConfig,
            }).then((infoStr) => setTtsPluginInfo(JSON.parse(infoStr)));
        }
    }, [ttsServiceList]);

    const handleSpeak = async () => {
        const instanceKey = ttsServiceList[0];
        const source = getServiceName(instanceKey);
        if (getServiceSouceType(instanceKey) === ServiceSourceType.PLUGIN) {
            if (!ttsPluginInfo || !(targetLanguage in ttsPluginInfo.language)) {
                throw new Error('Language not supported');
            }
            const [func, utils] = await invoke_plugin('tts', source);
            const data = await func(result, ttsPluginInfo.language[targetLanguage], {
                config: serviceInstanceConfigMap[instanceKey], utils,
            });
            speak(data);
        } else {
            const langEnum = builtinTtsServices[source]?.Language;
            if (!(targetLanguage in langEnum)) throw new Error('Language not supported');
            const data = await builtinTtsServices[source].tts(
                result, langEnum[targetLanguage],
                { config: serviceInstanceConfigMap[instanceKey] },
            );
            speak(data);
        }
    };

    return handleSpeak;
}
