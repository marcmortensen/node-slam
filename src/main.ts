import * as cv from 'opencv4nodejs';
import { Mat, Size } from 'opencv4nodejs';
import sdl from '@kmamal/sdl'
import { Frame } from './frame';

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
const K = new cv.Mat([
  [focalDistance,0,0],
  [0,focalDistance,0],
  [SCREEN_WIDTH,SCREEN_HEIGHT,1]], cv.CV_32F)

const frame = new Frame(K);

const processImage = (old_image: cv.Mat, image: Mat) => {
    if (!!old_image == false || image.empty) {
        return;
    }
    const old_img = old_image.resize(new Size(SCREEN_WIDTH, SCREEN_HEIGHT));
    const img = image.resize(new Size(SCREEN_WIDTH, SCREEN_HEIGHT));

    frame.extract(old_img);
    const newFrame = frame.extract(img);

    //const points3d = image.triangulatePoints(newFrame.matches.map((e) => e.pt1), newFrame.matches.map((e) => e.pt2));
    //console.log(points3d.getDataAsArray());
    //process.exit(1);


    if (newFrame.rotationTranslationMatrix === null){
      return;
    }
    for (const match of newFrame.matches) {
        const pt1= frame.denormalize(match.pt1);
        const pt2= frame.denormalize(match.pt2);
        img.drawLine(pt1,pt2)
    }

    // Draw to the screen
    window.render(SCREEN_WIDTH, SCREEN_HEIGHT, stride, 'bgr24', img.getData());
} 

let start = true;
let image: Mat;
let old_image: Mat;

try {
do {
    image = capture.read();
    processImage(old_image, image);
    old_image = image;
    start = false;
  }
  while (start || !image.empty);

}
catch (e) {
  console.log(e);
  process.exit(1);
}
  process.exit(1);
 