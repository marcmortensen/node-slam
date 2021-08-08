import * as cv from 'opencv4nodejs';
import { Mat, Point2 } from 'opencv4nodejs';
import { Extractor, TupleKeyPoints } from './extractor';

export class Frame {

    pose: cv.Mat;
    extractor: Extractor;
    rotationTranslationMatrix: Mat;
    matches: TupleKeyPoints[];
  
    constructor(image: Mat, extractor: Extractor) {
        
      this.extractor = extractor;
      this.pose = new cv.Mat([[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]], cv.CV_32F);

      const data = this.extractor.extract(image);

      this.rotationTranslationMatrix = data.rotationTranslationMatrix;
      this.matches = data.matches;

    }

    denormalize(point: Point2): Point2 {
      return this.extractor.denormalize(point);
    }
}