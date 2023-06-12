import { ocrID } from '../windows/Ocr/components/TextArea';
import { invoke } from '@tauri-apps/api/tauri';
import jsQR from "jsqr";

export const info = {
    name: 'qrcode',
    supportLanguage: {},
    needs: [],
};

export async function ocr(imgurl, lang, setText, id) {
    let canvas = document.createElement('CANVAS');
    let ctx = canvas.getContext('2d');
    let base64 = 'data:image/png;base64,' + await invoke('get_base64');
    let img = new Image;
    img.src = base64;
    let imgdata = await new Promise((resolve, reject) => {
        img.onload = () => {
            img.crossOrigin = 'anonymous';
            canvas.height = img.height;
            canvas.width = img.width;
            ctx.drawImage(img, 0, 0);
            const height = img.height;
            const width = img.width;
            const data = ctx.getImageData(0, 0, width, height);
            if (height !== 0 && width !== 0) {
                resolve({ data, height, width });
            }
        }
    });

    const code = jsQR(imgdata.data.data, imgdata.width, imgdata.height);
    if (code) {
        if (ocrID === id || id === 'translate') {
            setText(code.data);
        }
    } else {
        throw "QR code not recognized or multiple QR codes exist"
    }
}