import {
    TransformNode,
    ShadowGenerator,
    Scene,
    Mesh,
    UniversalCamera,
    ArcRotateCamera,
    Vector3,
    Quaternion, Ray, Scalar, ArcFollowCamera, FollowCamera, ArcRotateCameraGamepadInput, RayHelper
} from "@babylonjs/core";
import {PlayerInput} from "./PlayerInput";
import {KeyboardInput} from "./KeyboardInput";
import {GamepadInput} from "./GamepadInput";
import "hammerjs";

export class Player extends TransformNode {
    public camera;
    public scene: Scene;
    private _inputs: PlayerInput[];
    private _currentInput: number = 0; // 0 = keyboard, 1 = gamepad
    private _canvas: HTMLCanvasElement;

    //Player
    public mesh: Mesh; //outer collisionbox of player

    // Camera
    private _camRoot: TransformNode;
    private _yTilt: TransformNode;

    // Constants
    private static readonly ORIGINAL_TILT: Vector3 = new Vector3(0.5934119456780721, 0, 0);
    private static PLAYER_SPEED: number = 15;
    private static GRAVITY: number = -50;
    private static JUMP_FORCE: number = 16.6;
    private static HOVER_TIME: number = 120; // Max duration of hovering (in frame)

    // player movement vars
    private _deltaTime: number = 0;
    private _h: number;
    private _v: number;

    private _moveDirection: Vector3 = new Vector3();
    private _inputAmt: number;

    //gravity, ground detection, jumping
    private _gravity: Vector3 = new Vector3();
    private _grounded: boolean;
    private _lastGroundPos: Vector3 = Vector3.Zero();
    private _maxJumpCount : number = 1;
    private _jumpCount: number = 1;
    private _canHover: boolean = false;
    private _hoverTimer: number = 0;
    private _hovering: boolean = false;
    private _verticalVelocity: number;
    private _horizontalVelocity: number;
    private _direction: Vector3 = Vector3.Zero();
    private _lastCollidedRay: Ray;


    constructor(assets, scene: Scene, canvas: HTMLCanvasElement, shadowGenerator: ShadowGenerator) {
        super("player", scene);
        this.scene = scene;
        this.scene.collisionsEnabled = true;
        this.mesh = assets.mesh;
        this.mesh.position.y = 10 // Temporairement, en attendant qu'il y ait une startPos dans la ville
        this.mesh.parent = this;

        this._setupPlayerCamera();
        this._canvas = canvas;

        this.scene.getLightByName("sparklight").parent = this.scene.getTransformNodeByName("Empty");

        shadowGenerator.addShadowCaster(assets.mesh); //the player mesh will cast shadows

        this._inputs = [new KeyboardInput(this.scene, this._canvas), new GamepadInput(this.scene)];
        this._inputs[this._currentInput].isActive = true;
        this._inputs[1 - this._currentInput].isActive = false;
    }


    private _setupPlayerCamera(): ArcRotateCamera { //Ancienne version
        //root camera parent that handles positioning of the camera to follow the player
        this._camRoot = new TransformNode("root");
        this._camRoot.position = new Vector3(0, 0, 0);
        // To face the player from behind (180 degrees)
        this._camRoot.rotation = new Vector3(0, Math.PI, 0);

        // rotations along the x-axis (up/down tilting)
        let yTilt = new TransformNode("ytilt");
        // adjustments to camera view to point down at our player
        yTilt.rotation = Player.ORIGINAL_TILT;
        this._yTilt = yTilt;
        yTilt.parent = this._camRoot;

        // our actual camera that's pointing at our root's position
        let radius = 12;
        this.camera = new ArcRotateCamera("cam", 0, 0, radius, new Vector3(0, 0, 0), this.scene);
        this.camera.lowerRadiusLimit = 3;
        this.camera.upperRadiusLimit = radius;
        

        this.scene.activeCamera = this.camera;

        this.camera.lockedTarget = this._camRoot;
        //this.camera.lockedTarget = this._camRoot.position;
        this.camera.fov = 0.47350045992678597;
        this.camera.upperBetaLimit = Math.PI / 2 + 0.2; // Pour pas que la cam passe dans le sol (faire +0.1 pour remonter la limite)
        //this.camera.parent = yTilt;
        // this.camera.checkCollision = true;
        // this.camera.collisionRadius = new Vector3(10, 10, 10);
        //this.camera.zoomToMouseLocation = true;
        this.camera.panningSensibility = 0;
        //this.camera.minZ = 14;


        this.camera.attachControl(this._canvas, true);
        if (this._currentInput == 1) {
            //this.camera.inputs.clear();
            //this.camera.inputs.removeByType("ArcRotateCameraPointersInput");
        }
        return this.camera;

    }

