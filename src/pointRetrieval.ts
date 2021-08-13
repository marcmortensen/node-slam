import * as cv from 'opencv4nodejs';
import { Mat, Point2 } from 'opencv4nodejs';
import { Point3dIntefiable } from './point';
import { Map } from './map';


const triangulate = (img: Mat, pos2:Mat,  pts1: Point2[], pts2: Point2[]): Mat => {
  return img.triangulatePoints(pos2, pts1, pts2).transpose()
}

// Discard noise + points behind camara
// Homogeneous 3-D coords
const extract3DFromPoseMap = (map: Map): Point3dIntefiable[] => {

  const frame = map.frames.slice(-1)[0];
  const oldFrame = map.frames.slice(-2)[0];
    
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

    const triangulateCoords = triangulate(
      frame.pose,
      oldFramePose.rows === 3 ? oldFramePose : new cv.Mat([[1,0,0,0],[0,1,0,0],[0,0,1,0]], cv.CV_32F),
      frame.matches.map((m) => m.pt1),
      frame.matches.map((m) => m.pt2),
    )

    return triangulateCoords.getDataAsArray()
      .map((elem, index) => ({xyz: elem.map(data => data/elem[3]), idx1: frame.matches[index].idx1, idx2: frame.matches[index].idx2}))
      .filter(elem => Math.abs(elem.xyz[3]) > 0.005 &&  elem.xyz[2] > 0)
  }
export {extract3DFromPoseMap};
