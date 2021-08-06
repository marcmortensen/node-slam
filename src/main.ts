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

const processImage = async (old_frame: Mat, frame: Mat) => {
    if (old_frame === null || frame.empty) {
        return;
    }
    const old_image = old_frame.resize(new Size(SCREEN_WIDTH, SCREEN_HEIGHT));
    const image = frame.resize(new Size(SCREEN_WIDTH, SCREEN_HEIGHT));

    extractor.extract(old_image);
    const newFrame = extractor.extract(image);

    for (const match of newFrame.matches) {
        image.drawLine(match.pt1,match.pt2)
    }

    const newIamge = cv.drawKeyPoints(image, newFrame.keyPoints);
    //const imageWithDescriptorss = cv.drawMatches(frame, old_frame, keyPoints, old.keyPoints, matches);
    // Draw to the screen
    window.render(SCREEN_WIDTH, SCREEN_HEIGHT, stride, 'bgr24', newIamge.getData());
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
