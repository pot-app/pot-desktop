import { useState, useCallback, useEffect } from 'react';
import { store } from '../utils/store';

export const useConfig = (key, defaultValue) => {
    const [property, updateProperty] = useState(defaultValue);

    useEffect(() => {
        store.get(key).then((v) => {
            if (v === null) {
                store.set(key, property);
                store.save();
            } else {
                updateProperty(v);
            }
        });
    }, []);

    let timer = null;
    const saveProperty = useCallback((v) => {
        updateProperty(v);
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => {
            store.set(key, v);
            store.save();
        }, 500);
    }, []);

    return [property, saveProperty, updateProperty];
};
