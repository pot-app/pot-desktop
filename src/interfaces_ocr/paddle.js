import { ocrID } from '../windows/Ocr/components/TextArea';
import axios from 'axios';
import cv from 'opencv.js';
import * as ort from 'onnxruntime-web';
import clipper from 'js-clipper';

export const info = {
    name: 'paddle',
    supportLanguage: {
        auto: 'zh_cn',
        zh_cn: 'zh_cn',
        zh_tw: 'zh_tw',
        en: 'en',
        ja: 'ja'
    },
    needs: [],
};
var dev = false;
var limitSideLen = 960,
    imgH = 48,
    imgW = 320;
var detShape = [960, 960];
var det, rec, dic;
export async function ocr(base64, lang, setText, id) {
    const { supportLanguage } = info;
    if (!lang in supportLanguage) {
        throw 'Unsupported Language';
    }
    const res = await axios.get(`/ocr/${supportLanguage[lang]}/dict.txt`);
    // init
    det = await ort.InferenceSession.create("/ocr/ppocr_det.onnx");
    rec = await ort.InferenceSession.create(`/ocr/${supportLanguage[lang]}/ppocr_rec.onnx`);
    dic = res.data.split(/\r\n|\r|\n/);

    // get img
    let imgElement = document.getElementById("ocr-image");
    let canvas = document.createElement("canvas");
    canvas.width = imgElement.width;
    canvas.height = imgElement.height;
    canvas.getContext("2d").drawImage(imgElement, 0, 0);
    let img = canvas.getContext("2d").getImageData(0, 0, imgElement.width, imgElement.height)

    let h = img.height, w = img.width;

    let { transposedData, image } = beforeDet(img, detShape[0], detShape[1]);
    const detResults = await runDet(transposedData, image, det);

    let box = afterDet(detResults.data, detResults.dims[3], detResults.dims[2], img);

    let mainLine = [];
    for (let i of beforeRec(box)) {
        let { b, imgH, imgW } = i;
        const recResults = await runRec(b, imgH, imgW, rec);
        if (dic.at(-1) == "") {
            // 多出的换行
            dic[dic.length - 1] = " ";
        } else {
            dic.push(" ");
        }
        let line = afterRec(recResults, dic);
        mainLine = line.concat(mainLine);
    }
    for (let i in mainLine) {
        let rx = w / image.width,
            ry = h / image.height;
        let b = box[mainLine.length - Number(i) - 1].box;
        for (let p of b) {
            p[0] = p[0] * rx;
            p[1] = p[1] * ry;
        }
        mainLine[i]["box"] = b;
    }
    mainLine = mainLine.filter((x) => x.mean >= 0.5);
    mainLine = afAfRec(mainLine);
    let result = '';
    for (let i of mainLine) {
        result += i.text + '\n';
    }
    if (id === ocrID || id === 'translate') {
        setText(result);
    }
}

async function runDet(transposedData, image, det) {
    let x = transposedData.flat(Infinity);
    const detData = Float32Array.from(x);

    const detTensor = new ort.Tensor("float32", detData, [1, 3, image.height, image.width]);
    let detFeed = {};
    detFeed[det.inputNames[0]] = detTensor;

    const detResults = await det.run(detFeed);
    return detResults[det.outputNames[0]];
}

async function runRec(b, imgH, imgW, rec) {
    const recData = Float32Array.from(b.flat(Infinity));

    const recTensor = new ort.Tensor("float32", recData, [b.length, 3, imgH, imgW]);
    let recFeed = {};
    recFeed[rec.inputNames[0]] = recTensor;

    const recResults = await rec.run(recFeed);
    return recResults[rec.outputNames[0]];
}

function data2canvas(data, w, h) {
    let x = document.createElement("canvas");
    x.width = w || data.width;
    x.height = h || data.height;
    x.getContext("2d").putImageData(data, 0, 0);
    return x;
}

