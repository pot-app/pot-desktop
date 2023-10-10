import { useCallback, useMemo, useState } from 'react';
import { debounce } from '../utils';
var AudioContext = window.AudioContext || window.webkitAudioContext;

export const useVoice = () => {
    const [data, setData] = useState(null);
    const [isStart, setIsStart] = useState(false);

    const audioContext = useMemo(() => {
        return new AudioContext();
    }, [data]);
    const audioSource = useMemo(() => {
        if (audioContext) {
            return audioContext.createBufferSource();
        }
    }, [data]);

    const start = useCallback(
        debounce((data) => {
            if (isStart) {
                audioSource.connect(audioContext.destination);
                audioSource.stop();
                setData(data);
            } else {
                audioContext.decodeAudioData(new Uint8Array(data).buffer, (buffer) => {
                    audioSource.buffer = buffer;
                    audioSource.connect(audioContext.destination);
                    audioSource.start();
                    setIsStart(true);
                    audioSource.onended = () => {
                        setIsStart(false);
                        setData(data);
                    };
                });
            }
        })
    );

    return start;
};
