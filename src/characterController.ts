import {
    TransformNode,
    ShadowGenerator,
    Scene,
    Mesh,
    UniversalCamera,
    ArcRotateCamera,
    Vector3,
    Quaternion, Ray, Scalar, ArcFollowCamera, FollowCamera
} from "@babylonjs/core";

export class Player extends TransformNode {
    public camera;
    public scene: Scene;
    private _input;
    private _canvas: HTMLCanvasElement;

    //Player
    public mesh: Mesh; //outer collisionbox of player

    // Camera
    private _camRoot: TransformNode;
    private _yTilt: TransformNode;

    // Constants
    private static readonly ORIGINAL_TILT: Vector3 = new Vector3(0.5934119456780721, 0, 0);
    private static PLAYER_SPEED: number = 1;
    private static GRAVITY: number = -2.8;
    private static JUMP_FORCE: number = 0.8;
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
    private _jumpCount: 1;
    private _canHover: boolean = false;
    private _hoverTimer: number = 0;
    private _hovering: boolean = false;
    private _verticalVelocity: number;
    private _horizontalVelocity: number;
    private _direction: number;





    constructor(assets, scene: Scene, canvas: HTMLCanvasElement, shadowGenerator: ShadowGenerator, input?) {
        super("player", scene);
        this.scene = scene;
        this.mesh = assets.mesh;
        this.mesh.parent = this;

        this._setupPlayerCamera();
        this._canvas = canvas;




        this.scene.getLightByName("sparklight").parent = this.scene.getTransformNodeByName("Empty");

        shadowGenerator.addShadowCaster(assets.mesh); //the player mesh will cast shadows

        this._input = input; //inputs we will get from inputController.ts
    }

    private _setupPlayerCamera(): UniversalCamera {
        //root camera parent that handles positioning of the camera to follow the player
        this._camRoot = new TransformNode("root");
        this._camRoot.position = new Vector3(0, 0, 0);
        // To face the player from behind (180 degrees)
       // this._camRoot.rotation = new Vector3(0, Math.PI, 0);

        // rotations along the x-axis (up/down tilting)
        //let yTilt = new TransformNode("ytilt");
        // adjustments to camera view to point down at our player
        //yTilt.rotation = Player.ORIGINAL_TILT;
        //this._yTilt = yTilt;
        //yTilt.parent = this._camRoot;

        // our actual camera that's pointing at our root's position
        this.camera = new ArcRotateCamera("cam", 0, 0, 25, new Vector3(0, 0, 0), this.scene);

        this.scene.activeCamera = this.camera;

        this.camera.lockedTarget = this._camRoot;
        //this.camera.lockedTarget = this._camRoot.position;
        this.camera.fov = 0.47350045992678597;
        //this.camera.parent = yTilt;


        this.camera.attachControl(this._canvas, true);
        return this.camera;

    }

    private _updateCamera(): void {
        let x = this.mesh.position.x;
        let y = this.mesh.position.y;
        let z = this.mesh.position.z;
        this._camRoot.position = new Vector3(x, y + 5, z)
        // this._camRoot.position = Vector3.Lerp(this._camRoot.position,
        //    new Vector3(this.mesh.position.x, centerPlayer, this.mesh.position.z), 0.4);

    }

