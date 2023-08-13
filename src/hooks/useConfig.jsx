import { useState, useCallback, useEffect } from 'react';
import { store } from '../utils/store';

export const useConfig = (name, dft) => {
    const [s, setS] = useState(dft);

    let timer;
    useEffect(() => {
        store.get(name).then((v) => {
            if (v) {
                setS(v);
            } else {
                store.set(name, dft);
                store.save();
            }
        });
        timer = null;
    }, []);

    const setConfig = useCallback((v) => {
        setS(v);
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => {
            store.set(name, v);
            store.save();
        }, 500);
    }, []);

    return [s, setConfig, setS];
};
