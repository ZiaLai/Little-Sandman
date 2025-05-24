import {
    ArcRotateCamera,
    Ray,
    Scene,
    TransformNode,
    Vector3
} from "@babylonjs/core";
import { Player } from "./Player";
import { Lerp } from "@babylonjs/core/Maths/math.scalar.functions";
import { CameraRadiusFunction } from "./Functions/CameraRadiusFunction";
import { ShootingSystem } from "./ShootingSystem";

export class PlayerCamera {
    private _camRoot: TransformNode;
    private _radius: number;
    private _originalCameraRadius: number;
    private _scene;
    private _camera;
    private _player: Player;
    private _cameraRadiusFunction: CameraRadiusFunction;
    private _raycastCollision: boolean = false;
    private _groundDetectionRadius: number;
    private _raycastRadius: number;
    private _smoothRadius: number = 20;
    private _isActive: boolean = true;
    private _canvas: HTMLCanvasElement;

    constructor(player: Player, scene: Scene, canvas: HTMLCanvasElement) {
        this._player = player;
        this._scene = scene;
        this._cameraRadiusFunction = new CameraRadiusFunction();
        this._setup(canvas);
    }

    private _setup(canvas: HTMLCanvasElement): ArcRotateCamera {
        this._camRoot = new TransformNode("root");
        this._camRoot.position = new Vector3(0, 0, 0);
        this._camRoot.rotation = new Vector3(0, Math.PI, 0);

        const radius = 20;
        this._originalCameraRadius = radius;
        this._camera = new ArcRotateCamera("cam", 0, 0, radius, new Vector3(0, 0, 0), this._scene);
        this._camera.lowerRadiusLimit = 0.5;
        this._camera.upperRadiusLimit = radius;

        this._scene.activeCamera = this._camera;
        this._camera.lockedTarget = this._camRoot;
        this._camera.fov = 0.4735;
        this._camera.upperBetaLimit = 3 * Math.PI / 4;
        this._camera.panningSensibility = 0;
        this._camera.inertia = 0.54;
        this._camera.wheelPrecision = 25;
        this._camera.alpha = 1.6;
        this._camera.beta = 1.4;
        this._camera.attachControl(canvas, true);

        this._canvas = canvas;


        return this._camera;
    }

    public update(): void {
        if (!this._isActive) return;

        this._updateCamRootPosition();
        this._adjustRadiusForWallCollision();
        this._adjustRadiusForGroundClipping();
        //this._adjustForCeiling();

        this._smoothRadius = Lerp(this._camera.radius, Math.min(this._raycastRadius, this._groundDetectionRadius), 0.15);
        this._camera.radius = this._smoothRadius;
    }


    private _updateCamRootPosition(): void {
        const meshPos = this._player.mesh.position;
        const targetY = meshPos.y;
        const currentY = this._camRoot.position.y;

        const upwardStep = 0.1;
        const downwardStep = 0.05;

        const goingUp = targetY > currentY + 0.1;
        const goingDown = targetY < currentY - 0.1;

        let newY = currentY;

        if (goingUp) {
            newY = Lerp(currentY, targetY + 2, upwardStep);
        } else if (goingDown) {
            newY = Lerp(currentY, targetY + 2, downwardStep);
        } else {
            newY = Lerp(currentY, targetY + 2, 0.08);
        }

        this._camRoot.position = new Vector3(meshPos.x, newY, meshPos.z);
        this._camRoot.rotation = this._camera.rotation;

        this._groundDetectionRadius = this._cameraRadiusFunction.apply(this._camera.beta);
    }


    private _adjustRadiusForWallCollision(): void {
        const playerHead = this._player.mesh.position.add(new Vector3(0, 1.5, 0)); // vise la tête du joueur
        const cameraPos = this._camera.position;

        const direction = cameraPos.subtract(playerHead).normalize();
        const distance = Vector3.Distance(cameraPos, playerHead);

        const ray = new Ray(playerHead, direction, distance);

        const hit = this._scene.pickWithRay(ray, m => m.isPickable && m.isEnabled());

        if (hit.hit && hit.pickedPoint) {
            const hitDistance = Vector3.Distance(playerHead, hit.pickedPoint);
            const safeRadius = Math.max(hitDistance - 0.3, this._camera.lowerRadiusLimit); // on laisse une marge
            this._raycastRadius = Lerp(this._camera.radius, safeRadius, 0.5);
        } else {
            this._raycastRadius = Lerp(this._camera.radius, 15, 0.05); // zoom out progressif s’il n’y a rien
        }
    }


    private _rotateAroundY(direction: Vector3, angle: number): Vector3 {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return new Vector3(
            direction.x * cos - direction.z * sin,
            direction.y,
            direction.x * sin + direction.z * cos
        ).normalize();
    }

    private _adjustRadiusForGroundClipping(): void {
        if (this._camera.beta < 2.6) return;

        const direction = this._camera.getForwardRay().direction.normalize();
        const cameraPosition = this._camera.getTarget().subtract(direction.scale(this._camera.radius));
        const downRay = new Ray(cameraPosition, Vector3.Down(), 5);

        const hit = this._scene.pickWithRay(downRay, m => m.isPickable && m.isEnabled());

        if (hit.hit && hit.distance < 0.5) {
            this._groundDetectionRadius = Math.max(this._camera.radius - 0.5, this._camera.lowerRadiusLimit);
        }
    }


    public activate(shootingSystem: ShootingSystem): ArcRotateCamera {
        this._scene.registerBeforeRender(() => {
            this._player.beforeRenderUpdate(shootingSystem);
            this.update();
        });

        return this._camera;
    }

    getAlpha() {
        return this._camera.alpha;
    }
    public getCamera(){
        return this._camera;
    }

    public disable(): void {
        this._camera.detachControl();
        this._isActive = false;
    }

    public getIsActive(): boolean {
        return this._isActive;
    }

    public enable(scene: Scene): void {
        this._camera.attachControl(this._canvas);
        this._isActive = true;

        scene.activeCamera = this._camera;
    }

    public setAlpha(alpha: number): void {
        this._camera.alpha = alpha;
    }

    private _adjustForCeiling(): void {
        const upward = new Vector3(0, 1, 0);
        const origin = this._camRoot.position.clone();
        const maxDistance = 3; // distance au-dessus de laquelle on tolère un plafond
        const ray = new Ray(origin, upward, maxDistance);

        const predicate = (mesh) => mesh.isPickable && mesh.isEnabled();
        const hit = this._scene.pickWithRay(ray, predicate);

        if (hit.hit && hit.pickedPoint) {
            const ceilingDistance = hit.pickedPoint.y - origin.y;
            if (ceilingDistance < maxDistance) {
                // rapproche la caméra du joueur
                const minRadius = 3.5;
                const lerpedRadius = Lerp(this._camera.radius, minRadius, 0.2);
                this._camera.radius = Math.max(lerpedRadius, this._camera.lowerRadiusLimit);
               // this._camera.radius = minRadius;
            }
        }
    }

}
