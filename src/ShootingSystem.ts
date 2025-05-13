import {AbstractMesh, Nullable, PickWithRay, Ray, RayHelper, Scene, Vector3} from "@babylonjs/core";

export class ShootingSystem {
    private _shootingRayHelper: RayHelper;

    constructor() {
        console.log("Shooting system created");
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
                console.log("null2");
                console.log(pickingInfo.pickedMesh);
            }
            return pickingInfo.pickedMesh;
        }
        return null;
    }
}
