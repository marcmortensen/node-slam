import * as cv from 'opencv4nodejs';
import { Mat, Size} from 'opencv4nodejs';
import sdl from '@kmamal/sdl'
import { Frame } from './frame';
import { Extractor } from './extractor';
import { Point, Point3dIntefiable } from './point';
import { Map } from './map';
import { extract3DFromPoseMap } from './pointRetrieval';

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

const add3DPoints = (points3d: Point3dIntefiable[], frame: Frame, oldFrame: Frame): void => {
  for (const {xyz,idx1, idx2} of points3d) {
    const pt = new Point(xyz, map);
    pt.addObservation(frame,idx1);
    pt.addObservation(oldFrame, idx2);
  }
}

const add2DPoints = (image: cv.Mat, frame: Frame): void => {
  for (const match of frame.matches) {
    const pt1= frame.denormalize(match.pt1);
    const pt2= frame.denormalize(match.pt2);
    image.drawLine(pt1,pt2)
  }
}

const processImage = (image: Mat, extractor: Extractor) => {
    if (image.empty) {
        return;
    }
    const img = image.resize(new Size(SCREEN_WIDTH, SCREEN_HEIGHT));

    new Frame(img, extractor, map);

    const frame =  map.frames.slice(-1)[0];
    const oldFrame =  map.frames.slice(-2)[0];
    if (map.frames.length -1 < 1 || frame.rotationTranslationMatrix === null) {
      return;
    }

    // Discard noise + points behind camara
    // Homogeneous 3-D coords
    const points3D = extract3DFromPoseMap(map)
    add3DPoints(points3D, frame, oldFrame)

    // Paint matches 2D
    add2DPoints(img, frame);
    // 3D Display
    map.display();

    // Draw to the screen
    window.render(SCREEN_WIDTH, SCREEN_HEIGHT, stride, 'bgr24', img.getData());
} 

const extractor = new Extractor(K);
const map = new Map();
let image: Mat;

try {
do {
    image = capture.read();
    processImage(image, extractor);
  }
  while (!image.empty);

}
catch (e) {
  console.log(e);
  process.exit(1);
}
  process.exit(1);
 