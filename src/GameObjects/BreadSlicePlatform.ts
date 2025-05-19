import {GameObject} from "./GameObject";
import {Mesh, Quaternion, Tools, Vector3} from "@babylonjs/core";
import {Game} from "../game";

enum BreadState {SPAWNING, WAITING_FOR_CUT, ROTATING, MOVING}

export class BreadSlicePlatform extends GameObject {
    // private _states = ["rotating", "moving"];
    private _currentState: BreadState = BreadState.SPAWNING;
    private _speed: Vector3 = new Vector3(-3, 0, 0);
    private _rotationSpeed: number = 0.5;

    private _timer: number;

    constructor(...args: ConstructorParameters<typeof GameObject>) {
        super(...args);

        this._parentNode.rotationQuaternion = Quaternion.FromEulerAngles(0, Tools.ToRadians(-90), Tools.ToRadians(180));

        // this._parentNode.rotationQuaternion = null;
        //
        // this._parentNode.rotation = new Vector3(Tools.ToRadians(180), Tools.ToRadians(90), 0);



    }

    update(): void {
        //console.log("updating breadslice, state", this._currentState, Tools.ToDegrees(this._parentNode.rotationQuaternion.toEulerAngles().x));
        switch(this._currentState) {
            case BreadState.SPAWNING:
                console.log("SPAWNING", this._parentNode.position);
                this._move();
                if (this._parentNode.position.x <=  19.02) {
                    this._parentNode.position.x = 19.02
                    this._currentState = BreadState.WAITING_FOR_CUT;
                    this._timer = 0;
                }
                break;
            case BreadState.WAITING_FOR_CUT:
                this._timer += this._game.getDeltaTime();
                if (this._timer > 0.5) {
                    this._currentState = BreadState.ROTATING;
                    this._timer = 0;
                }
                break;
            case BreadState.ROTATING:
                this._rotate();
                break;
            case BreadState.MOVING:
                this._move();
                if (this._detectPlayerFeet()) console.log("touching player", this._game.getPlayer().getDeltaTime());
                if (this._parentNode.position.x <= -65) this.destroy();

                //console.log("bread slice pos", this._parentNode.position);
                break;

        }

    }

    private _detectPlayerFeet(): boolean {
        let ray = this._game.getPlayer().getFloorRay();

        let result = this._game.getScene().pickWithRay(ray, (mesh) => this._meshes.includes(mesh as Mesh));
        //let result = ray.intersectsMesh(this._mesh)
        //console.log("pick result", result);
        return ray.intersectsMesh(this._meshes[0]).hit || ray.intersectsMesh(this._meshes[1]).hit;

    }

    private _move() {
        this._parentNode.position.addInPlace(this._speed.scale(this._game.getDeltaTime()));
    }

    private _rotate() {
        this._parentNode.position.addInPlace(this._speed.scale(this._game.getPlayer().getDeltaTime()));
        this._parentNode.position.addInPlace(new Vector3(0, -1 * this._game.getPlayer().getDeltaTime(), 0));

        this._parentNode.rotate(new Vector3(-1, 0, 0), this._rotationSpeed * this._game.getPlayer().getDeltaTime());

        // La rotation en x descend jusqu'à -90, puis elle remonte. Elle ne dépasse jamais 90

        //if (this._parentNode.rotationQuaternion.toEulerAngles().x >= (Tools.ToRadians(-90) + this._rotationSpeed * this._game.getPlayer().getDeltaTime()) ) {
        if (Math.abs(this._parentNode.rotationQuaternion.toEulerAngles().x - Tools.ToRadians(90)) < 0.01) {
            this._currentState = BreadState.MOVING;
            this._parentNode.rotationQuaternion = Quaternion.FromEulerAngles(Tools.ToRadians(90), Tools.ToRadians(90), 0);
        }
        //console.log("bread slice rotation.x", Tools.ToDegrees(this._parentNode.rotationQuaternion.toEulerAngles().x));

    }
}