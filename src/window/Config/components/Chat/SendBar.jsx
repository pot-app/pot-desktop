import React, { KeyboardEventHandler, useRef } from 'react';

import { AiOutlineClear, AiOutlineSend } from 'react-icons/ai';

import Show from './Show';

const SendBar = (props) => {
    const { loading, disabled, onSend, onClear, onStop } = props;

    const inputRef = useRef(null);

    const onInputAutoSize = () => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
        }
    };

    const handleClear = () => {
        if (inputRef.current) {
            inputRef.current.value = '';
            inputRef.current.style.height = 'auto';
            onClear();
        }
    };

    const handleSend = () => {
        const content = inputRef.current.value;
        if (content) {
            onSend({
                content,
                role: 'user',
            });
        }
    };

    const onKeydown = (e) => {
        if (e.shiftKey) {
            return;
        }

        if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
            handleSend();
        }
    };

    return (
        <Show
            fallback={
                <div className='thinking'>
                    <span>Please wait ...</span>
                    <div
                        className='stop'
                        onClick={onStop}
                    >
                        Stop
                    </div>
                </div>
            }
            loading={loading}
        >
            <div className='send-bar'>
                <textarea
                    ref={inputRef}
                    className='input'
                    disabled={disabled}
                    placeholder='Shift + Enter for new line'
                    autoComplete='off'
                    rows={1}
                    onKeyDown={onKeydown}
                    onInput={onInputAutoSize}
                />
                <button
                    className='button'
                    title='Send'
                    disabled={disabled}
                    onClick={handleSend}
                >
                    <AiOutlineSend />
                </button>
                <button
                    className='button'
                    title='Clear'
                    disabled={disabled}
                    onClick={handleClear}
                >
                    <AiOutlineClear />
                </button>
            </div>
        </Show>
    );
};

export default SendBar;
