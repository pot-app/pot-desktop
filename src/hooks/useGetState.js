import { useState, useRef, useCallback } from 'react';

export const useGetState = (initS) => {
    const [s, setS] = useState(initS);
    const sRef = useRef(s);
    sRef.current = s;
    const getS = useCallback(() => sRef.current, []);
    return [s, setS, getS];
};
