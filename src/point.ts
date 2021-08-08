import { Frame } from './frame';
import { Map } from './map';

export interface Point3dIntefiable {
  xyz: number[];
  idx1: number;
  idx2: number;
}

export class Point {

    id: number;
    frames: Frame[];
    idxs: number[];
    x: number;
    y: number;
    z: number;
  
    constructor(location: number[], map: Map) {
        
      this.frames = [];
      this.idxs = [];
      this.x = location[0];
      this.y = location[1];
      this.z = location[2];

      this.id = map.points.length
      map.points.push(this)
    }

    addObservation(frame: Frame, idx: number): void {
      this.frames.push(frame);
      this.idxs.push(idx);
    }

}

