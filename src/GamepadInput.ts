import {PlayerInput} from "./PlayerInput";
import {
    ActionManager,
    DualShockPad,
    ExecuteCodeAction,
    GamepadManager,
    GenericPad,
    Scalar,
    Scene, StickValues,
    Xbox360Pad
} from "@babylonjs/core";

export class GamepadInput extends PlayerInput {
    private leftStick: StickValues = new StickValues(0, 0);
    private rightStick: StickValues = new StickValues(0, 0);
    private movingLeftStick: boolean;
    private movingRightStick: boolean;

    constructor(scene: Scene) {
        super();
        let gamepadManager = new GamepadManager();

        this.inputMap = {};
        gamepadManager.onGamepadConnectedObservable.add((gamepad, state) => {
            if (gamepad instanceof Xbox360Pad || gamepad instanceof GenericPad || gamepad instanceof DualShockPad) {
                gamepad.onButtonDownObservable.add((button, state) => {
                    this.inputMap[button] = true;
                });
                gamepad.onButtonUpObservable.add((button, state) => {
                    this.inputMap[button] = false;
                })
                gamepad.onleftstickchanged((values) => {
                    this.leftStick = values;
                    this.updateLeftStick();
                })
                gamepad.onrightstickchanged((values) => {
                    this.leftStick = values;
                })
            }
        })

        scene.onBeforeRenderObservable.add(() => {
            this._updateFromGamepad();
        })
    }

    private _updateFromGamepad() {
        if (this.isActive) {
            console.log(this.leftStick + " " + this.leftStick.y);
            // if (this.inputMap["ArrowUp"]) {
            //     this.camVertical = Scalar.Lerp(this.camVertical, 1, 0.2);
            //     this.camVerticalAxis = 1;
            //
            // } else if (this.inputMap["ArrowDown"]) {
            //     this.camVertical = Scalar.Lerp(this.camVertical, -1, 0.2);
            //     this.camVerticalAxis = -1;
            //
            // } else {
            //     this.camVertical = 0;
            //     this.camVerticalAxis = 0;
            // }
            //
            // if (this.inputMap["ArrowLeft"]) {
            //     this.camHorizontal = Scalar.Lerp(this.camHorizontal, -1, 0.2);
            //     this.camHorizontalAxis = -1;
            //
            // } else if (this.inputMap["ArrowRight"]) {
            //     this.camHorizontal = Scalar.Lerp(this.camHorizontal, 1, 0.2);
            //     this.camHorizontalAxis = 1;
            //
            // } else {
            //     this.camHorizontal = 0;
            //     this.camHorizontalAxis = 0;
            // }

            // Jump Checks (SPACE)
            if (this.inputMap["1"]) { // bouton A
                this.jumpKeyDown = true;
            } else {
                this.jumpKeyDown = false;
            }



            //

            if (this.inputMap["7"]) { // Bouton ZR
                this.hoverKeyDown = true;
            } else {
                this.hoverKeyDown = false;
            }

        }
    }

    private updateLeftStick() {

        this.vertical = - this.leftStick.y;
        this.horizontal = this.leftStick.x;
        this.verticalAxis = (this.vertical >= 0) ? 1 : -1;
        this.horizontalAxis = (this.horizontal >= 0) ? 1 : -1;
        if (Math.abs(this.leftStick.y) < 0.5) {
            this.vertical = 0;
            this.verticalAxis = 0;
        }


        if (Math.abs(this.leftStick.x) < 0.5) {
            this.horizontal = 0;
            this.horizontalAxis = 0;
        }

    }
}