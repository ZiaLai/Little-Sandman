import {TransformNodeGameObject} from "./TransformNodeGameObject";
import {MeshGameObject} from "./MeshGameObject";
import {Vector3} from "@babylonjs/core";
import {Force} from "../Force";
import {ForceHandler} from "./ForceHandler";

export class Conveyor extends MeshGameObject {
    private _force: Force;

    constructor(forceDirection: Vector3, ...args: ConstructorParameters<typeof MeshGameObject>) {
        super(...args);

        this._force = new Force(forceDirection.scale(6), this);

    }

    update(): void {
        ForceHandler.handleMovement(this, this._force);


    }
}