    private _updateCamera(): void {

        let x = this.mesh.position.x;
        let y = this._lastGroundPos.y;
        let z = this.mesh.position.z;
        //this.camera.minZ = (Math.cos(this.camera.beta - Math.PI / 2) * this.camera.radius) -0.1;
        //console.log(this.camera.minZ);
        let targetPosition = new Vector3(x, y + 3, z);
        //this._camRoot.position = new Vector3(x, y + 3, z);
        this._camRoot.position = new Vector3(targetPosition.x, Vector3.Lerp(this._camRoot.position, targetPosition, 0.1).y, targetPosition.z);
        this._yTilt = this.camera.beta;
        this._camRoot.rotation = this.camera.rotation;




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

    private _cameraRaycast() {

        // Raycast vers l'arrière
        let direction = this.camera.getForwardRay().direction.normalize().scale(-1);
        direction.y = 0;
        let ray = new Ray(this._camRoot.position, direction, this.camera.radius);
        let hit = this.scene.pickWithRay(ray);
        // let rayHelper = new RayHelper(ray);
        // rayHelper.show(this.scene);
        // if (!hit.hit) {
        //     console.log("" + hit + this._deltaTime);
        // }
        if (hit.hit) {
            let distance = Vector3.Distance(this._camRoot.position, hit.pickedPoint);
            this.camera.radius = Scalar.Lerp(this.camera.radius, Math.ceil(distance), 0.25);
        } else {
            this.camera.radius = Scalar.Lerp(this.camera.radius, 15, 0.1);
        }
    }

    public _updateFromControls(): void { // Nouvelle version en suivant le tuto
        this._deltaTime = this.scene.getEngine().getDeltaTime() / 1000.0;

        this._moveDirection = Vector3.Zero(); // vecteur du mouvement, qu'on recalcule à chaque frame
        this._h = this._inputs[this._currentInput].horizontal; // input sur l'axe des x
        this._v = this._inputs[this._currentInput].vertical; // input sur l'axe des z

        let fwd = new Vector3(Math.cos(this.camera.alpha + Math.PI), 0, Math.sin(this.camera.alpha + Math.PI));
        let right = new Vector3(Math.cos(this.camera.alpha + Math.PI / 2), 0, Math.sin(this.camera.alpha + Math.PI / 2));
        //console.log("camera direction : " + fwd);

        let correctedVertical = fwd.scaleInPlace(this._v);
        let correctedHorizontal = right.scaleInPlace(this._h);

        let move = correctedHorizontal.addInPlace(correctedVertical);

        this._moveDirection = new Vector3((move).normalize().x, 0, (move).normalize().z);
        if (!(this._moveDirection.equals(Vector3.Zero()))) {
            this._direction = this._moveDirection.clone();
        }


        let inputMag = Math.abs(this._h) + Math.abs(this._v);
        if (inputMag < 0) {
            this._inputAmt = 0;
        } else if (inputMag > 1) {
            this._inputAmt = 1;
        } else {
            this._inputAmt = inputMag;
        }
        //console.log("inputAmt : " + this._inputAmt);

        this._moveDirection = this._moveDirection.scaleInPlace(this._inputAmt * Player.PLAYER_SPEED * this._deltaTime);
        //console.log("vertical : " + this._input.vertical
        //            + ", input : " + this._input.inputMap["z"]);

        // Rotations
        // On vérifie s'il y a un mouvement pour déterminer si on a besoin de faire une rotation
        let input = new Vector3(this._inputs[this._currentInput].horizontalAxis, this._inputs[this._currentInput].verticalAxis);
        if (input.length() == 0) {
            return;
        }
        // rotation en fontion de l'input et de l'angle de la camera
        let angle = Math.atan2(this._inputs[this._currentInput].horizontalAxis, this._inputs[this._currentInput].verticalAxis) + Math.PI;
        //angle += (this.camera.alpha) % (2 * Math.PI);
        angle += - this.camera.alpha + Math.PI / 2;
        let targ = Quaternion.FromEulerAngles(0, angle, 0);
        this.mesh.rotationQuaternion = Quaternion.Slerp(this.mesh.rotationQuaternion, targ, 10 * this._deltaTime);


    }

    public activatePlayerCamera(): UniversalCamera {
        this.scene.registerBeforeRender(() => {

            this._beforeRenderUpdate();
            this._updateCamera();
            this._cameraRaycast();
        })
        return this.camera;
    }

    private _beforeRenderUpdate(): void {
        console.log("deltaTime : " + this._deltaTime);
        this._updateFromControls();
        this._updateGroundDetection();
    }

    private _floorRaycast(offsetx: number, offsetz: number, raycastlen: number): Vector3 {
        let raycastFloorPos = new Vector3(this.mesh.position.x + offsetx, this.mesh.position.y + 0.5,
            this.mesh.position.z + offsetz);
        let ray = new Ray(raycastFloorPos, Vector3.Up().scale(-1), raycastlen);

        let predicate = function (mesh) {
            return mesh.isPickable && mesh.isEnabled();
        }
        let pick = this.scene.pickWithRay(ray, predicate);

        if (pick.hit) {
            return pick.pickedPoint;
        } else {
            return Vector3.Zero();
        }
    }

    private _checkSlope(): boolean {

        // Vérifie uniquement les meshs pickable et enabled
        let predicate = function(mesh) {
            return mesh.isPickable && mesh.isEnabled();
        }

        // 4 raycasts
        let raycast = new Vector3(this.mesh.position.x, this.mesh.position.y + 0.5, this.mesh.position.z + .25);
        let ray = new Ray(raycast, Vector3.Up().scale(-1), 1.5);
        let pick = this.scene.pickWithRay(ray, predicate);

        let raycast2 = new Vector3(this.mesh.position.x, this.mesh.position.y + 0.5, this.mesh.position.z - .25);
        let ray2 = new Ray(raycast2, Vector3.Up().scale(-1), 1.5);
        let pick2 = this.scene.pickWithRay(ray2, predicate);

        let raycast3 = new Vector3(this.mesh.position.x + .25, this.mesh.position.y + 0.5, this.mesh.position.z);
        let ray3 = new Ray(raycast3, Vector3.Up().scale(-1), 1.5);
        let pick3 = this.scene.pickWithRay(ray3, predicate);

        let raycast4 = new Vector3(this.mesh.position.x - .25, this.mesh.position.y + 0.5, this.mesh.position.z);
        let ray4 = new Ray(raycast4, Vector3.Up().scale(-1), 1.5);
        let pick4 = this.scene.pickWithRay(ray4, predicate);

        if (pick.hit && !pick.getNormal().equals(Vector3.Up())) {
            if(pick.pickedMesh.name.includes("stair")) {
                return true;
            }
        } else if (pick2.hit && !pick2.getNormal().equals(Vector3.Up())) {
            if(pick2.pickedMesh.name.includes("stair")) {
                return true;
            }
        }
        else if (pick3.hit && !pick3.getNormal().equals(Vector3.Up())) {
            if(pick3.pickedMesh.name.includes("stair")) {
                return true;
            }
        }
        else if (pick4.hit && !pick4.getNormal().equals(Vector3.Up())) {
            if(pick4.pickedMesh.name.includes("stair")) {
                return true;
            }
        }
        return false;

    }

    private _isGrounded(): boolean {
        if (this._floorRaycast(0, 0, 0.6).equals(Vector3.Zero())) {
            return false;
        } else {
            return true;
        }
    }

    private _updateGroundDetection(): void {
        if (!this._isGrounded()) {
            // Vérifie si on est sur une pente
            if (this._checkSlope() && this._gravity.y <= 0) {
                this._gravity.y = 0;
                this._jumpCount = 1;
                this._grounded = true;
            }

            else if (!this._hovering) {
                this._gravity = this._gravity.addInPlace(Vector3.Up().scale(this._deltaTime * Player.GRAVITY));
                this._grounded = false;
            } else {
                this._gravity.y = Scalar.Lerp(this._gravity.y, 0, 0.2);
            }
        }

        // limit the speed of gravity to the negative of the jump power
        if (this._gravity.y < -Player.JUMP_FORCE) {
            this._gravity.y = -Player.JUMP_FORCE;
        }

        let moveVector = this._moveDirection;
        // moveVector.x *= this._horizontalVelocity;
        // moveVector.z *= this._verticalVelocity;
        moveVector = moveVector.addInPlace(this._gravity.scale(this._deltaTime));
        this.mesh.moveWithCollisions(moveVector);

        //console.log("moveVector : " + moveVector);
        
        if (this._isGrounded()) {
            this._gravity.y = 0;
            this._grounded = true;
            this._lastGroundPos.copyFrom(this.mesh.position);
            this._canHover = true;

            this._jumpCount = this._maxJumpCount;
        }
        
        // Détection de saut
        if (this._inputs[this._currentInput].jumpKeyDown && this._jumpCount > 0) {
            this._gravity.y = Player.JUMP_FORCE;
            this._jumpCount--;
        }


        // Detecte la fin du plannage
        if (this._hovering) {
            this._hoverTimer -= 1;
            if (this._hoverTimer <= 0 || !this._inputs[this._currentInput].hoverKeyDown) {
                this._hovering = false;
            }
        }

        // Start hovering
        if (this._inputs[this._currentInput].hoverKeyDown && this._canHover && !this._grounded) {
           this._canHover = false;
           this._hovering = true;
           this._hoverTimer = Player.HOVER_TIME;
        }
    }
}