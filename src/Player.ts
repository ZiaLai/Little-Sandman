import {
    Axis,
    Quaternion,
    Ray,
    Scalar,
    Scene,
    Mesh,
    ShadowGenerator,
    TransformNode,
    Vector3, Matrix, Tools
} from "@babylonjs/core";
import {PlayerInput} from "./PlayerInput";
import {KeyboardInput} from "./KeyboardInput";
import {GamepadInput} from "./GamepadInput";
import {PlayerCamera} from "./PlayerCamera";
import {Sand} from "./util/Sand";
import {StaminaBar} from "./util/StaminaBar";

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
    private _maxJumpCount: number = 1;
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

    private _isJumping: boolean;
    private _isWalking: boolean;
    private _isLanding: boolean;
    private _isHovering: boolean;
    private _isFalling: boolean;

    private _isShooting: boolean = false;
    private _isStartingShooting: boolean;
    private _isEndingShooting: boolean = false;
    private _wasShootingLastFrame: boolean = false;
    private _shootAnimationTimer: number;



    private _animations: {};
    private _currentAnim;
    private _prevAnim;
    private sandEmetter;
    private hoveringSandEmetter;
    private _landAnimationTimer: number // Sauvegarde le temps écoulé depuis le début de la dernière animation
    private _staminaBar;

    constructor(assets, scene: Scene, canvas: HTMLCanvasElement, shadowGenerator: ShadowGenerator, playerPosition: Vector3) {
        super("player", scene);
        this.scene = scene;
        this.scene.collisionsEnabled = true;
        this.mesh = assets.mesh;

        // this.mesh.position.y = 3.5   // Temporairement, en attendant qu'il y ait une startPos dans la ville
        //this.mesh.position = new Vector3(51, 18, 11);
        if (playerPosition === undefined) playerPosition = new Vector3(0, 3.5, 0);
        this.setPosition(playerPosition);

        this.mesh.parent = this;

        this.camera = new PlayerCamera(this, this.scene, canvas);
        this._canvas = canvas;

        this.scene.getLightByName("sparklight").parent = this.scene.getTransformNodeByName("Empty");

        shadowGenerator.addShadowCaster(assets.mesh); //the player mesh will cast shadows

        this._inputs = [new KeyboardInput(this.scene, this._canvas), new GamepadInput(this.scene)];
        this._inputs[this._currentInput].isActive = true;
        this._inputs[1 - this._currentInput].isActive = false;

        this._animations = { "end_sand" : assets.animationGroups[0],
            "fall_loop" : assets.animationGroups[1],
            "idle": assets.animationGroups[2],
            "jump": assets.animationGroups[3],
            "land" : assets.animationGroups[4],
            "sand_idle": assets.animationGroups[5],
            "sand_forward": assets.animationGroups[6],
            "start_sand": assets.animationGroups[7],
            "walk": assets.animationGroups[8],
            "scarf_left": assets.animationGroups[9],
            "scarf_right": assets.animationGroups[10]};

        this._setUpAnimations();

        // -- SAND EMMETTER
        this.sandEmetter = Sand.getParticleSystem(this.scene);
        this.hoveringSandEmetter = Sand.getParticleSystem(this.scene);
        this.hoveringSandEmetter.createPointEmitter(new Vector3(-0.2,-1,0.2), new Vector3(0.2,-1,-0.2));
        // -- STAMINA BAR
        this._staminaBar = new StaminaBar(this.mesh, this.scene);

    }
    private _setUpAnimations(){
        this.scene.stopAllAnimations();
        // indique quelles anim bouclent // utile dans anim player
        this._animations["idle"].loopAnimation = true;
        this._animations["walk"].loopAnimation = true;
        this._animations["scarf_left"].loopAnimation = true;
        this._animations["scarf_right"].loopAnimation = true;
        this._animations["fall_loop"].loopAnimation = true;
        this._animations["sand_forward"].loopAnimation = true;

        //init anim
        this._currentAnim = this._animations["idle"];
        this._prevAnim = this._animations["walk"];
        this._animations["scarf_right"].play(true);
        this._animations["scarf_left"].play(true);
        this._animations["idle"].play(true);
}
    private _animatePlayer(){


        if (this._isStartingShooting) {
            this._currentAnim = this._animations["start_sand"];
            ///this.sandEmetter.start();
        }

        else if (this._isEndingShooting) {
            this._currentAnim = this._animations["end_sand"];
            this.sandEmetter.stop();
        }

        else if (this._isShooting) {
            if (this._isWalking){
                this._currentAnim = this._animations["sand_forward"];
            }
            else {
                this._currentAnim = this._animations["sand_idle"];
            }
            this.sandEmetter.start();
        }

        else if (this._hovering ){
            this._currentAnim = this._animations["fall_loop"];
            this.hoveringSandEmetter.start();

        }

        else if (this._isFalling){
             this._currentAnim = this._animations["fall_loop"];
             console.log("is falling")
         }
        else if (this._isJumping){
            this._currentAnim = this._animations["jump"];
            this.hoveringSandEmetter.stop();

        }


         else if (this._isWalking){
             this._landAnimationTimer = 10; // Valeur arbitrairement grande pour empêcher l'anim d'atterissage
             this._currentAnim = this._animations["walk"];
                    this.hoveringSandEmetter.stop();
         }

        else if (this._isGrounded() && (this._prevAnim == this._animations["fall_loop"] || this._landAnimationTimer < 0.88)) {
            this._currentAnim = this._animations["land"];
            this.hoveringSandEmetter.stop();
        }


        else {
            this._currentAnim = this._animations["idle"];
            this.hoveringSandEmetter.stop();

        }


        if (this._currentAnim === this._animations["land"]) {
            this._landAnimationTimer += this._deltaTime;
        }

        if ((! this._isGrounded()) && (this._prevAnim == this._animations["fall_loop"])) {
            this._landAnimationTimer = 0;
        }

        if (this._currentAnim != null && this._prevAnim !== this._currentAnim){

            this._prevAnim.stop();
            this._currentAnim.play(this._currentAnim.loopAnimation);
            this._prevAnim = this._currentAnim
        }


}
    public setPosition(position: Vector3): void {
        console.log("set position", position);
        this.mesh.position.copyFrom(position);
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

        this._isWalking = true;
        // Rotations
        // On vérifie s'il y a un mouvement pour déterminer si on a besoin de faire une rotation
        let input = new Vector3(this._inputs[this._currentInput].horizontalAxis, this._inputs[this._currentInput].verticalAxis);
        if (input.length() == 0) {
            this._isWalking = false;
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
        this._animatePlayer();
        //console.log("Player pos", this.mesh.position);
        this.updateStates();
        this.updateSandEmetter();
        this.updateStaminaBar();

    }

    private updateStates() {
        if (this._gravity.y <= 0) {
            this._isJumping = false;
        }
        this._isFalling = (!this._isJumping) && this._falling > 0;

        if (this._inputs[this._currentInput].isShooting && !this._wasShootingLastFrame) { // Le joueur commence à shooter
            this._shootAnimationTimer = 0;
            this._wasShootingLastFrame = true;
            this._isStartingShooting = true
            this._isShooting = false;
        }

        else if ((this._inputs[this._currentInput].isShooting && this._wasShootingLastFrame && !this._isShooting) || this._isStartingShooting) { // Le joueur continue de shooter
            this._shootAnimationTimer += this._deltaTime;
            this._wasShootingLastFrame = true;

            if (this._shootAnimationTimer > 1) {

                this._isStartingShooting = false;
                this._isShooting = true;
            }
        }

        else if (this._isShooting && (! this._inputs[this._currentInput].isShooting)) { // Le joueur s'arrête de shooter
            this._shootAnimationTimer = 0;
            this._isEndingShooting = true;
            this._isShooting = false;
        }

        else if (this._isEndingShooting) { // En train de s'arrêter de shooter
            this._shootAnimationTimer += this._deltaTime;
            if (this._shootAnimationTimer > 1) {
                this._isEndingShooting = false;
            }
        }


        if (! this._inputs[this._currentInput].isShooting) { // Arrête de shooter
            this._wasShootingLastFrame = false;
        }
       // console.log("shot anim timer =", this._shootAnimationTimer,"startShooting =", this._isStartingShooting, " shooting =", this._isShooting, "end shooting =", this._isEndingShooting, "was shooting last_frame", this._wasShootingLastFrame );
        //console.log(this._inputs[0]);
    }

    private _debug() {
        // Fonction utilitaire pour créer une flèche orientée sur l'axe Z
//         function createArrow(scene: Scene, color: Color3): Mesh {
//             const body = MeshBuilder.CreateCylinder("arrowBody", {
//                 height: 1.5,
//                 diameter: 0.05
//             }, scene);
//             body.rotation.x = Math.PI / 2;
//
//             const head = MeshBuilder.CreateCylinder("arrowHead", {
//                 height: 0.3,
//                 diameterTop: 0,
//                 diameterBottom: 0.15
//             }, scene);
//             head.rotation.x = Math.PI / 2;
//             head.position.z = 0.9;
//
//             const arrow = Mesh.MergeMeshes([body, head], true, false, undefined, false, true);
//             arrow.isPickable = false;
//
//             const mat = new StandardMaterial("arrowMat", scene);
//             mat.diffuseColor = color;
//             arrow.material = mat;
//
//             return arrow;
//         }
//
// // Créer les deux flèches
//         const directionArrow = createArrow(this._scene, Color3.Red());
//         const meshDirectionArrow = createArrow(this._scene, Color3.Blue());
//
// // Suivre la position et orientation du joueur
//         this._scene.onBeforeRenderObservable.add(() => {
//             // Rouge — this._direction
//             directionArrow.position.copyFrom(this.mesh.position);
//             directionArrow.lookAt(this.mesh.position.add(this._direction));
//
//             // Bleu — this.mesh.forward (ou une méthode équivalente)
//             const forward = this.mesh.getDirection(Axis.Z); // Z est "avant" local
//             meshDirectionArrow.position.copyFrom(this.mesh.position);
//             meshDirectionArrow.lookAt(this.mesh.position.add(forward));
//         });
    }

    public getFloorRay(): Ray {
        let offsetX = 0;
        let offsetZ = 0;
        let raycastLen = 0.6
        let raycastFloorPos = new Vector3(this.mesh.position.x + offsetX, this.mesh.position.y + 0.5,
            this.mesh.position.z + offsetZ);

        let ray: Ray = new Ray(raycastFloorPos, Vector3.Up().scale(-1), raycastLen);
        //
        // RayHelper.CreateAndShow(ray, this._scene, Color3.Red());


        return ray;
    }

    private _floorRaycast(): Vector3 {
        // Renvoie la position de la collision s'il y en a une
        // ou le vecteur nul sinon
        let ray = this.getFloorRay();

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
        if (this._floorRaycast().equals(Vector3.Zero())) {
            return false;
        } else {
            return true;
        }
    }

    private _updateGroundDetection(): void {
        if (!this._isGrounded()) {
            // Vérifie si on est sur une pente => isoler fonction pour plus de clarté ?
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
                    this._gravity = this._gravity.addInPlace(Vector3.Up().scale(this._deltaTime * Player.GRAVITY * 2));
                    this._isJumping = false;
                    this._isFalling = true;
                }
                this._grounded = false;
            }
            else {
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
            this._isJumping = false;
            this._isFalling = false;
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
                this._isJumping = true;
                this._gravity.y = Player.JUMP_FORCE;
                this._jumpCount--;
                this._jumpKey = true;
            }
        } else {
            this._jumpKey = false; //jumpkey evite de sauter en boucke en mainteant le bouton appyer
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

    private updateSandEmetter(){
        this.hoveringSandEmetter.emitter = new Vector3(0,1.23,0).addInPlace(new Vector3().copyFrom(this.mesh.position));
        let x = this.getMeshDirection()._x;
        let z = this.getMeshDirection()._z;
        // -- POSITION
        let center = new Vector3().copyFrom(this.mesh.position);

        let position = center.addInPlace(new Vector3(x,1.23,z));

        function rotateAroundY(vector, center, angle) {
            // Translation vers l'origine
            angle = Tools.ToRadians(angle);
            const translated = vector.subtract(center);

            // Rotation autour de l'axe Y (plan XZ)
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);

            const rotatedX = translated.x * cos - translated.z * sin;
            const rotatedZ = translated.x * sin + translated.z * cos;

            const rotated = new Vector3(rotatedX, translated.y, rotatedZ);

            // Retour à la position d'origine
            return rotated.add(center);
        }

        this.sandEmetter.emitter = rotateAroundY(position,new Vector3().copyFrom(this.mesh.position), -7);
        //-- ANGLE

        let orthogonal = new Vector3(-z,0.1,x).scale(1/3);
        let copyDirection = new Vector3().copyFrom(this.getMeshDirection());
        let copyDirection2 = new Vector3().copyFrom(this.getMeshDirection());
        let min  = copyDirection.subtract(orthogonal);
        let max = copyDirection2.addInPlace(orthogonal);
        this.sandEmetter.createPointEmitter(min,max);
        //console.log ("direction :", this._direction, " direction sable :",min, ", ", max , " position sable : ", position);
    }


    public reset() {
        this._inputs[this._currentInput].reset();
    }

    private getMeshDirection(): Vector3 {
        return this.mesh.getDirection(Axis.Z);
    }

    private updateStaminaBar(){
        this._staminaBar.updateStaminaBarAnimated(this._hoverTimer- this._deltaTime, this._hoverTimer);
        let x = this.getMeshDirection()._x;

        let z = this.getMeshDirection()._z;

        // -- POSITION
        const forward = this.camera.getCamera().getForwardRay().direction;
        const up = Vector3.Up();
        const right = Vector3.Cross(forward, up).normalize();

        const offsetRight = right.scale(0.5);
        const offsetUp = new Vector3(0, 1.5, 0);
        const position =  new Vector3().copyFrom(this.position.add(offsetRight).add(offsetUp));

        // La jauge regarde toujours la caméra
        this._staminaBar.updatePosition(position);

        if (this._hovering) {
            this._staminaBar.staminaPlane.visibility = 1;
            this._staminaBar.staminaPlane.setEnabled(true);
        }

        else {
            if (this._staminaBar.staminaPlane.visibility > 0){
                this._staminaBar.staminaPlane.visibility -= 0.02;
            }
            else {
                this._staminaBar.staminaPlane.setEnabled(false);
            }

        }
    }

    public disableCamera(): void {
        this.camera.disable();
    }

    public setMeshDirection(direction: Vector3): void {

        this.mesh.rotationQuaternion = Quaternion.FromEulerAngles(direction.x, direction.y, direction.z);
        //this.mesh.setDirection(direction);
    }

    public getInput(): PlayerInput {
        return this._inputs[this._currentInput];
    }

    // public orientCamera(): void {
    //     this.camera.setAlpha(this.getMeshDirection().z);
    // }
}