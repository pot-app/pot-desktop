import { useCallback, useEffect } from 'react';
import { store, setConfig } from '../utils/store';
import { debounce } from '../utils';
import { useGetState } from './useGetState.js';

export const useConfig = (key, defaultValue, options = {}) => {
    // TIPS: 期望的返回结构
    // const { sync = true } = options;

    // TIPS: 兼容原逻辑
    const { sync = false } = options;
    const [property, _setProperty, getProperty] = useGetState();

    const setPropertyDebounce = useCallback(
        debounce((v) => setConfig(key, v, true)),
        []
    );

    const setProperty = useCallback((v, forceSync = false) => {
        _setProperty(v);

        const isSync = forceSync || sync;
        isSync && setPropertyDebounce(v);
    }, []);

    // init
    useEffect(() => {
        store.get(key).then((v) => {
            if (v === null) {
                // 这里可能要考虑一下是否每次 null 就是覆盖, 不是的话, 可能 options 加多一个类似 overwrite: true/false
                setProperty(defaultValue, true);
            } else {
                setProperty(v);
            }
        });
    }, []);

    // TIPS: 期望的返回结构
    // return [property, setProperty, getProperty];

    // TIPS: 兼容原逻辑
    return [
        property,
        (v) => {
            setProperty(v, true);
        },
        setProperty,
        getProperty,
    ];
};
