import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Card, CardBody } from '@nextui-org/react';
import { BsInfoSquareFill, BsFillChatRightDotsFill, BsSearchHeart } from 'react-icons/bs';
import { PiTranslateFill } from 'react-icons/pi';
import { AiFillAppstore } from 'react-icons/ai';
import { useTranslation } from 'react-i18next';
import { PiTextboxFill } from 'react-icons/pi';
import { MdKeyboardAlt } from 'react-icons/md';
import { MdExtension } from 'react-icons/md';
import { AiFillCloud } from 'react-icons/ai';
import { FaHistory } from 'react-icons/fa';
import React from 'react';
import { useConfig } from '../../../../hooks';
import { uSysPre } from '../../../Config/components/Preinput/SysPreInputs';
export default function SelectPrompt(props) {
    const setSKey = props.setSKey;
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const [userPreInputs, setUserPreInputs] = useConfig('user_pre_inputs', JSON.stringify(uSysPre));
    let userPreInputsData = userPreInputs && JSON.parse(userPreInputs);
    const userPreInputsKeys = userPreInputsData && Object.keys(userPreInputsData);

    function setStyle(pathname) {
        return location.pathname.includes(pathname) ? 'flat' : 'light';
    }

    const subPromptsButton = () => {
        // console.log(userPreInputsKeys);
        return (
            userPreInputsKeys &&
            userPreInputsKeys.map((key_, index) => {
                const name = userPreInputsData[key_].name;
                return (
                    <Button
                        // fullWidth
                        size='md'
                        variant={setStyle(key_)}
                        className='mb-[5px]'
                        onPress={() => {
                            setSKey(key_)
                            // navigate(`/qsearch/${key_}/${name}`);
                        }}
                        key={key_}
                    >
                        <div className='w-full'>{userPreInputsData[key_].name}</div>
                    </Button>
                );
            })
        );
    };

    return (
        <div>{subPromptsButton()}</div>
        
    );
}
