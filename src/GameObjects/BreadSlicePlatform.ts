import {GameObject} from "./GameObject";
import {Constructor, Mesh, Quaternion, Tools, Vector3} from "@babylonjs/core";
import {Game} from "../game";

export class BreadSlicePlatform extends GameObject {
    private _states = ["rotating", "moving"];
    private _currentState = "rotating";
    private _speed: Vector3 = new Vector3(-1.5, 0, 0);
    private _rotationSpeed: number = 0.5;

    constructor(...args: ConstructorParameters<typeof GameObject>) {
        super(...args);
        // this._mesh.rotationQuaternion = new Quaternion(0, 0, 0, 0);
        // this._mesh.rotate(new Vector3(0, 1, 0), 90);

        // this._mesh.rotation.y = Tools.ToRadians(90);
        this._mesh.rotationQuaternion = Quaternion.FromEulerAngles(0, Tools.ToRadians(90), 0);
        // for (let child of this._mesh.getChildMeshes()) {
        //     child.checkCollisions = true;
        // }
    }




    update(): void {
        //console.log("breadSlice update, position", this._mesh.position);
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
        // let rotation = Quaternion.FromEulerAngles(this._mesh.rotationQuaternion.toEulerAngles().x + this._rotationSpeed * this._game.getPlayer().getDeltaTime(), 0, 0);
        // this._mesh.rotationQuaternion = rotation;
        this._mesh.rotate(new Vector3(-1, 0, 0), this._rotationSpeed * this._game.getPlayer().getDeltaTime());

        // La rotation en x descend jusqu'à -90, puis elle remonte. Elle ne dépasse jamais 90

        if (this._mesh.rotationQuaternion.toEulerAngles().x <= (Tools.ToRadians(-90) + this._rotationSpeed * this._game.getPlayer().getDeltaTime()) ) {
            this._currentState = "moving";
            this._mesh.rotationQuaternion = Quaternion.FromEulerAngles(- Math.PI / 2, Math.PI / 2, 0);
        }

        // this._mesh.rotation.x -= this._rotationSpeed * this._game.getPlayer().getDeltaTime();
        // if (this._mesh.rotation.x <= Tools.ToRadians(270)) {
        //     this._currentState = "moving";
        //     this._mesh.rotation.x = Tools.ToRadians(270);
        // }
        console.log("bread slice rotation.x", Tools.ToDegrees(this._mesh.rotationQuaternion.toEulerAngles().x));
    }
}