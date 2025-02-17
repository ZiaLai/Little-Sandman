import {CameraRadiusFunction} from "../Functions/CameraRadiusFunction";
import {Assertion} from "./Assertion";

export class CameraRadiusFunctionTest {
    private testFunction = new CameraRadiusFunction();

    public test(): void {
        Assertion.assert(this.testFunction.apply(1.75) === 12, "0");
        Assertion.assert(this.testFunction.apply(1.9) === 9.6, "1");
        Assertion.assert(this.testFunction.apply(2.13) === 6.39, "2");

        console.log(this.testFunction.apply(1.8))
        Assertion.assert(this.testFunction.apply(1.8) === 11.2, "3");
        Assertion.assert(7.75 < this.testFunction.apply(2) && this.testFunction.apply(2) < 7.76, "4");
    }

}