import * as cv from 'opencv4nodejs';
import { ORBDetector, Point2 } from 'opencv4nodejs';

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
  
    constructor(K: cv.Mat) {
        
      this.orb = new ORBDetector(3000);  
      this.lastDescriptors = null;
      this.lastKeypoints = null;
      this.KInverted = K.inv();
      this.K = K;
      
    }
  
    extract(frame: cv.Mat): {keyPoints: cv.KeyPoint[], descriptors: cv.Mat, matches: TupleKeyPoints[]} {

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
        if (this.lastDescriptors!= null) {
          const bruteForceMatches = cv.matchKnnBruteForceHamming(descriptors,this.lastDescriptors, 2);

          
          bruteForceMatches.forEach((elem) => {
            const match = elem[0];
            const n = elem[1];
            if (match.distance < 0.75*n.distance) {
              matches.push({pt1: keyPoints[match.queryIdx].pt, pt2: this.lastKeypoints[match.trainIdx].pt})//match);//{pt1: keyPoints[match.queryIdx].pt, pt2: this.lastKeypoints[match.trainIdx].pt})
              //console.log(`PX: x -> ${keyPoints[match.queryIdx].pt.x}, x2-> ${this.lastKeypoints[match.trainIdx].pt.x}`);
              //console.log(`PY: y -> ${keyPoints[match.queryIdx].pt.y}, y2-> ${this.lastKeypoints[match.trainIdx].pt.y}`);
            }
            
          })



          // Filter fundamental matrix

          if(bruteForceMatches.length> 0)  {
            // Normalize coords
            const p1 = matches.map((p) => this.normalise(p.pt1));
            const p2 = matches.map((p) => this.normalise(p.pt2));
            const {mask} = cv.findFundamentalMat(p1, p2,cv.FM_RANSAC, 1, 0.99);
            
            matches = mask.getDataAsArray()
            .map((elem, index) => 
              elem[0]?  matches[index] : null
            ).filter((e) => e!==null)
          }

        }
        this.lastDescriptors = descriptors;
        this.lastKeypoints = keyPoints;
        console.log(`nMatches: ${matches.length}`);
        return {keyPoints, descriptors, matches}
      }
      catch(e) {
        console.error(e);
        process.exit(1);
      }
    }

    normalise(unnormalisedPoint: cv.Point2): cv.Point2 { 
      const unnormalisedMatrix = new cv.Mat([[unnormalisedPoint.x, 0 ,0], [0,unnormalisedPoint.y,0],[0,0,1]], cv.CV_32F);
      const unnormalisedTransposed = unnormalisedMatrix.transpose();
      const res = 
        this.KInverted.matMul(unnormalisedTransposed).transpose().getDataAsArray();
      return new Point2(res[0][0], res[1][1]);
    }

    denormalise (normalizedPoint: cv.Point2): cv.Point2 {
      const normalisedMatrix= new cv.Mat([[normalizedPoint.x, 0 ,0], [0,normalizedPoint.y,0],[0,0,1]], cv.CV_32F);

      const res = this.K.matMul(normalisedMatrix).getDataAsArray();
      return new Point2(res[0][0], res[1][1]);
    }

}
export {Extractor};
