import {PlayerInput} from "./PlayerInput";
import {ActionManager, ExecuteCodeAction, Scalar, Scene} from "@babylonjs/core";

export class KeyboardInput extends PlayerInput {
    private _specialKeys: string[] = ["Shift"];
    private _pointerLocked: boolean = false;
    private _canvas: HTMLCanvasElement;


    constructor(scene: Scene, canvas: HTMLCanvasElement) {
        super();
        this._canvas = canvas;
        scene.actionManager = new ActionManager();

        this.inputMap = {};

        this._canvas.addEventListener("click", event => {
            if(this._canvas.requestPointerLock) {
                this._canvas.requestPointerLock().catch(err => console.error(err));
            }
        }, false);
        // scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnLeftPickTrigger, (evt) => {
        //     this._pointerLocked = true;
        //
        //
        // }))
        scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (evt) => {
            let key = evt.sourceEvent.key;
            if (!(this._specialKeys.includes(key))) {
                key = key.toLowerCase()
            }
            this.inputMap[key] = evt.sourceEvent.type == "keydown";
        }));
        scene.actionManager.registerAction(new
        ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (evt) => {
            let key = evt.sourceEvent.key;
            if (!(this._specialKeys.includes(key))) {
                key = key.toLowerCase()
            }
            this.inputMap[key] = evt.sourceEvent.type == "keydown";
        }));

        scene.onBeforeRenderObservable.add(() => {
            this._updateFromKeyboard();
        })

        this._updateFromMouse(scene)
    }

    private _updateFromKeyboard(): void {
        if (this.isActive) {
            if (this.inputMap["ArrowUp"]) {
                this.camVertical = Scalar.Lerp(this.camVertical, 1, 0.2);
                this.camVerticalAxis = 1;

            } else if (this.inputMap["ArrowDown"]) {
                this.camVertical = Scalar.Lerp(this.camVertical, -1, 0.2);
                this.camVerticalAxis = -1;

            } else {
                this.camVertical = 0;
                this.camVerticalAxis = 0;
            }

            if (this.inputMap["ArrowLeft"]) {
                this.camHorizontal = Scalar.Lerp(this.camHorizontal, -1, 0.2);
                this.camHorizontalAxis = -1;

            } else if (this.inputMap["ArrowRight"]) {
                this.camHorizontal = Scalar.Lerp(this.camHorizontal, 1, 0.2);
                this.camHorizontalAxis = 1;

            } else {
                this.camHorizontal = 0;
                this.camHorizontalAxis = 0;
            }

            // Jump Checks (SPACE)
            if (this.inputMap[" "]) {
                this.jumpKeyDown = true;
            } else {
                this.jumpKeyDown = false;
            }


            if (this.inputMap["z"]) {
                this.vertical = Scalar.Lerp(this.vertical, 1, 0.2);
                this.verticalAxis = 1;

            } else if (this.inputMap["s"]) {
                this.vertical = Scalar.Lerp(this.vertical, -1, 0.2);
                this.verticalAxis = -1;

            } else {
                this.vertical = 0;
                this.verticalAxis = 0;
            }

            if (this.inputMap["q"]) {
                this.horizontal = Scalar.Lerp(this.horizontal, -1, 0.2);
                this.horizontalAxis = -1;

            } else if (this.inputMap["d"]) {
                this.horizontal = Scalar.Lerp(this.horizontal, 1, 0.2);
                this.horizontalAxis = 1;

            } else {
                this.horizontal = 0;
                this.horizontalAxis = 0;
            }

            if (this.inputMap["Shift"]) {
                this.hoverKeyDown = true;
            } else {
                this.hoverKeyDown = false;
            }

        }



        // if (this.inputMap["a"]) {
        //     this._pointerLocked = false;
        // }
        //
        // if (!this._pointerLocked) {
        //     if (this._canvas.requestPointerLock) {
        //         this._canvas.requestPointerLock();
        //     }
        // }

    }

    private _updateFromMouse(scene : Scene): void {
        let left = 0;
        let right = 2;
        scene.onPointerDown = (e) => {

            if (e.button === left) {
                this.isShooting = true;
                console.log("left click");
            }

            if (e.button === right) {
                console.log("right click");
            }
        }

        scene.onPointerUp = (e) => {
            if (e.button === left) {
                this.isShooting = false;
            }
            if (e.button === right) {

            }
        }
    }

    public reset() {
        for (let key in this.inputMap) {
            this.inputMap[key] = false;
        }
    }
}