import {Vector3} from "@babylonjs/core";

export class SpawnData {
    public readonly position: Vector3;
    public readonly direction: Vector3;
    public readonly alpha: number;

    constructor(position: Vector3, direction: Vector3, alpha: number) {
        this.position = position;
        this.direction = direction;
        this.alpha = alpha;
    }
}