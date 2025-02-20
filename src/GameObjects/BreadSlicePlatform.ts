import {GameObject} from "./GameObject";
import {Vector3} from "@babylonjs/core";

export class BreadSlicePlatform extends GameObject {
    private _states = ["rotating", "moving"];
    private _currentState = "moving";
    private _speed: Vector3 = new Vector3(0, 0, 0.5);


    update(): void {
        if (this._currentState === "moving") {
            this._move();
        }
    }

    private _move() {
        this._mesh.position.addInPlace(this._speed.scale(this._game.getPlayer().getDeltaTime()));
    }
}