import {AbstractMesh, Nullable, PickWithRay, Ray, RayHelper, Scene, Vector3} from "@babylonjs/core";

export class ShootingSystem {
    private _isShooting: boolean;
    private _shootingRay: Ray;
    private _isInteracting = false;

    constructor() {
        this._isShooting = false;
        console.log("Shooting system created");
    }

    public registerPointerEvent(scene : Scene): void {
        let left = 0;
        let right = 2;
        scene.onPointerDown = (e) => {
            if (e.button === left) {
                this._isShooting = true;
            }
            if (e.button === right) {

            }
        }
        scene.onPointerUp = (e) => {
            if (e.button === left) {
                this._isShooting = false;
            }
            if (e.button === right) {

            }
        }
    }

    public getRayFromShooting(scene: Scene, position: Vector3, direction: Vector3): void {
        if (this._isShooting) {
            this._shootingRay = new Ray(position, direction, 2);
            let rayHelper = new RayHelper(this._shootingRay);
            rayHelper.show(scene);
        }
        else {
            this._shootingRay = null;
        }
    }

    public isShooting(): boolean {
        return this._isShooting;
    }

    public getShootingRay(): Ray {
        return this._shootingRay;
    }

    public isInteracting(): boolean {
        return this._isInteracting;
    }

    public setIsInteracting(isInteracting: boolean): void {
        this._isInteracting = isInteracting;
    }
}
