import {Vector3} from "@babylonjs/core";

export class SpawnData {
    public readonly position: Vector3;
    public readonly direction: Vector3;
    public readonly alpha: number;

    public static DEFAULT_VALUE: SpawnData = new SpawnData(new Vector3(0, 3, 0), new Vector3(0, 0, 0), 0);

    constructor(position: Vector3, direction: Vector3, alpha: number) {
        this.position = position;
        this.direction = direction;
        this.alpha = alpha;
    }
}