import * as cv from 'opencv4nodejs';
import { Mat, Size } from 'opencv4nodejs';
import sdl from '@kmamal/sdl'
import { Extractor } from './extractor';

export const SCREEN_HEIGHT = 540;
export const SCREEN_WIDTH = 960;
const capture = new cv.VideoCapture("assets/test_countryroad.mp4");

const window = sdl.video.createWindow({ title: "My video",  width: SCREEN_WIDTH, height: SCREEN_HEIGHT});
window.show();

const stride = SCREEN_WIDTH *3;

const focalDistance = 270; 

// [focalDistance,0,SCREEN_WIDTH]
// [0,focalDistance,SCREEN_HEIGHT]
// [0,0,1]]
const K = new cv.Mat([[focalDistance,0,0],[0,focalDistance,0],[SCREEN_WIDTH,SCREEN_HEIGHT,1]], cv.CV_32F)

const extractor = new Extractor(K);

const processImage = async (old_frame: Mat, frame: Mat) => {
    if (old_frame === null || frame.empty) {
        return;
    }
    const old_image = old_frame.resize(new Size(SCREEN_WIDTH, SCREEN_HEIGHT));
    const image = frame.resize(new Size(SCREEN_WIDTH, SCREEN_HEIGHT));

    extractor.extract(old_image);
    const newFrame = extractor.extract(image);

    for (const match of newFrame.matches) {
        const pt1= extractor.denormalise(match.pt1);
        const pt2= extractor.denormalise(match.pt2);
        console.log(`RtMATRIX: ${newFrame.RtMatrix.getDataAsArray()}`)
        image.drawLine(pt1,pt2)
    }

    // Draw to the screen
    window.render(SCREEN_WIDTH, SCREEN_HEIGHT, stride, 'bgr24', image.getData());
} 

let start = true;
let frame: Mat;
let old_frame: Mat;

try {
do {
    frame = capture.read();
    processImage(old_frame, frame);
    old_frame = frame;
    start = false;
  }
  while (start || !frame.empty);

}
catch (e) {
console.log(e);
process.exit(1);
}
  process.exit(1);
 
/*const mat = cv.imread('a.jpeg');

// save image
cv.imwrite('./out.jpeg', mat);
// show image
cv.imshow('a window name', mat);
cv.waitKey();
*/