function resizeImg(data, w, h) {
    let x = data2canvas(data);
    let src = document.createElement("canvas");
    src.width = w;
    src.height = h;
    src.getContext("2d").scale(w / data.width, h / data.height);
    src.getContext("2d").drawImage(x, 0, 0);
    return src.getContext("2d").getImageData(0, 0, w, h);
}

function beforeDet(image, shapeH, shapeW) {
    let ratio = 1;
    let h = image.height,
        w = image.width;
    if (Math.max(h, w) > limitSideLen) {
        if (h > w) {
            ratio = limitSideLen / h;
        } else {
            ratio = limitSideLen / w;
        }
    }
    let resizeH = shapeH || h * ratio;
    let resizeW = shapeW || w * ratio;

    resizeH = Math.max(Math.round(resizeH / 32) * 32, 32);
    resizeW = Math.max(Math.round(resizeW / 32) * 32, 32);
    image = resizeImg(image, resizeW, resizeH);

    const transposedData = toPaddleInput(image, [0.485, 0.456, 0.406], [0.229, 0.224, 0.225]);

    return { transposedData, image };
}

function afterDet(data, w, h, srcData) {
    var myImageData = new ImageData(w, h);
    for (let i in data) {
        let n = Number(i) * 4;
        const v = (data[i]) > 0.3 ? 255 : 0;
        myImageData.data[n] = myImageData.data[n + 1] = myImageData.data[n + 2] = v;
        myImageData.data[n + 3] = 255;
    }
    let canvas = data2canvas(myImageData);

    let edgeRect = [];

    let src = cv.imread(canvas);

    cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
    let contours = new cv.MatVector();
    let hierarchy = new cv.Mat();

    cv.findContours(src, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);

    for (let i = 0; i < contours.size(); i++) {
        let minSize = 3;
        let cnt = contours.get(i);
        let { points, sside } = getMiniBoxes(cnt);
        if (sside < minSize) continue;
        // TODO sort fast

        let clipBox = unclip(points);

        const boxMap = new cv.matFromArray(clipBox.length / 2, 1, cv.CV_32SC2, clipBox);

        const resultObj = getMiniBoxes(boxMap);
        let box = resultObj.points;
        if (resultObj.sside < minSize + 2) {
            continue;
        }
        function clip(n, min, max) {
            return Math.max(min, Math.min(n, max));
        }

        let rx = srcData.width / w;
        let ry = srcData.height / h;

        for (let i = 0; i < box.length; i++) {
            box[i][0] *= rx;
            box[i][1] *= ry;
        }

        let box1 = orderPointsClockwise(box);
        box1.forEach((item) => {
            item[0] = clip(Math.round(item[0]), 0, srcData.width);
            item[1] = clip(Math.round(item[1]), 0, srcData.height);
        });
        let rect_width = int(linalgNorm(box1[0], box1[1]));
        let rect_height = int(linalgNorm(box1[0], box1[3]));
        if (rect_width <= 3 || rect_height <= 3) continue;

        let c0 = data2canvas(srcData);

        let c = getRotateCropImage(c0, box);

        edgeRect.push({ box, img: c.getContext("2d").getImageData(0, 0, c.width, c.height) });
    }

    src.delete();
    contours.delete();
    hierarchy.delete();

    src = contours = hierarchy = null;

    return edgeRect;
}

function polygonPolygonArea(polygon) {
    let i = -1,
        n = polygon.length,
        a,
        b = polygon[n - 1],
        area = 0;

    while (++i < n) {
        a = b;
        b = polygon[i];
        area += a[1] * b[0] - a[0] * b[1];
    }

    return area / 2;
}

function polygonPolygonLength(polygon) {
    let i = -1,
        n = polygon.length,
        b = polygon[n - 1],
        xa,
        ya,
        xb = b[0],
        yb = b[1],
        perimeter = 0;

    while (++i < n) {
        xa = xb;
        ya = yb;
        b = polygon[i];
        xb = b[0];
        yb = b[1];
        xa -= xb;
        ya -= yb;
        perimeter += Math.hypot(xa, ya);
    }

    return perimeter;
}

