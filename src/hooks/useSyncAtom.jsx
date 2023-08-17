import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';

export const useSyncAtom = (atom) => {
    const [atomValue, setAtomValue] = useAtom(atom);
    const [localValue, setLocalValue] = useState(atomValue);

    const setAtom = (v, sync = false) => {
        setLocalValue(v);
        sync && setAtomValue(v);
    };

    return [localValue, setAtom];
};
