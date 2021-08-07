import * as cv from 'opencv4nodejs';
import { ORBDetector, Point2 } from 'opencv4nodejs';
import {SCREEN_WIDTH, SCREEN_HEIGHT} from './main'
export interface TupleKeyPoints {
  pt1: cv.Point2;
  pt2: cv.Point2;
}


class Extractor {

    orb: ORBDetector;
    lastDescriptors: cv.Mat;
    lastKeypoints: cv.KeyPoint[];
    K: cv.Mat;
    KInverted: cv.Mat;
    focalDistance : number;
  
    constructor(K: cv.Mat) {
        
      this.orb = new ORBDetector(3000);  
      this.lastDescriptors = null;
      this.lastKeypoints = null;
      this.K = K;
      this.KInverted = K.inv();
      this.focalDistance = K.at(0,0);
    }
  
    extract(frame: cv.Mat): {RtMatrix: cv.Mat, matches: TupleKeyPoints[]} {

        if (frame.empty) {
            return null;
        }    
        try {
        // Detection
        const keyPoints = this.orb.detect(frame);
    
        // Extraction
        const descriptors = this.orb.compute(frame, keyPoints);
    
        // Matching
        let matches: TupleKeyPoints[] = [];
        let RtMatrix: cv.Mat = null;
        if (this.lastDescriptors!= null) {
          const bruteForceMatches = cv.matchKnnBruteForceHamming(descriptors,this.lastDescriptors, 2);
          
          bruteForceMatches.forEach((elem) => {
            const match = elem[0];
            const n = elem[1];
            if (match.distance < 0.75*n.distance) {
              matches.push({
                // Normalize coords
                pt1: this.normalise(keyPoints[match.queryIdx].pt),
                pt2: this.normalise(this.lastKeypoints[match.trainIdx].pt)
              })
            }
          })

          // Filter fundamental matrix
          if(bruteForceMatches.length> 0)  {
            const p1 = matches.map((p) => p.pt1);
            const p2 = matches.map((p) => p.pt2);
            const center = new Point2(SCREEN_WIDTH/2,SCREEN_HEIGHT/2);
            
            const {E,mask} = cv.findEssentialMat(p1, p2, this.focalDistance, center, cv.FM_RANSAC, 0.99,0.005);
            const res = cv.recoverPose(E,p1,p2,this.focalDistance, center);

            RtMatrix= res.R;
            
            matches = mask.getDataAsArray()
            .map((elem, index) => 
              elem[0]?  matches[index] : null
            ).filter((e) => e!==null)
          }

        }
        this.lastDescriptors = descriptors;
        this.lastKeypoints = keyPoints;
        console.log(`nMatches: ${matches.length}`);
        return {RtMatrix, matches}
      }
      catch(e) {
        console.error(e);
        process.exit(1);
      }
    }

    normalise(unnormalisedPoint: cv.Point2): cv.Point2 { 

      // [1,0,x]
      // [0,1,y]
      // [0,0,1]]

      const unnormalisedMatrix = new cv.Mat([[1, 0, unnormalisedPoint.x], [0, 1, unnormalisedPoint.y],[0,0,1]], cv.CV_32F);
      const res = 
        this.KInverted.matMul(unnormalisedMatrix).getDataAsArray();
      return new Point2(res[0][2], res[1][2]);
    }

    denormalise (normalizedPoint: cv.Point2): cv.Point2 {
      const normalisedMatrix= new cv.Mat([[1, 0, normalizedPoint.x], [0, 1, normalizedPoint.y],[0,0,1]], cv.CV_32F);

      const res = this.K.matMul(normalisedMatrix).getDataAsArray();
      return new Point2(res[0][2], res[1][2]);
    }

}
export {Extractor};