function unclip(box) {
    const unclip_ratio = 1.5;
    const area = Math.abs(polygonPolygonArea(box));
    const length = polygonPolygonLength(box);
    const distance = (area * unclip_ratio) / length;
    const tmpArr = [];
    box.forEach((item) => {
        const obj = {
            X: 0,
            Y: 0,
        };
        obj.X = item[0];
        obj.Y = item[1];
        tmpArr.push(obj);
    });
    const offset = new clipper.ClipperOffset();
    offset.AddPath(tmpArr, clipper.JoinType.jtRound, clipper.EndType.etClosedPolygon);
    const expanded = [];
    offset.Execute(expanded, distance);
    let expandedArr = [];
    expanded[0] &&
        expanded[0].forEach((item) => {
            expandedArr.push([item.X, item.Y]);
        });
    expandedArr = [].concat(...expandedArr);

    return expandedArr;
}

function boxPoints(center, size, angle) {
    const width = size.width;
    const height = size.height;

    const theta = (angle * Math.PI) / 180.0;
    const cosTheta = Math.cos(theta);
    const sinTheta = Math.sin(theta);

    const cx = center.x;
    const cy = center.y;

    const dx = width * 0.5;
    const dy = height * 0.5;

    const rotatedPoints = [];

    // Top-Left
    const x1 = cx - dx * cosTheta + dy * sinTheta;
    const y1 = cy - dx * sinTheta - dy * cosTheta;
    rotatedPoints.push([x1, y1]);

    // Top-Right
    const x2 = cx + dx * cosTheta + dy * sinTheta;
    const y2 = cy + dx * sinTheta - dy * cosTheta;
    rotatedPoints.push([x2, y2]);

    // Bottom-Right
    const x3 = cx + dx * cosTheta - dy * sinTheta;
    const y3 = cy + dx * sinTheta + dy * cosTheta;
    rotatedPoints.push([x3, y3]);

    // Bottom-Left
    const x4 = cx - dx * cosTheta - dy * sinTheta;
    const y4 = cy - dx * sinTheta + dy * cosTheta;
    rotatedPoints.push([x4, y4]);

    return rotatedPoints;
}

function getMiniBoxes(contour) {
    const boundingBox = cv.minAreaRect(contour);
    const points = Array.from(boxPoints(boundingBox.center, boundingBox.size, boundingBox.angle)).sort(
        (a, b) => a[0] - b[0]
    );

    let index_1 = 0,
        index_2 = 1,
        index_3 = 2,
        index_4 = 3;
    if (points[1][1] > points[0][1]) {
        index_1 = 0;
        index_4 = 1;
    } else {
        index_1 = 1;
        index_4 = 0;
    }
    if (points[3][1] > points[2][1]) {
        index_2 = 2;
        index_3 = 3;
    } else {
        index_2 = 3;
        index_3 = 2;
    }

    const box = [points[index_1], points[index_2], points[index_3], points[index_4]];
    const side = Math.min(boundingBox.size.height, boundingBox.size.width);
    return { points: box, sside: side };
}

function int(num) {
    return num > 0 ? Math.floor(num) : Math.ceil(num);
}
function flatten(arr) {
    return arr
        .toString()
        .split(",")
        .map((item) => +item);
}
function linalgNorm(p0, p1) {
    return Math.sqrt(Math.pow(p0[0] - p1[0], 2) + Math.pow(p0[1] - p1[1], 2));
}
function orderPointsClockwise(pts) {
    const rect = [
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
    ];
    const s = pts.map((pt) => pt[0] + pt[1]);
    rect[0] = pts[s.indexOf(Math.min(...s))];
    rect[2] = pts[s.indexOf(Math.max(...s))];
    const tmp = pts.filter((pt) => pt !== rect[0] && pt !== rect[2]);
    const diff = tmp[1].map((e, i) => e - tmp[0][i]);
    rect[1] = tmp[diff.indexOf(Math.min(...diff))];
    rect[3] = tmp[diff.indexOf(Math.max(...diff))];
    return rect;
}

