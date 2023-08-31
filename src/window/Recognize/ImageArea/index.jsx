import { Card, CardBody, CardFooter, Button } from '@nextui-org/react';
import { appWindow } from '@tauri-apps/api/window';
import React, { useEffect, useRef } from 'react';
import { listen } from '@tauri-apps/api/event';
import { MdContentCopy } from 'react-icons/md';
import { invoke } from '@tauri-apps/api';
import { atom, useAtom } from 'jotai';

export const base64Atom = atom('');
let unlisten = null;

export default function ImageArea() {
    const [base64, setBase64] = useAtom(base64Atom);
    const imgRef = useRef();

    const load_img = () => {
        invoke('get_base64').then((v) => {
            setBase64(v);
            appWindow.show();
            appWindow.setFocus(true);
        });
    };

    useEffect(() => {
        load_img();
        if (unlisten) {
            unlisten.then((f) => {
                f();
            });
        }
        unlisten = listen('new_image', (_) => {
            load_img();
        });
    }, []);

    return (
        <Card
            shadow='none'
            className='bg-content1 h-full ml-[12px] mr-[6px]'
            radius='10'
        >
            <CardBody className='bg-content1 h-full p-0'>
                {base64 !== '' && (
                    <img
                        ref={imgRef}
                        draggable={false}
                        className='object-contain'
                        style={{ height: '100%', width: '100%' }}
                        src={'data:image/png;base64,' + base64}
                    />
                )}
            </CardBody>
            <CardFooter className='bg-content1 flex justify-start px-[12px]'>
                <Button
                    isIconOnly
                    size='sm'
                    variant='light'
                    onPress={async () => {
                        await invoke('copy_img', {
                            width: imgRef.current.naturalWidth,
                            height: imgRef.current.naturalHeight,
                        });
                    }}
                >
                    <MdContentCopy className='text-[16px]' />
                </Button>
            </CardFooter>
        </Card>
    );
}
