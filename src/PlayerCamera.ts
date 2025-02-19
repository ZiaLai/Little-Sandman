import {ArcRotateCamera, Ray, Scene, TransformNode, UniversalCamera, Vector3} from "@babylonjs/core";
import {Player} from "./Player";
import {Lerp} from "@babylonjs/core/Maths/math.scalar.functions";
import {CameraRadiusFunction} from "./Functions/CameraRadiusFunction";

export class PlayerCamera {
    private _camRoot: TransformNode;
    private _radius: number;
    private _originalCameraRadius: number;
    private _scene;
    private _camera;


    private _player: Player;
    private _cameraRadiusFunction: CameraRadiusFunction;


     constructor(player: Player, scene: Scene, canvas: HTMLCanvasElement) {
        this._player = player;
        this._scene = scene;
        this._cameraRadiusFunction = new CameraRadiusFunction();
        this._setup(canvas);
    }

    private _setup(canvas: HTMLCanvasElement): ArcRotateCamera {
        // TransformNode permettant de positionner la camera
        console.log("set up camera")
        this._camRoot = new TransformNode("root");
        this._camRoot.position = new Vector3(0, 0, 0);
        // To face the player from behind (180 degrees)
        this._camRoot.rotation = new Vector3(0, Math.PI, 0);

        // rotations along the x-axis (up/down tilting)
        // let yTilt = new TransformNode("ytilt");
        // adjustments to camera view to point down at our player
        // yTilt.rotation = Player.ORIGINAL_TILT;
        // this._yTilt = yTilt;
        // yTilt.parent = this._camRoot;

        // Propriétés de la camera
        let radius = 12;
        this._originalCameraRadius = radius;
        this._camera = new ArcRotateCamera("cam", 0, 0, radius, new Vector3(0, 0, 0), this._scene);
        this._camera.lowerRadiusLimit = 0.5;
        this._camera.upperRadiusLimit = radius;

        this._scene.activeCamera = this._camera;

        this._camera.lockedTarget = this._camRoot;
        //this.camera.lockedTarget = this._camRoot.position;
        this._camera.fov = 0.47350045992678597;
        this._camera.upperBetaLimit = 3*Math.PI / 4 //Math.PI / 2 + 0.2; // Pour pas que la cam passe dans le sol (faire +0.1 pour remonter la limite)
        //this.camera.parent = yTilt;
        // this.camera.checkCollision = true;
        // this.camera.collisionRadius = new Vector3(10, 10, 10);
        //this.camera.zoomToMouseLocation = true;
        this._camera.panningSensibility = 0;
        this._camera.inertia = 0.54;

        this._camera.inputs.removeByType("ArcRotateCameraMouseWheelInput");
        //this.camera.wheelPrecision = 100;


        this._camera.attachControl(canvas, true);


        return this._camera;

    }

    // Misa à jour de la camera
    private _updatePosition(): void {
        let x = this._player.mesh.position.x;
        let y = this._player.lastGroundPos.y; // Dernière position sur le sol en y, car la caméra reste fixe si on saute
        let z = this._player.mesh.position.z;


        // Position vers laquelle se dirige la camera
        let targetPosition: Vector3 = new Vector3(x, y + 3, z);

        let step: number = 0.1;

        if (this._player.mesh.position.y - this._player.lastGroundPos.y < 0) { // Le joueur chute
            // La caméra doit suivre la position du mesh
            // On lerp uniquement sur les y
            this._camRoot.position = new Vector3(this._player.mesh.position.x, Lerp(this._camRoot.position.y, this._player.mesh.position.y, step), this._player.mesh.position.z);
        } else {
            // la caméra suit la targetPosition
            // On lerp aussi uniquement sur les y

            if (this._camera.beta >= 1.75) {
                this._camera.radius = this._cameraRadiusFunction.apply(this._camera.beta);
                //this.camera.radius = 30.43 - 11.1001 * this.camera.beta;//-11.1147 * this.camera.beta + 28.3241 //-11.5474 * this.camera.beta + 32.208;
                //this.camera.upperBetaLimit = Math.PI / 2 - 0.2;
            }
            else {

            }

            this._camRoot.position = new Vector3(targetPosition.x, Lerp(this._camRoot.position.y, targetPosition.y, step), targetPosition.z);

        }
        //this._yTilt = this.camera.beta;
        this._camRoot.rotation = this._camera.rotation;


        //console.log("cam beta : ", this.camera.beta, " radius : ", this.camera.radius);




        // if (this._currentInput == 1) {
        //     let previousRot = this.camera.rotation;
        //     let rotX = this._inputs[this._currentInput].camHorizontal;
        //     let rotY = this._inputs[this._currentInput].camVertical;
        //     let newRot = new Vector3(rotX, rotY, 0);
        //     this.camera.rotation = previousRot.addInPlace(newRot);
        // }
        //console.log("yTilt : " + this._yTilt);
        // this._camRoot.position = Vector3.Lerp(this._camRoot.position,
        //    new Vector3(this.mesh.position.x, this.mesh.position.y + 3, this.mesh.position.z), 0.4);

    }

    //  Permet de vérifier s'il y a un mur derrière la camera
    // Et de rapprocher la camera du player pour éviter qu'elle passe au travers du mur
    private _raycast() {

        // Raycast vers l'arrière
        let direction = this._camera.getForwardRay().direction.normalize().scale(-1);
        //direction.y = 0;
        let ray = new Ray(this._camRoot.position, direction, this._camera.radius);
        let hit = this._scene.pickWithRay(ray);
        // let rayHelper = new RayHelper(ray);
        // rayHelper.show(this.scene);
        // if (!hit.hit) {
        //     console.log("" + hit + this._deltaTime);
        // }

        if (hit.hit && this._camera.beta < 1.75) {
            let distance = Vector3.Distance(this._camRoot.position, hit.pickedPoint);
            //console.log("distance : ", distance);
            this._camera.radius = Lerp(this._camera.radius, Math.max(Math.ceil(distance), this._camera.lowerRadiusLimit), 0.5);
        } else {
            this._camera.radius = Lerp(this._camera.radius, 15, 0.1);
        }
    }

    public update(): void {
        this._updatePosition();
        this._raycast();
    }

    public activate(): ArcRotateCamera {
        console.log("activating camera")
        this._scene.registerBeforeRender(() => {
            //console.log(this._player.mesh.position);
            this._player.beforeRenderUpdate();
            this.update();

        })


        return this._camera;
    }

    getAlpha() {
        return this._camera.alpha;
    }
}