function getRotateCropImage(img, points) {
    const img_crop_width = int(Math.max(linalgNorm(points[0], points[1]), linalgNorm(points[2], points[3])));
    const img_crop_height = int(Math.max(linalgNorm(points[0], points[3]), linalgNorm(points[1], points[2])));
    const pts_std = [
        [0, 0],
        [img_crop_width, 0],
        [img_crop_width, img_crop_height],
        [0, img_crop_height],
    ];

    const srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, flatten(points));
    const dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, flatten(pts_std));

    // 获取到目标矩阵
    const M = cv.getPerspectiveTransform(srcTri, dstTri);
    const src = cv.imread(img);
    const dst = new cv.Mat();
    const dsize = new cv.Size(img_crop_width, img_crop_height);
    // 透视转换
    cv.warpPerspective(src, dst, M, dsize, cv.INTER_CUBIC, cv.BORDER_REPLICATE, new cv.Scalar());

    const dst_img_height = dst.matSize[0];
    const dst_img_width = dst.matSize[1];
    let dst_rot;
    // 图像旋转
    if (dst_img_height / dst_img_width >= 1.5) {
        dst_rot = new cv.Mat();
        const dsize_rot = new cv.Size(dst.rows, dst.cols);
        const center = new cv.Point(dst.cols / 2, dst.cols / 2);
        const M = cv.getRotationMatrix2D(center, 90, 1);
        cv.warpAffine(dst, dst_rot, M, dsize_rot, cv.INTER_CUBIC, cv.BORDER_REPLICATE, new cv.Scalar());
    }

    let c = document.createElement("canvas");
    if (dst_rot) {
        c.width = dst_rot.matSize[1];
        c.height = dst_rot.matSize[0];
    } else {
        c.width = dst_img_width;
        c.height = dst_img_height;
    }
    cv.imshow(c, dst_rot || dst);
    if (dev) document.body.append(c);

    src.delete();
    dst.delete();
    srcTri.delete();
    dstTri.delete();
    return c;
}

function toPaddleInput(image, mean, std) {
    const imagedata = image.data;
    const redArray = [];
    const greenArray = [];
    const blueArray = [];
    let x = 0,
        y = 0;
    for (let i = 0; i < imagedata.length; i += 4) {
        if (!blueArray[y]) blueArray[y] = [];
        if (!greenArray[y]) greenArray[y] = [];
        if (!redArray[y]) redArray[y] = [];
        redArray[y][x] = (imagedata[i] / 255 - mean[0]) / std[0];
        greenArray[y][x] = (imagedata[i + 1] / 255 - mean[1]) / std[1];
        blueArray[y][x] = (imagedata[i + 2] / 255 - mean[2]) / std[2];
        x++;
        if (x == image.width) {
            x = 0;
            y++;
        }
    }

    return [blueArray, greenArray, redArray];
}

function beforeRec(box) {
    let l = [];
    function resizeNormImg(img) {
        imgW = Math.floor(imgH * maxWhRatio);
        let h = img.height,
            w = img.width;
        let ratio = w / h;
        let resizedW;
        if (Math.ceil(imgH * ratio) > imgW) {
            resizedW = imgW;
        } else {
            resizedW = Math.floor(Math.ceil(imgH * ratio));
        }
        let d = resizeImg(img, resizedW, imgH);
        let cc = data2canvas(d, imgW, imgH);
        if (dev) document.body.append(cc);
        return cc.getContext("2d").getImageData(0, 0, imgW, imgH);
    }

    let boxes = [];
    let nowWidth = 0;
    for (let i of box) {
        if (Math.abs(i.img.width - nowWidth) > 32) {
            nowWidth = i.img.width;
            boxes.push([i]);
        } else {
            if (!boxes[boxes.length - 1]) boxes.push([]);
            boxes[boxes.length - 1].push(i);
        }
    }
    let maxWhRatio = 0;
    for (let box of boxes) {
        maxWhRatio = 0;
        for (let r of box) {
            maxWhRatio = Math.max(r.img.width / r.img.height, maxWhRatio);
        }
        let b = [];
        for (let r of box) {
            b.push(toPaddleInput(resizeNormImg(r.img), [0.5, 0.5, 0.5], [0.5, 0.5, 0.5]));
        }
        l.push({ b, imgH, imgW });
    }
    return l;
}

