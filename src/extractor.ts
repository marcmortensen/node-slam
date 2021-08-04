import * as cv from 'opencv4nodejs';
import { KeyPoint, ORBDetector } from 'opencv4nodejs';

class Extractor {

    orb: ORBDetector;
    lastDescriptors: cv.Mat;
  
    constructor() {
        
      this.orb = new ORBDetector();  
      this.lastDescriptors = null;
    }
  
    extract(frame: cv.Mat): {keyPoints: cv.KeyPoint[], descriptors: cv.Mat, matches: cv.DescriptorMatch[]} {

        if (frame.empty) {
            return null;
        }    
        // Detection
        const featurePoints = cv.goodFeaturesToTrack(frame.bgrToGray(),3000,0.01,3);
        const keyPoints = featurePoints.map((fp)=> new KeyPoint(fp,20,0,0,0,0))
    
        // Extraction
        const descriptors = this.orb.compute(frame, keyPoints);
    
        // Matching
        const matches = this.lastDescriptors!= null ? cv.matchBruteForce(this.lastDescriptors, descriptors) : []
            
        this.lastDescriptors = descriptors;
        return {keyPoints, descriptors, matches}
  }
}
export {Extractor};
