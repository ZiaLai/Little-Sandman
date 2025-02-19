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
import {Lerp} from "@babylonjs/core/Maths/math.scalar.functions";
import {CameraRadiusFunction} from "./Functions/CameraRadiusFunction";
import {PlayerCamera} from "./PlayerCamera";

export class Player extends TransformNode {
    public camera: PlayerCamera;
    public scene: Scene;
    private _inputs: PlayerInput[];
    private _currentInput: number = 0; // 0 = keyboard, 1 = gamepad
    private _canvas: HTMLCanvasElement;

    //Player
    public mesh: Mesh; //outer collisionbox of player


    // Constants
    private static readonly ORIGINAL_TILT: Vector3 = new Vector3(0.5934119456780721, 0, 0);
    private static PLAYER_SPEED: number = 12;
    private static GRAVITY: number = -30;
    private static JUMP_FORCE: number = 15.6;
    private static HOVER_TIME: number = 1; // Durée max de l'hovering (en secondes)

    // player movement vars
    private _deltaTime: number = 0;
    private _h: number;
    private _v: number;

    private _moveDirection: Vector3 = new Vector3();
    private _inputAmt: number;

    //gravity, ground detection, jumping
    private _gravity: Vector3 = new Vector3();
    private _grounded: boolean;
    lastGroundPos: Vector3 = Vector3.Zero();
    private _maxJumpCount : number = 1;
    private _jumpCount: number = 1;
    private _canHover: boolean = false;
    private _hoverTimer: number = 0;
    private _hovering: boolean = false;
    private _verticalVelocity: number;
    private _horizontalVelocity: number;
    private _direction: Vector3 = Vector3.Zero();
    private _lastCollidedRay: Ray;
    private _jumpKey: boolean;
    private _falling: number;
    private _speed: number = 0;
    private _acceleration: number = 1 / 7 * Player.PLAYER_SPEED;
    private _moveVector: Vector3;


    constructor(assets, scene: Scene, canvas: HTMLCanvasElement, shadowGenerator: ShadowGenerator) {
        super("player", scene);
        this.scene = scene;
        this.scene.collisionsEnabled = true;
        this.mesh = assets.mesh;

        this.mesh.position.y = 30 // Temporairement, en attendant qu'il y ait une startPos dans la ville
        //this.mesh.position = new Vector3(51, 18, 11);

        this.mesh.parent = this;

        this.camera = new PlayerCamera(this, this.scene, canvas);
        this._canvas = canvas;

        this.scene.getLightByName("sparklight").parent = this.scene.getTransformNodeByName("Empty");

        shadowGenerator.addShadowCaster(assets.mesh); //the player mesh will cast shadows

        this._inputs = [new KeyboardInput(this.scene, this._canvas), new GamepadInput(this.scene)];
        this._inputs[this._currentInput].isActive = true;
        this._inputs[1 - this._currentInput].isActive = false;
    }

    public setPosition(position: Vector3): void {
        console.log("set position", position);
        this.mesh.position = position;
    }