function afterRec(data, character) {
    let predLen = data.dims[2];
    let line = [];
    let ml = data.dims[0] - 1;
    for (let l = 0; l < data.data.length; l += predLen * data.dims[1]) {
        const predsIdx = [];
        const predsProb = [];

        for (let i = l; i < l + predLen * data.dims[1]; i += predLen) {
            const tmpArr = data.data.slice(i, i + predLen);
            const tmpMax = tmpArr.reduce((a, b) => Math.max(a, b), -Infinity);
            const tmpIdx = tmpArr.indexOf(tmpMax);
            predsProb.push(tmpMax);
            predsIdx.push(tmpIdx);
        }
        line[ml] = decode(predsIdx, predsProb, true);
        ml--;
    }
    function decode(textIndex, textProb, isRemoveDuplicate) {
        const ignoredTokens = [0];
        const charList = [];
        const confList = [];
        for (let idx = 0; idx < textIndex.length; idx++) {
            if (textIndex[idx] in ignoredTokens) {
                continue;
            }
            if (isRemoveDuplicate) {
                if (idx > 0 && textIndex[idx - 1] === textIndex[idx]) {
                    continue;
                }
            }
            charList.push(character[textIndex[idx] - 1]);
            if (textProb) {
                confList.push(textProb[idx]);
            } else {
                confList.push(1);
            }
        }
        let text = "";
        let mean = 0;
        if (charList.length) {
            text = charList.join("");
            let sum = 0;
            confList.forEach((item) => {
                sum += item;
            });
            mean = sum / confList.length;
        }
        return { text, mean };
    }
    return line;
}

function afAfRec(l) {
    let line = [];
    let ind = new Map();
    for (let i in l) {
        ind.set(l[i].box, Number(i));
    }

    function calculateAverageHeight(boxes) {
        let totalHeight = 0;
        for (const box of boxes) {
            const [[, y1], , [, y2]] = box;
            const height = y2 - y1;
            totalHeight += height;
        }
        return totalHeight / boxes.length;
    }

    function groupBoxesByMidlineDifference(boxes) {
        const averageHeight = calculateAverageHeight(boxes);
        const result = [];
        for (const box of boxes) {
            const [[, y1], , [, y2]] = box;
            const midline = (y1 + y2) / 2;
            const group = result.find((b) => {
                const [[, groupY1], , [, groupY2]] = b[0];
                const groupMidline = (groupY1 + groupY2) / 2;
                return Math.abs(groupMidline - midline) < averageHeight / 2;
            });
            if (group) {
                group.push(box);
            } else {
                result.push([box]);
            }
        }

        for (const group of result) {
            group.sort((a, b) => {
                const [ltA] = a;
                const [ltB] = b;
                return ltA[0] - ltB[0];
            });
        }

        result.sort((a, b) => a[0][0][1] - b[0][0][1]);

        return result;
    }

    let boxes = groupBoxesByMidlineDifference([...ind.keys()]);

    for (let i of boxes) {
        let t = [];
        let m = 0;
        for (let j of i) {
            let x = l[ind.get(j)];
            t.push(x.text);
            m += x.mean;
        }
        line.push({ mean: m / i.length, text: t.join(" "), box: [i.at(0)[0], i.at(-1)[1], i.at(-1)[2], i.at(0)[3]] });
    }
    return line;
}