import {AbstractMesh, Nullable, PickWithRay, Ray, RayHelper, Scene, Vector3} from "@babylonjs/core";

export class ShootingSystem {
    private _isShooting: boolean;
    private _shootingRayHelper: RayHelper;

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

    public getMeshFromShooting(scene: Scene, position: Vector3, direction: Vector3): Nullable<AbstractMesh> {
        if (this._shootingRayHelper != null) {
            this._shootingRayHelper.hide();
        }
        let shootingRay = new Ray(position, direction, 2);
        this._shootingRayHelper = new RayHelper(shootingRay);
        this._shootingRayHelper.show(scene);
        let pickingInfo = PickWithRay(scene, shootingRay);
        if (pickingInfo != null) {
            console.log(pickingInfo.pickedMesh);
            if (pickingInfo.pickedMesh != null) {
                console.log(pickingInfo.pickedMesh);
            }
            return pickingInfo.pickedMesh;
        }
        return null;
    }

    public isShooting(): boolean {
        return this._isShooting;
    }
}
