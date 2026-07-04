import { Card, CardBody, CardFooter } from '@nextui-org/react';
import React, { useEffect, useRef } from 'react';
import { writeText } from '@tauri-apps/api/clipboard';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { useSpring, animated } from '@react-spring/web';
import useMeasure from 'react-use-measure';

import { sourceLanguageAtom, targetLanguageAtom } from '../LanguageArea';
import { useConfig, useToastStyle, useVoice } from '../../../../hooks';
import { sourceTextAtom, detectLanguageAtom } from '../SourceArea';
import { info, error as logError } from 'tauri-plugin-log-api';
import useTranslate from './useTranslate';
import useTts from './useTts';
import ResultContent from './ResultContent';
import ServiceSelector from './ServiceSelector';
import TranslateActions from './TranslateActions';

export default function TranslateCard(props) {
    const { index, name, translateServiceInstanceList, pluginList, serviceInstanceConfigMap, ...drag } = props;

    const [currentServiceKey, setCurrentServiceKey] = React.useState(name);

    const [appFontSize] = useConfig('app_font_size', 16);
    const [collectionServiceList] = useConfig('collection_service_list', []);
    const [ttsServiceList] = useConfig('tts_service_list', ['lingva_tts']);
    const [autoCopy] = useConfig('translate_auto_copy', 'disable');
    const [hideWindow] = useConfig('translate_hide_window', false);
    const [clipboardMonitor] = useConfig('clipboard_monitor', false);
    const [translateSecondLanguage] = useConfig('translate_second_language', 'en');
    const [historyDisable] = useConfig('history_disable', false);
    const [hide, setHide] = React.useState(true);

    const sourceText = useAtomValue(sourceTextAtom);
    const sourceLanguage = useAtomValue(sourceLanguageAtom);
    const targetLanguage = useAtomValue(targetLanguageAtom);
    const detectLanguage = useAtomValue(detectLanguageAtom);

    const { t } = useTranslation();
    const textAreaRef = useRef();
    const toastStyle = useToastStyle();
    const speak = useVoice();

    // ── Translate ─────────────────────────────────────────────────────────

    const {
        isLoading, result, error,
        setResult, setError,
        translate, translateBack, clearError,
    } = useTranslate({
        index, sourceText, sourceLanguage, targetLanguage, detectLanguage,
        serviceInstanceConfigMap, pluginList,
        historyDisable, autoCopy, hideWindow, clipboardMonitor, translateSecondLanguage,
        t,
    });

    useEffect(() => {
        if (error) logError(`[${currentServiceKey}] error: ${error}`);
    }, [error, currentServiceKey]);

    // Auto-expand card when translation result arrives
    useEffect(() => {
        if (result !== '' || error !== '') {
            setHide(false);
        }
    }, [result, error]);

    useEffect(() => {
        if (sourceText.trim() && sourceLanguage && targetLanguage &&
            autoCopy !== null && hideWindow !== null && clipboardMonitor !== null) {
            translate(currentServiceKey);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sourceText, sourceLanguage, targetLanguage, currentServiceKey]);

    // ── TTS ───────────────────────────────────────────────────────────────

    const handleSpeak = useTts(ttsServiceList, serviceInstanceConfigMap, targetLanguage, result, speak);

    // ── Animated collapse ─────────────────────────────────────────────────

    const [boundRef, bounds] = useMeasure({ scroll: true });
    const springs = useSpring({
        from: { height: 0 },
        to: { height: hide ? 0 : bounds.height },
    });

    return (
        <Card shadow='none' className='rounded-[10px]'>
            <ServiceSelector
                currentKey={currentServiceKey}
                onChange={setCurrentServiceKey}
                instanceList={translateServiceInstanceList}
                pluginList={pluginList}
                serviceInstanceConfigMap={serviceInstanceConfigMap}
                t={t}
                isLoading={isLoading}
                hide={hide}
                onToggleHide={() => setHide(!hide)}
                dragProps={drag}
            />

            <animated.div style={{ ...springs }}>
                <div ref={boundRef}>
                    <CardBody className={`p-[12px] pb-0 ${hide && 'h-0 p-0'}`}>
                        <ResultContent
                            result={result} error={error}
                            appFontSize={appFontSize} speak={speak}
                            textAreaRef={textAreaRef}
                        />
                    </CardBody>

                    <CardFooter className={`bg-content1 rounded-none rounded-b-[10px] px-[12px] p-[5px] ${hide && 'hidden'}`}>
                        <TranslateActions
                            result={result} error={error} t={t}
                            handleSpeak={handleSpeak}
                            writeText={writeText}
                            translateBack={translateBack}
                            currentTranslateServiceInstanceKey={currentServiceKey}
                            clearError={clearError} setResult={setResult}
                            translate={translate}
                            collectionServiceList={collectionServiceList}
                            sourceText={sourceText}
                            serviceInstanceConfigMap={serviceInstanceConfigMap}
                            pluginList={pluginList}
                            toastStyle={toastStyle}
                        />
                    </CardFooter>
                </div>
            </animated.div>
        </Card>
    );
}
