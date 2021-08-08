import * as cv from 'opencv4nodejs';
import { Mat, Point2, Size} from 'opencv4nodejs';
import sdl from '@kmamal/sdl'
import { Frame } from './frame';
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
const K = new cv.Mat([
  [focalDistance,0,0],
  [0,focalDistance,0],
  [SCREEN_WIDTH,SCREEN_HEIGHT,1]], cv.CV_32F)

const frames: Frame[] = [];



const triangulate = (img: Mat, pos2:Mat,  pts1: Point2[], pts2: Point2[]): Mat => {
  return img.triangulatePoints(pos2, pts1, pts2).transpose()
}


const processImage = (image: Mat, extractor: Extractor) => {
    if (image.empty) {
        return;
    }
    const img = image.resize(new Size(SCREEN_WIDTH, SCREEN_HEIGHT));

    const frame = new Frame(img, extractor);

    if (frames.length < 1) {
      frames.push(frame)
      return;
    }

    const oldFrame = frames.slice(-1)[0];
    const oldFramePose = oldFrame.pose;
    // from array (4x4 Matrix)
    const matData = [
      [[oldFramePose.at(0,0)], [oldFramePose.at(0,1)], [oldFramePose.at(0,2)], [oldFramePose.at(0,3)]],
      [[oldFramePose.at(1,0)], [oldFramePose.at(1,1)], [oldFramePose.at(1,2)], [oldFramePose.at(1,3)]],
      [[oldFramePose.at(2,0)], [oldFramePose.at(2,1)], [oldFramePose.at(2,2)], [oldFramePose.at(2,3)]],
      [[0], [0], [0], [1]]
    ];
    const matData4X4 = new cv.Mat(matData, cv.CV_32F);

    frame.pose = 
      frame.rotationTranslationMatrix.matMul(oldFramePose.rows === 4 ?  oldFramePose: matData4X4)
    
    frames.push(frame)


    const triangulateCoords = triangulate(
      frame.pose,
      oldFramePose.rows === 3 ? oldFramePose : new cv.Mat([[1,0,0,0],[0,1,0,0],[0,0,1,0]], cv.CV_32F),
      frame.matches.map((m) => m.pt1),
      frame.matches.map((m) => m.pt2),
    )

    // Discard noise + points behind camara
    // Homogeneous 3-D coords
    const points3D = triangulateCoords.getDataAsArray()
      .map(elem => elem.map(data => data/elem[3]))
      .filter(elem => Math.abs(elem[3]) > 0.005 &&  elem[2] > 0)

    console.log(points3D.length);

    if (frames.slice(-1)[0].rotationTranslationMatrix === null){
      return;
    }
    for (const match of frames.slice(-1)[0].matches) {
        const pt1= frame.denormalize(match.pt1);
        const pt2= frame.denormalize(match.pt2);
        img.drawLine(pt1,pt2)
    }

    // Draw to the screen
    window.render(SCREEN_WIDTH, SCREEN_HEIGHT, stride, 'bgr24', img.getData());
} 

const extractor = new Extractor(K);
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
 