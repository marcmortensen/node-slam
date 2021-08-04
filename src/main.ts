import * as cv from 'opencv4nodejs';
import { Mat, Size } from 'opencv4nodejs';
import sdl from '@kmamal/sdl'
import { Extractor } from './extractor';

const SCREEN_HEIGHT = 540;
const SCREEN_WIDTH = 960;
const capture = new cv.VideoCapture("assets/test_countryroad.mp4");

const window = sdl.video.createWindow({ title: "My video",  width: SCREEN_WIDTH, height: SCREEN_HEIGHT});
window.show();

const stride = SCREEN_WIDTH *3;

const extractor = new Extractor();

const processImage = async (frame: Mat) => {
    if (frame.empty) {
        return;
    }
    const image = frame.resize(new Size(SCREEN_WIDTH, SCREEN_HEIGHT));

    const {keyPoints/*, descriptors, matches*/} = extractor.extract(image)

    const imageWithDescriptors = cv.drawKeyPoints(image,keyPoints);
    // Draw to the screen
    window.render(SCREEN_WIDTH, SCREEN_HEIGHT, stride, 'bgr24', imageWithDescriptors.getData());
} 

let start = true;
let frame: Mat;

do {
    frame = capture.read();
    processImage(frame);
    start = false;
  }
  while (start || !frame.empty);

  process.exit(1);
 
/*const mat = cv.imread('a.jpeg');

// save image
cv.imwrite('./out.jpeg', mat);
// show image
cv.imshow('a window name', mat);
cv.waitKey();
*/