    // private _updateFromControls(): void {
    //     this._deltaTime = this.scene.getEngine().getDeltaTime() / 1000.0;
    //
    //     this._moveDirection = Vector3.Zero(); // vector that holds movement information
    //     this._h = this._input.horizontal; // x-axis
    //     this._v = this._input.vertical; // z-axis
    //
    //     //--MOVEMENTS BASED ON CAMERA (as it rotates)--
    //     let fwd = this._camRoot.forward;
    //     let right = this._camRoot.right;
    //     let correctedVertical = fwd.scaleInPlace(this._v);
    //     let correctedHorizontal = right.scaleInPlace(this._h);
    //
    //     // movement based off of camera's view
    //     let move = correctedHorizontal.addInPlace(correctedVertical);
    //
    //     // clear y so that the character doesn't fly up, normalize for next step
    //     this._moveDirection = new Vector3((move).normalize().x, 0, (move).normalize().z);
    //
    //     // clamp the input value so that diagonal movement isn't twice as fast
    //     let inputMag = Math.abs(this._h) + Math.abs(this._v); // input magnitude
    //     if (inputMag < 0) {
    //         this._inputAmt = 0;
    //     } else if (inputMag > 1) {
    //         this._inputAmt = 1;
    //     } else {
    //         this._inputAmt = inputMag;
    //     }
    //
    //     // final movement that takes into consideration the inputs
    //     this._moveDirection = this._moveDirection.scaleInPlace(this._inputAmt * Player.PLAYER_SPEED);
    //
    //     // check if there is movement to determine if rotation is needed
    //     let input = new Vector3(this._input.horizontalAxis, 0, this._input.verticalAxis); // along which axis is the direction
    //
    //     if (input.length() == 0) { // if there is no input detected, prevent rotation and keep player in same rotation
    //         return;
    //     }
    //
    //     // rotation based on input and the camera angle
    //     let angle = Math.atan2(this._input.horizontalAxis, this._input.verticalAxis);
    //     angle += this._camRoot.rotation.y;
    //     let targ = Quaternion.FromEulerAngles(0, angle, 0);
    //     this.mesh.rotationQuaternion = Quaternion.Slerp(this.mesh.rotationQuaternion, targ, 10 * this._deltaTime);
    // }

    private _updateFromControls(): void {
        this._deltaTime = this.scene.getEngine().getDeltaTime() / 1000.0;

        // Obtenir les directions de mouvement basées sur la caméra
        let forward = this._camRoot.forward.scale(this._input.vertical);
        let right = this._camRoot.right.scale(this._input.horizontal);
        let movement = forward.add(right);

        let horizontal: number;
        let vertical: number;


        let angle = this.camera.alpha % (2 * Math.PI);
        
        this._direction = -this._input.vertical * Player.PLAYER_SPEED;
        //this._direction = angle;

        horizontal = Math.cos(angle) * this._direction;
        vertical = Math.sin(angle) * this._direction;

        this._moveDirection = new Vector3(horizontal, 0, vertical);

        this._horizontalVelocity = this._input.horizontal * Player.PLAYER_SPEED;
        this._verticalVelocity = this._input.vertical * Player.PLAYER_SPEED;
        //console.log("horizontal : " + this._horizontalVelocity);



        // // Rotation du joueur en fonction de l'entrée et de l'angle de la caméra
        // if (movement.lengthSquared() > 0) {
        //     let angle = Math.atan2(this._input.horizontal, this._input.vertical) + this._camRoot.rotation.y;
        //     let targetRotation = Quaternion.FromEulerAngles(0, angle, 0);
        //     this.mesh.rotationQuaternion = Quaternion.Slerp(this.mesh.rotationQuaternion, targetRotation, 10 * this._deltaTime);
        // }
    }

    public activatePlayerCamera(): UniversalCamera {
        this.scene.registerBeforeRender(() => {

            this._beforeRenderUpdate();
            this._updateCamera();

        })
        return this.camera;
    }

    private _beforeRenderUpdate(): void {
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

    private _isGrounded(): boolean {
        if (this._floorRaycast(0, 0, 0.6).equals(Vector3.Zero())) {
            return false;
        } else {
            return true;
        }
    }

    private _updateGroundDetection(): void {
        if (!this._isGrounded()) {
            if (!this._hovering) {
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
        moveVector = moveVector.addInPlace(this._gravity);
        this.mesh.moveWithCollisions(moveVector);

        console.log("moveVector : " + moveVector);
        
        if (this._isGrounded()) {
            this._gravity.y = 0;
            this._grounded = true;
            this._lastGroundPos.copyFrom(this.mesh.position);
            this._canHover = true;

            this._jumpCount = 1;
        }
        
        // Jump detection
        if (this._input.jumpKeyDown && this._jumpCount > 0) {
            this._gravity.y = Player.JUMP_FORCE;
            this._jumpCount--;
        }


        // Detect if hovering is ending
        if (this._hovering) {
            this._hoverTimer -= 1;
            if (this._hoverTimer <= 0 || !this._input.hoverKeyDown) {
                this._hovering = false;
            }
        }

        // Start hovering
        if (this._input.hoverKeyDown && this._canHover && !this._grounded) {
           this._canHover = false;
           this._hovering = true;
           this._hoverTimer = Player.HOVER_TIME;
        }
    }
}