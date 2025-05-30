import {PlayerInput} from "./PlayerInput";
import {ActionManager, ExecuteCodeAction, Scalar, Scene} from "@babylonjs/core";

export class KeyboardInput extends PlayerInput {
    private _canvas: HTMLCanvasElement;
    private _lockPointer: boolean;



    constructor(scene: Scene, canvas: HTMLCanvasElement) {
        super();
        this._canvas = canvas;
        this._lockPointer = true;
        scene.actionManager = new ActionManager();

        this.inputMap = {};

        this._canvas.addEventListener("click", () => {
            if (! this._lockPointer) return;
                this.requestPointerLock();
        }, false);

        scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (evt) => {
            const code = evt.sourceEvent.code;
            this.inputMap[code] = true;
        }));
        scene.actionManager.registerAction(new
        ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (evt) => {
            const code = evt.sourceEvent.code;
            this.inputMap[code] = false;
        }));

        scene.onBeforeRenderObservable.add(() => {
            this._updateFromKeyboard();
        })
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
            this.jumpKeyDown = !!this.inputMap["Space"];


            if (this.inputMap["KeyW"]) {
                this.vertical = Scalar.Lerp(this.vertical, 1, 0.2);
                this.verticalAxis = 1;

            } else if (this.inputMap["KeyS"]) {
                this.vertical = Scalar.Lerp(this.vertical, -1, 0.2);
                this.verticalAxis = -1;

            } else {
                this.vertical = 0;
                this.verticalAxis = 0;
            }

            if (this.inputMap["KeyA"]) {
                this.horizontal = Scalar.Lerp(this.horizontal, -1, 0.2);
                this.horizontalAxis = -1;

            } else if (this.inputMap["KeyD"]) {
                this.horizontal = Scalar.Lerp(this.horizontal, 1, 0.2);
                this.horizontalAxis = 1;

            } else {
                this.horizontal = 0;
                this.horizontalAxis = 0;
            }

            this.hoverKeyDown = !!this.inputMap["ShiftLeft"];

            this.actionKeyDown = !!this.inputMap["KeyF"];

            this.pauseKeyDown = !!this.inputMap["Enter"];
        }
    }



    public reset() {
        for (let key in this.inputMap) {
            this.inputMap[key] = false;
        }
    }

    public setLockPointer(lockPointer: boolean): void {
        this._lockPointer = lockPointer;
    }

    exitPointerLock(): void {
        this._canvas.ownerDocument.exitPointerLock();
    }

    requestPointerLock(): void {
        if (! this._canvas) return;

        const requestPointerLock = this._canvas.requestPointerLock ||
            (this._canvas as any).mozRequestPointerLock ||
            (this._canvas as any).webkitRequestPointerLock;

        if (requestPointerLock) {
            requestPointerLock.call(this._canvas);
        } else {
            console.error("requestPointerLock n'est pas pris en charge par ce navigateur.");
        }
    }

    getLockPointer(): boolean {
        return this._lockPointer;
    }
}