    // Calculs en fonction des inputs
    public _updateFromControls(): void {
        this._deltaTime = this.scene.getEngine().getDeltaTime() / 1000.0;

        this._moveDirection = Vector3.Zero(); // vecteur du mouvement du perso, qu'on recalcule à chaque frame
        this._h = this._inputs[this._currentInput].horizontal; // input sur l'axe des x
        this._v = this._inputs[this._currentInput].vertical; // input sur l'axe des z

        let fwd = new Vector3(Math.cos(this.camera.getAlpha() + Math.PI), 0, Math.sin(this.camera.getAlpha() + Math.PI));
        let right = new Vector3(Math.cos(this.camera.getAlpha() + Math.PI / 2), 0, Math.sin(this.camera.getAlpha() + Math.PI / 2));

        let correctedVertical = fwd.scaleInPlace(this._v);
        let correctedHorizontal = right.scaleInPlace(this._h);

        let move = correctedHorizontal.addInPlace(correctedVertical);

        this._moveDirection = new Vector3((move).normalize().x, 0, (move).normalize().z);

        if (!(this._moveDirection.equals(Vector3.Zero()))) {
            this._direction = this._moveDirection.clone();
        }

        // Limite la vitesse du mouvement diagonal
        let inputMag = Math.abs(this._h) + Math.abs(this._v);
        if (inputMag < 0) {
            this._inputAmt = 0;
        } else if (inputMag > 1) {
            this._inputAmt = 1;
        } else {
            this._inputAmt = inputMag;
        }

        // Gestion de la vitesse
        // Acceleration
        if (this._inputAmt > 0.1) {
            this._speed += this._acceleration;
        }
        if (this._speed > Player.PLAYER_SPEED) {
            this._speed = Player.PLAYER_SPEED;
        }

        let trueSpeed =  this._speed * this._deltaTime;

        // On crée une copie, pour ne pas modifier la direction quand on scale
        let direction = this._direction.clone();
        this._moveVector = direction.scaleInPlace(trueSpeed);

        // Décélération
        this._speed *= 0.9;
        if (this._speed < 0.01) {
            this._speed = 0;
        }


        // Rotations
        // On vérifie s'il y a un mouvement pour déterminer si on a besoin de faire une rotation
        let input = new Vector3(this._inputs[this._currentInput].horizontalAxis, this._inputs[this._currentInput].verticalAxis);
        if (input.length() == 0) {
            return;
        }
        // rotation en fonction de l'input et de l'angle de la caméra
        let angle = Math.atan2(this._inputs[this._currentInput].horizontalAxis, this._inputs[this._currentInput].verticalAxis) + Math.PI;
        //angle += (this.camera.alpha) % (2 * Math.PI);
        angle += - this.camera.getAlpha() + Math.PI / 2;
        let targ = Quaternion.FromEulerAngles(0, angle, 0);
        this.mesh.rotationQuaternion = Quaternion.Slerp(this.mesh.rotationQuaternion, targ, 10 * this._deltaTime);


    }


    beforeRenderUpdate(): void {
        //console.log("deltaTime : " + this._deltaTime);
        this._updateFromControls();
        this._updateGroundDetection();
    }

    private _floorRaycast(offsetx: number, offsetz: number, raycastlen: number): Vector3 {
        // Renvoie la position de la collision s'il y en a une
        // ou le vecteur nul sinon
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
                // Calcul de la gravité
                if (this._inputs[this._currentInput].jumpKeyDown || this._gravity.y < (1/3 * Player.JUMP_FORCE * this._deltaTime)) {
                    // Gravité normale si on garde espace appuyée
                    this._gravity = this._gravity.addInPlace(Vector3.Up().scale(this._deltaTime * Player.GRAVITY));
                }
                else {
                    // Gravité augmentée si on lâche la touche
                    this._gravity = this._gravity.addInPlace(Vector3.Up().scale(this._deltaTime * Player.GRAVITY * 2));                }

                this._grounded = false;
            } else {
                // Hovering
                // On annule la gravité
                this._gravity.y = Scalar.Lerp(this._gravity.y, 0, 0.2);
            }
        }

        // limit the speed of gravity to the negative of the jump power
        if (this._gravity.y < -2*Player.JUMP_FORCE) {
            this._gravity.y = -2*Player.JUMP_FORCE;
        }
        let move = this._moveVector;
        // moveVector.x *= this._horizontalVelocity;
        // moveVector.z *= this._verticalVelocity;
        move = move.addInPlace(this._gravity.scale(this._deltaTime));
        this.mesh.moveWithCollisions(move);

        //console.log("moveVector : " + moveVector);

        this._falling += 1;
        // Contact avec le sol
        if (this._isGrounded()) {
            this._gravity.y = 0;
            this._grounded = true;
            this.lastGroundPos.copyFrom(this.mesh.position);
            this._canHover = true;
            this._falling = 0;

            this._jumpCount = this._maxJumpCount;
        }
        
        // Détection de saut
        if (this._inputs[this._currentInput].jumpKeyDown) {
            if (!this._jumpKey && this._falling < 3 && this._jumpCount > 0) {
                this._gravity.y = Player.JUMP_FORCE;
                this._jumpCount--;
                this._jumpKey = true;
            }
        } else {
            this._jumpKey = false;
        }


        // Detecte la fin du plannage
        if (this._hovering) {
            this._hoverTimer -= this._deltaTime;
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

    getDeltaTime() {
        return this._deltaTime;
    }
}