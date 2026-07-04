import { useCallback, useRef, useState } from 'react';
import { info } from 'tauri-plugin-log-api';
import { getServiceName, whetherPluginService } from '../../../../utils/service_instance';
import { invoke_plugin } from '../../../../utils/invoke_plugin';
import * as builtinServices from '../../../../services/translate';
import useAutoCopy from './useAutoCopy';
import useHistory from './useHistory';

/** Shared translate logic used by both forward-translate and translate-back. */
async function callTranslate({
    text, sourceLanguage, targetLanguage, detectLanguage,
    serviceInstanceKey, serviceInstanceConfigMap, pluginList, onResult,
}) {
    const translateServiceName = getServiceName(serviceInstanceKey);
    const sourceLang = sourceLanguage;
    let targetLang = targetLanguage;
    if (sourceLang === 'auto' && targetLang === detectLanguage) {
        targetLang = detectLanguage;
    }

    if (whetherPluginService(serviceInstanceKey)) {
        const pluginInfo = pluginList['translate'][translateServiceName];
        const instanceConfig = serviceInstanceConfigMap[serviceInstanceKey];
        info(`[callTranslate] plugin: ${translateServiceName}`);
        let [func, utils] = await invoke_plugin('translate', translateServiceName);
        return func(text, pluginInfo.language[sourceLang], pluginInfo.language[targetLang], {
            config: { ...instanceConfig, enable: 'true' },
            detect: detectLanguage, setResult: onResult, utils,
        });
    } else {
        const LanguageEnum = builtinServices[translateServiceName]?.Language;
        const instanceConfig = serviceInstanceConfigMap[serviceInstanceKey];
        info(`[callTranslate] builtin: ${translateServiceName}, lang=${sourceLang}->${targetLang}`);
        return builtinServices[translateServiceName].translate(
            text, LanguageEnum[sourceLang], LanguageEnum[targetLang],
            { config: instanceConfig, detect: detectLanguage, setResult: onResult }
        );
    }
}

/**
 * Manages a single translation card: loading/result/error state,
 * translate / translate-back, auto-copy, and history persistence.
 */
export default function useTranslate({
    index, sourceText, sourceLanguage, targetLanguage, detectLanguage,
    serviceInstanceConfigMap, pluginList,
    historyDisable, autoCopy, hideWindow, clipboardMonitor, translateSecondLanguage,
    t,
}) {
    const idRef = useRef(0);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState('');
    const [error, setError] = useState('');

    const addToHistory = useHistory();
    const { autoCopySource, autoCopyResult } = useAutoCopy({ autoCopy, hideWindow, clipboardMonitor, t });

    const translate = useCallback(async (serviceInstanceKey) => {
        const id = ++idRef.current;
        setResult('');
        setError('');

        const serviceName = getServiceName(serviceInstanceKey);
        const text = sourceText.trim();
        if (!text) return;

        let targetLang = targetLanguage;
        if (sourceLanguage === 'auto' && targetLanguage === detectLanguage) {
            targetLang = translateSecondLanguage;
        }

        // Check language support
        if (whetherPluginService(serviceInstanceKey)) {
            const pi = pluginList['translate'][serviceName];
            if (!(sourceLanguage in pi.language) || !(targetLang in pi.language)) {
                setError('Language not supported');
                return;
            }
        } else {
            const langEnum = builtinServices[serviceName].Language;
            if (!(sourceLanguage in langEnum) || !(targetLang in langEnum)) {
                setError('Language not supported');
                return;
            }
        }

        setIsLoading(true);
        setError('');
        info(`[translate] call: service=${serviceName}, src=${sourceLanguage}, tgt=${targetLang}`);

        try {
            // Auto-copy source (before translating, for 'source' mode)
            autoCopySource(text);

            const v = await callTranslate({
                text, sourceLanguage, targetLanguage: targetLang, detectLanguage,
                serviceInstanceKey, serviceInstanceConfigMap, pluginList,
                onResult: (partial) => {
                    if (idRef.current !== id) return;
                    setResult(partial);
                },
            });
            if (idRef.current !== id) return;
            const clean = typeof v === 'string' ? v.trim() : v;
            setResult(clean);
            info(`[${serviceInstanceKey}] resolve: ${clean}`);

            if (!historyDisable) {
                addToHistory(text, detectLanguage, targetLang, serviceName, clean);
            }

            // Auto-copy result (for 'target' / 'source_target' modes)
            if (index === 0) {
                autoCopyResult(text, clean);
            }
        } catch (e) {
            if (idRef.current !== id) return;
            info(`[${serviceInstanceKey}] reject: ${e}`);
            setError(e.toString());
        } finally {
            if (idRef.current === id) {
                setIsLoading(false);
            }
        }
    }, [sourceText, sourceLanguage, targetLanguage, detectLanguage,
        serviceInstanceConfigMap, pluginList, historyDisable,
        autoCopy, hideWindow, clipboardMonitor, translateSecondLanguage,
        t, index, autoCopySource, autoCopyResult, addToHistory]);

    const translateBack = useCallback(async (resultText, serviceInstanceKey) => {
        const id = ++idRef.current;

        let newSourceLanguage = targetLanguage;
        let newTargetLanguage = sourceLanguage;
        if (sourceLanguage === 'auto') {
            newSourceLanguage = detectLanguage || 'auto';
        }
        if (newSourceLanguage === 'auto' && newTargetLanguage === detectLanguage) {
            newTargetLanguage = translateSecondLanguage;
        }

        const serviceName = getServiceName(serviceInstanceKey);

        if (whetherPluginService(serviceInstanceKey)) {
            const pi = pluginList['translate'][serviceName];
            if (!(newSourceLanguage in pi.language) || !(newTargetLanguage in pi.language)) {
                setError('Language not supported');
                return;
            }
        } else {
            const langEnum = builtinServices[serviceName].Language;
            if (!(newSourceLanguage in langEnum) || !(newTargetLanguage in langEnum)) {
                setError('Language not supported');
                return;
            }
        }

        setIsLoading(true);
        setError('');

        info(`[translate] start: service=${serviceName}, source=${newSourceLanguage}, target=${newTargetLanguage}, text="${resultText.slice(0, 50)}"`);

        try {
            const v = await callTranslate({
                text: resultText.trim(),
                sourceLanguage: newSourceLanguage,
                targetLanguage: newTargetLanguage,
                detectLanguage: newSourceLanguage,
                serviceInstanceKey, serviceInstanceConfigMap, pluginList,
                onResult: (partial) => {
                    if (idRef.current !== id) return;
                    setResult(partial);
                },
            });
            if (idRef.current !== id) return;
            const clean = typeof v === 'string' ? v.trim() : v;
            setResult(clean === resultText ? clean + ' ' : clean);
            info(`[${serviceInstanceKey}] translate-back: ${clean}`);
        } catch (e) {
            if (idRef.current !== id) return;
            setError(e.toString());
        } finally {
            if (idRef.current === id) {
                setIsLoading(false);
            }
        }
    }, [sourceLanguage, targetLanguage, detectLanguage, translateSecondLanguage,
        serviceInstanceConfigMap, pluginList, index]);

    const clearError = useCallback(() => setError(''), []);
    const clearResult = useCallback(() => setResult(''), []);

    return { isLoading, result, error, setResult, setError, translate, translateBack, clearError, clearResult };
}
