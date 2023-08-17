import { useCallback, useEffect } from 'react';
import { useGetState } from './useGetState.js';
import { listen } from '@tauri-apps/api/event';
import { store } from '../utils/store';
import { debounce } from '../utils';

export const useConfig = (key, defaultValue, options = {}) => {
    const [property, setPropertyState, getProperty] = useGetState();
    const { sync = true } = options;

    // 同步到Store (State -> Store)
    const syncToStore = useCallback(
        debounce((v) => {
            store.set(key, v);
            store.save();
        }),
        []
    );

    // 同步到State (Store -> State)
    const syncToState = useCallback(() => {
        console.log('syncToState', key);
        store.get(key).then((v) => {
            if (v === null) {
                setPropertyState(defaultValue);
                store.set(key, defaultValue);
                store.save();
            } else {
                setPropertyState(v);
            }
        });
    }, []);

    const setProperty = useCallback((v, forceSync = false) => {
        setPropertyState(v);
        const isSync = forceSync || sync;
        isSync && syncToStore(v);
    }, []);

    // 初始化
    useEffect(() => {
        syncToState();
        const unlisten = listen('reload_store', syncToState);
        return () => {
            unlisten.then((f) => {
                f();
            });
        };
    }, []);

    return [property, setProperty, getProperty];
};
