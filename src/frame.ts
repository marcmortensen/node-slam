import * as cv from 'opencv4nodejs';
import { Mat, Point2 } from 'opencv4nodejs';
import { Extractor, TupleKeyPoints } from './extractor';
import { Map } from './map';

export class Frame {

    id: number;
    pose: cv.Mat;
    extractor: Extractor;
    rotationTranslationMatrix: Mat;
    matches: TupleKeyPoints[];
  
    constructor(image: Mat, extractor: Extractor, map: Map) {
        
      this.id = map.frames.length;
      this.extractor = extractor;
      this.pose = new cv.Mat([[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]], cv.CV_32F);

      const data = this.extractor.extract(image);

      this.rotationTranslationMatrix = data.rotationTranslationMatrix;
      this.matches = data.matches;
      map.frames.push(this);

    }

    denormalize(point: Point2): Point2 {
      return this.extractor.denormalize(point);
    }
}