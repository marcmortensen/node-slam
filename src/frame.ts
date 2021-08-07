import * as cv from 'opencv4nodejs';
import { Mat, Point2 } from 'opencv4nodejs';
import { Extractor, TupleKeyPoints } from './extractor';

export class Frame {

    K: cv.Mat;
    KInverted: cv.Mat;
    focalDistance : number;
    pose: cv.Mat;
    extractor: Extractor;
  
    constructor(K: Mat) {
        
      this.K = K;
      this.KInverted = K.inv();
      this.focalDistance = K.at(0,0);
      this.extractor = new Extractor(K);
      this.pose = new cv.Mat([[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]], cv.CV_8U);

    }

    extract(image: Mat): {rotationTranslationMatrix: Mat, matches: TupleKeyPoints[]} {
        return this.extractor.extract(image)
    }

    denormalize(point: Point2): Point2 {
      return this.extractor.denormalize(point);
    }
}