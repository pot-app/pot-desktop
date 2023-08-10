import { useState, useCallback, useEffect } from 'react';
import { store } from '../utils/store';

let timer = null;

export const useConfig = (name, dft) => {
    const [s, setS] = useState(dft);

    useEffect(() => {
        store.get(name).then((v) => {
            if (v) {
                setS(v);
            } else {
                store.set(name, dft);
                store.save();
            }
        });
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

    return [s, setConfig];
};
