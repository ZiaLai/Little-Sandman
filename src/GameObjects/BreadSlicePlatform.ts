import {GameObject} from "./GameObject";
import {Vector3} from "@babylonjs/core";
import {Game} from "../game";

export class BreadSlicePlatform extends GameObject {
    private _states = ["rotating", "moving"];
    private _currentState = "rotating";
    private _speed: Vector3 = new Vector3(-1.5, 0, 0);
    private _rotationSpeed: number = 0.2;




    update(): void {
        console.log("breadSlice update, mesh ", this._mesh);
        switch(this._currentState) {
            case "moving":
                this._move();
                break;
            case "rotating":
                this._rotate();
                break;
        }

    }

    private _move() {
        this._mesh.position.addInPlace(this._speed.scale(this._game.getPlayer().getDeltaTime()));
    }

    private _rotate() {
        this._mesh.rotation.x += this._rotationSpeed * this._game.getPlayer().getDeltaTime();
        console.log("bread rotation", this._mesh.rotation.x);
    }
}