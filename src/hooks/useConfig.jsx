import { useState, useCallback } from 'react';
import { store } from '../utils/store';

export const useConfig = (name, dft) => {
    const [s, setS] = useState(dft);

    store.get(name).then((v) => {
        if (v) {
            setS(v);
        } else {
            store.set(name, dft);
            store.save();
        }
    });
    const setConfig = useCallback((v) => {
        setS(v);
        store.set(name, v);
        store.save();
    }, []);
    return [s, setConfig];
};
