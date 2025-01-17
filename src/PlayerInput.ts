import {ActionManager, ExecuteCodeAction, Scalar, Scene} from "@babylonjs/core";

export class PlayerInput {
    public vertical: number;
    public verticalAxis: number;
    public horizontal: number;
    public horizontalAxis: number;
    public inputMap: {};
    public dashing: boolean;
    public jumpKeyDown: boolean;
    public hoverKeyDown: boolean;

    // Camera values
    public camVertical : number;
    public camHorizontal: number;
    public camVerticalAxis: number;
    public camHorizontalAxis: number;
    private specialKeys: string[] = ["Shift"];


    constructor(scene: Scene) {
        scene.actionManager = new ActionManager();

        this.inputMap = {};
        scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (evt) => {
            let key = evt.sourceEvent.key;
            if (!(this.specialKeys.includes(key))) {
                key = key.toLowerCase()
            }
            this.inputMap[key] = evt.sourceEvent.type == "keydown";
        }));
        scene.actionManager.registerAction(new
        ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (evt) => {
            let key = evt.sourceEvent.key;
            if (!(this.specialKeys.includes(key))) {
                key = key.toLowerCase()
            }
            this.inputMap[key] = evt.sourceEvent.type == "keydown";
        }));

        scene.onBeforeRenderObservable.add(() => {
            this._updateFromKeyboard();
        })
    }

    private _updateFromKeyboard(): void {
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
}