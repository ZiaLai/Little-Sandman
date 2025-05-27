import {Ray, Scene, Vector3} from "@babylonjs/core";

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

    public getRayFromShooting(scene: Scene, position: Vector3, direction: Vector3, playerShootingAnimationPlaying: boolean): void {
        const rayPosition = new Vector3(position.x, position.y + 1.2, position.z);

        if (this._isShooting && playerShootingAnimationPlaying) {
            this._shootingRay = new Ray(rayPosition, direction, 3);
            // const rayHelper = new RayHelper(this._shootingRay);
            // rayHelper.show(scene);
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
