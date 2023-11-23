import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Card, CardBody } from '@nextui-org/react';
import { BsInfoSquareFill, BsFillChatRightDotsFill, BsSearchHeart } from 'react-icons/bs';
import { PiTranslateFill } from 'react-icons/pi';
import { AiFillAppstore } from 'react-icons/ai';
import { useTranslation } from 'react-i18next';
import { listen } from '@tauri-apps/api/event';
import { PiTextboxFill } from 'react-icons/pi';
import { MdKeyboardAlt } from 'react-icons/md';
import { MdExtension } from 'react-icons/md';
import { AiFillCloud } from 'react-icons/ai';
import { FaHistory } from 'react-icons/fa';
import React, { useState, useEffect } from 'react';
import { useConfig } from '../../../../hooks';
import Chat from '../../../Config/components/Chat';

// let unlisten = null;

export default function ChatArea(props) {
    const key = props.key_ || null;
    const userInput = props.userInput || null;
    console.log(userInput)
    // const [hideWindow] = useConfig('translate_hide_window', false);
    // const [userInput, setUserInput] = useState('');
    // useEffect(() => {
    //     if (hideWindow !== null) {
    //         if (unlisten) {
    //             unlisten.then((f) => {
    //                 f();
    //             });
    //         }
    //         unlisten = listen('new_text', (event) => {
    //             appWindow.setFocus();
    //             handleNewText(event.payload);
    //             setUserInput(event.payload);
    //             console.log(event.payload)
    //         });
    //     }
    // }, [hideWindow]);

    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div style={{
            backgroundColor: 'white'
        }}>
            {/* 这里是chat部分
            userInput: {userInput} */}
            {/* <div style={{marginTop:'10px'}}> */}
            <Chat key_={key} userInput={userInput} />
            {/* </div> */}
        </div>
        
    );
}
