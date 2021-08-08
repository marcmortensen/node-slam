import { Frame } from './frame';
import { Point } from './point';

export class Map {

    frames: Frame[];
    points: Point[];
  
    constructor() {
        
      this.frames = [];
      this.points = [];
    }

    display(): void {
        for (const frame of this.frames) {
            console.log(frame.id);
        }
    }

}

