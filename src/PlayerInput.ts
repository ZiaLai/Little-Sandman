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


    constructor(scene: Scene) {
        scene.actionManager = new ActionManager();

        this.inputMap = {};
        scene.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, (evt) => {
            this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }));
        scene.actionManager.registerAction(new
        ExecuteCodeAction(ActionManager.OnKeyUpTrigger, (evt) => {
            this.inputMap[evt.sourceEvent.key] = evt.sourceEvent.type == "keydown";
        }));

        scene.onBeforeRenderObservable.add(() => {
            this._updateFromKeyboard();
        })
    }

    private _updateFromKeyboard(): void {
        if (this.inputMap["ArrowUp"]) {
            this.vertical = Scalar.Lerp(this.vertical, 1, 0.2);
            this.verticalAxis = 1;

        } else if (this.inputMap["ArrowDown"]) {
            this.vertical = Scalar.Lerp(this.vertical, -1, 0.2);
            this.verticalAxis = -1;

        } else {
            this.vertical = 0;
            this.verticalAxis = 0;
        }

        if (this.inputMap["ArrowLeft"]) {
            this.horizontal = Scalar.Lerp(this.horizontal, -1, 0.2);
            this.horizontalAxis = -1;

        } else if (this.inputMap["ArrowRight"]) {
            this.horizontal = Scalar.Lerp(this.horizontal, 1, 0.2);
            this.horizontalAxis = 1;

        } else {
            this.horizontal = 0;
            this.horizontalAxis = 0;
        }

        // Jump Checks (SPACE)
        if (this.inputMap[" "]) {
            this.jumpKeyDown = true;
        } else {
            this.jumpKeyDown = false;
        }

        if (this.inputMap["Shift"]) {
            this.hoverKeyDown = true;
        } else {
            this.hoverKeyDown = false;
        }

    }
}