import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Spacer, Chip, ButtonGroup, Tooltip } from '@nextui-org/react';
import { appWindow, LogicalSize } from '@tauri-apps/api/window';
import { BsInfoSquareFill, BsFillChatRightDotsFill, BsSearchHeart } from 'react-icons/bs';
import { PiTranslateFill } from 'react-icons/pi';
import { AiFillAppstore } from 'react-icons/ai';
import { useTranslation } from 'react-i18next';
import { AiOutlineUserAdd } from 'react-icons/ai';
import { PiTextboxFill } from 'react-icons/pi';
import { MdKeyboardAlt } from 'react-icons/md';
import { MdExtension } from 'react-icons/md';
import { AiFillCloud } from 'react-icons/ai';
import { FaHistory } from 'react-icons/fa';
import { BsPinFill } from 'react-icons/bs';

import { MdMoreVert } from 'react-icons/md';
import { React, useEffect, useState, useRef } from 'react';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { useConfig } from '../../../../hooks';
import { uSysPre, uBarDataPre, systemPreInputs } from '../../../Config/components/Preinput/SysPreInputs';
import "./index.css";

export default function SelectPrompt(props) {
    const setSKey = props.setSKey;
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    const ref = useRef(null);

    const [userPreInputs, setUserPreInputs] = useConfig('user_pre_inputs', JSON.stringify(uSysPre));
    // console.log(userPreInputs)
    const userPreInputsData = userPreInputs && JSON.parse(userPreInputs);
    // console.log(userPreInputsData)
    const userPreInputsKeys = userPreInputsData && Object.keys(userPreInputsData);

    const [uBarData, setUBarData] = useConfig('user_bar_data', JSON.stringify(uBarDataPre));
    const userBarData = uBarData && JSON.parse(uBarData);
    const [uSelectBarData, setUSelectBarData] = useState(userBarData);
    useEffect(() => {
        if (userBarData && uSelectBarData == null) {
            setUSelectBarData(userBarData);
        }
    }, [userBarData]);
    useEffect(() => {
        if (uSelectBarData) {
            setUBarData(JSON.stringify(uSelectBarData))
        }
    }, [uSelectBarData])
    // console.log(userBarData)
    // console.log(uSelectBarData)
    // useEffect(() => {
    //     setUBarData(JSON.stringify(uSelectBarData))
    // }, [uSelectBarData])

    // for (const item of uBarDefaultData) {

    // }
    // const [uSelectBarData, setUSelectBarData] = useState([
    //     {
    //         key: 'Summarize',
    //         selected: true,
    //     },
    //     {
    //         key: 'Translate',
    //         selected: false,
    //     },
    //     {
    //         key: 'Rewrite',
    //         selected: true,
    //     },
    //     {
    //         key: 'Expand',
    //         selected: true,
    //     },
    // ]);

    function setStyle(pathname) {
        return location.pathname.includes(pathname) ? 'flat' : 'light';
    }

    const selectStyle = {
        // height: '30px',
        // fontSize: 0,
        padding: '10px',
        // backgroundColor: 'white',
        width: 'auto',
        // minWidth: '700px'
    };

    const selectItemStyle = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    };
    const QuickActionsStyle = {
        // width: '100%',
        // height: '100%',
        padding: '5px 20px',
        backgroundColor: 'white',
        maxHeight: '300px',
        overflowY: 'auto',
    };

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
                            setSKey(key_);
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
    const [isHovered, setIsHovered] = useState(false);

    // const [toLeave, setToLeave] = useState(false);

    const SelectBar = () => {
        return (
            <div style={selectStyle}>
                <ButtonGroup
                //  onMouseLeave={() => setIsHovered(false)}
                >
                    {userPreInputsKeys &&
                    userPreInputsData &&
                        uSelectBarData &&
                        uSelectBarData.map((item, index) => {
                            // console.log(userPreInputsData)
                            const key_ = item.key;
                            // console.log(key_)

                            const name = userPreInputsData[key_].name;
                            return item.selected ? (
                                <Tooltip
                                    showArrow={true}
                                    content={name}
                                    key={key_}
                                >
                                    <Button
                                        // fullWidth
                                        isIconOnly
                                        size='md'
                                        style={selectItemStyle}
                                        variant='light'
                                        // className='mb-[5px]'
                                        onPress={() => {
                                            setSKey(key_);
                                            // navigate(`/qsearch/${key_}/${name}`);
                                        }}
                                        // key={key_}
                                    >
                                        {key_ in systemPreInputs ? systemPreInputs[key_].icon : <AiOutlineUserAdd />}
                                    </Button>
                                </Tooltip>
                            ) : (
                                <></>
                            );
                        })}
                    <Button
                        // fullWidth
                        isIconOnly
                        size='md'
                        style={selectItemStyle}
                        onMouseOver={() => setIsHovered(true)}
                        variant='light'
                        className='more'
                        // className='mb-[5px]'
                        onPress={() => {
                            // setSKey(key_);
                            // navigate(`/qsearch/${key_}/${name}`);
                        }}
                        // key={key_}
                    >
                        <MdMoreVert />
                        {/* {systemPreInputs[key_].icon} */}
                    </Button>
                </ButtonGroup>
            </div>
        );
    };
    const reorder = (list, startIndex, endIndex) => {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return result;
    };

    let update = false;
    const getUpdate = () => update;
    // let leave = false;
    // const getLeave = () => leave;

    const onDragEnd = (result) => {
        // Handle the drag-and-drop result
        update = false;
        if (!result.destination) return;
        const items = reorder(uSelectBarData, result.source.index, result.destination.index);
        setUSelectBarData(items);

        // Update your state based on the drag-and-drop result
        // result.source.index and result.destination.index give the indices of the dragged and dropped items
    };

    const onDragStart = (result) => {
        // console.log('start');
        update = true;
        // console.log('update', getUpdate());
        // setIsUpdate(true);
    };
    // let hoverIndex = -1;
    // const getHoverIndex = () => hoverIndex;

    const rezise = () => {
        appWindow.setSize(new LogicalSize(ref.current.clientWidth, ref.current.clientHeight));

    }
    useEffect(() => {
        rezise()
    }, [isHovered, uSelectBarData]);


    const QuickActions = () => {
        return (
            <div
                onMouseOver={() => setIsHovered(true)}
                style={QuickActionsStyle}
            >
                <Chip isDisabled color="primary">Quick Actions</Chip>
                <DragDropContext
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                >
                    <Droppable
                        droppableId='droppable'
                        direction='vertical'
                    >
                        {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                            >
                                {uSelectBarData &&
                                    uSelectBarData.map((item, index) => {
                                        const key_ = item.key;
                                        // console.log(getHoverIndex())
                                        return (
                                            <Draggable
                                                key={key_}
                                                draggableId={key_}
                                                index={index}
                                            >
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.dragHandleProps}
                                                        {...provided.draggableProps}
                                                        className='quickItem'
                                                    >
                                                        <div
                                                            style={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                padding: '8px 10px',
                                                                // backgroundColor:
                                                                //     getHoverIndex() === index
                                                                //         ? 'lightgray'
                                                                //         : 'transparent',
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    display: 'flex',
                                                                }}
                                                                onClick={() => {
                                                                    setSKey(key_);
                                                                                }}
                                                            >
                                                                <div>
                                                                    {key_ in systemPreInputs ? (
                                                                        systemPreInputs[key_].icon
                                                                    ) : (
                                                                        <AiOutlineUserAdd />
                                                                    )}
                                                                </div>
                                                                <div>{userPreInputsData[item.key].name}</div>
                                                            </div>
                                                            <div
                                                                onClick={() => {
                                                                    const updatedArray = uSelectBarData.map((item) =>
                                                                        item.key === key_
                                                                            ? { ...item, selected: !item.selected }
                                                                            : item
                                                                    );

                                                                    // 使用 setMyArray 更新状态
                                                                    setUSelectBarData(updatedArray);
                                                                }}
                                                            >
                                                                <BsPinFill
                                                                    className={`text-[20px] ${
                                                                        item.selected
                                                                            ? 'text-primary'
                                                                            : 'text-default-400'
                                                                    }`}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        );
                                    })}
                                {provided.placeholder}
                            <Spacer y={2} />

                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>
        );
    };

    return (
        <>
            <div
                ref={ref}
                onMouseLeave={() => {
                    // console.log('update', getUpdate())
                    if (getUpdate()) {
                        // setToLeave(true);
                        // leave=true;
                        return;
                    }
                    // console.log('out')
                    setIsHovered(false);
                }
            }
                // onMouseUp={() => {
                //     console.log('toLeave', toLeave)
                //     if (toLeave) {
                //         console.log('1212')
                //         setIsHovered(false)
                //         leave=false
                //     }
                // }}
                style={{
                    backgroundColor: 'transparent',
                    overflow: 'hidden',
                    // height: '100%'
                    width:'auto'
                }}
            >
                <SelectBar />
                {/* <QuickActions /> */}
                {isHovered && QuickActions()}
            </div>
        </>
    );
}
