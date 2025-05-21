import {Vector3} from "@babylonjs/core";

export class Force {
    public readonly vector: Vector3;
    public readonly owner: any;

    constructor(vector: Vector3, owner: any) {
        this.vector = vector;
        this.owner = owner;
    }
}