import jsQR from 'jsqr';

export async function recognize(base64, language, options = {}) {
    let canvas = document.createElement('CANVAS');
    let ctx = canvas.getContext('2d');
    base64 = 'data:image/png;base64,' + base64;
    let img = new Image();
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
        };
    });

    const code = jsQR(imgdata.data.data, imgdata.width, imgdata.height);
    if (code) {
        return code.data;
    } else {
        throw 'QR code not recognized or multiple QR codes exist';
    }
}

export * from './Config';
export * from './info';
