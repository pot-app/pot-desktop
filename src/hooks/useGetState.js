import { useState, useRef, useCallback } from 'react';

export const useGetState = (initState) => {
    const [state, setState] = useState(initState);
    const stateRef = useRef(state);
    stateRef.current = state;
    const getState = useCallback(() => stateRef.current, []);
    return [state, setState, getState];
};
