import {Lerp} from "@babylonjs/core/Maths/math.scalar.functions";
import {MyFunction} from "./MyFunction";

export class CameraRadiusFunction implements MyFunction {
    private betaValues = [1.75, 1.9, 1.91, 1.93, 1.94, 1.95, 1.96, 1.99, 2.02, 2.07, 2.13, 2.20, 2.23, 2.33, 2.35];
    // Valeurs maximales du radius pour chaque beta
    private radiusValues = [12, 9.6, 9.39, 9.08, 8.87, 8.61, 8.36, 7.93, 7.4, 6.93, 6.39, 5.87, 5.50, 5.12, 5.07];

    apply(x: number): number {
        if (this.betaValues.includes(x)) {
            return this.radiusValues[this.betaValues.indexOf(x)];
        }
        if (x > 2.35) {
            return 5;
        }

        let startEnd= this.findStartEnd(x);

        let start = startEnd[0];
        let end = startEnd[1];

        // longueur de start à x divisée par la longueur de start à end (sur les betas)
        let stepPercentage = Math.abs(this.betaValues[start] - x) / Math.abs(this.betaValues[end] - this.betaValues[start]);

        let radiusStep = Math.abs(this.radiusValues[end] - this.radiusValues[start]) * stepPercentage;
        return this.radiusValues[start] - radiusStep;
    }

    // Renvoie les indices dans lesquels x est compris
    private findStartEnd(x: number): number[] {
        let start = 0;
        let end = this.betaValues.length - 1;
        while (start <= end) {
            let m = Math.floor((start + end) / 2);
            if (x < this.betaValues[m]) {
                end = m - 1;
            }
            else if (x > this.betaValues[m]) {
                start = m + 1;
            }
            else {
                return [end, start];
            }
        }
        return [end, start];

    }
}