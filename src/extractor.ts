import * as cv from 'opencv4nodejs';
import { Mat, ORBDetector, Point2 } from 'opencv4nodejs';
import {SCREEN_WIDTH, SCREEN_HEIGHT} from './main'
export interface TupleKeyPoints {
  pt1: cv.Point2;
  pt2: cv.Point2;
  idx1: number;
  idx2: number;
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
  
    extract(frame: cv.Mat): {rotationTranslationMatrix: cv.Mat, matches: TupleKeyPoints[]} {

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
        let rotationTranslationMatrix: cv.Mat = null;
        if (this.lastDescriptors!= null) {
          const bruteForceMatches = cv.matchKnnBruteForceHamming(descriptors,this.lastDescriptors, 2);
          
          bruteForceMatches.forEach((elem) => {
            const match = elem[0];
            const n = elem[1];
            if (match.distance < 0.75*n.distance) {
              matches.push({
                // Normalize coords && Keep around indices
                pt1: this.normalize(keyPoints[match.queryIdx].pt),
                pt2: this.normalize(this.lastKeypoints[match.trainIdx].pt),
                idx1: match.queryIdx,
                idx2: match.trainIdx
              })
            }
          })

          // Filter Essential matrix
          if(bruteForceMatches.length> 0)  {
            const p1 = matches.map((p) => p.pt1);
            const p2 = matches.map((p) => p.pt2);
            const center = new Point2(SCREEN_WIDTH/2,SCREEN_HEIGHT/2);
            
            const {E,mask} = cv.findEssentialMat(p1, p2, this.focalDistance, center, cv.FM_RANSAC, 0.99,0.005);
            const {R, T} = cv.recoverPose(E,p1,p2,this.focalDistance, center);
            const rotationArray = R.getDataAsArray();

            rotationTranslationMatrix = new Mat([
              [rotationArray[0][0],rotationArray[0][1],rotationArray[0][2], T.x],
              [rotationArray[1][0],rotationArray[1][1],rotationArray[1][2], T.y],
              [rotationArray[2][0],rotationArray[2][1],rotationArray[2][2], T.z]]
              , cv.CV_32F);

            matches = mask.getDataAsArray()
            .map((elem, index) => 
              elem[0] ?  matches[index] : null
            ).filter((e) => e!==null)
          }
        }
        this.lastDescriptors = descriptors;
        this.lastKeypoints = keyPoints;
        console.log(`nMatches: ${matches.length}`);
        return {rotationTranslationMatrix, matches}
    
      }
      catch(e) {
        console.error(e);
        process.exit(1);
      }
    }

    normalize(unnormalisedPoint: cv.Point2): cv.Point2 { 

      const unnormalisedMatrix = new cv.Mat([[1, 0, unnormalisedPoint.x], [0, 1, unnormalisedPoint.y],[0,0,1]], cv.CV_32F);
      const res = 
        this.KInverted.matMul(unnormalisedMatrix).getDataAsArray();
      return new Point2(res[0][2], res[1][2]);
    }

    denormalize (normalizedPoint: cv.Point2): cv.Point2 {
      const normalisedMatrix= new cv.Mat([[1, 0, normalizedPoint.x], [0, 1, normalizedPoint.y],[0,0,1]], cv.CV_32F);
      const res = this.K.matMul(normalisedMatrix).getDataAsArray();
      return new Point2(res[0][2], res[1][2]);
    }

}
export {Extractor};
