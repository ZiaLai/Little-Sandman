import {Lerp} from "@babylonjs/core/Maths/math.scalar.functions";
import {MyFunction} from "./MyFunction";

export class CameraRadiusFunction implements MyFunction {
    private betaValues = [0.01, 1.3, 1.75, 1.81, 1.9, 2.02, 2.35];
    // Valeurs maximales du radius pour chaque beta
    private radiusValues = [20, 15.8, 10, 7, 6.12,  4.82, 3];
    private _minimalRadius = 3;

    apply(x: number): number {
        if (this.betaValues.includes(x)) {
            return this.radiusValues[this.betaValues.indexOf(x)];
        }
        if (x > 2.35) {
            return this._minimalRadius;
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