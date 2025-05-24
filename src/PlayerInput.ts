import {ActionManager, ExecuteCodeAction, Scalar, Scene} from "@babylonjs/core";
import {KeyboardInput} from "./KeyboardInput";

export abstract class PlayerInput {
    public isActive: boolean = false;
    public vertical: number;
    public verticalAxis: number;
    public horizontal: number;
    public horizontalAxis: number;
    public inputMap: {};

    public jumpKeyDown: boolean;
    public hoverKeyDown: boolean;
    public actionKeyDown: boolean;

    // Camera values
    public camVertical : number;
    public camHorizontal: number;
    public camVerticalAxis: number;
    public camHorizontalAxis: number;

    public pauseKeyDown: boolean;

    public abstract setLockPointer(lockPointer: boolean):void;

    public abstract exitPointerLock():void;

    public abstract requestPointerLock():void;

    public abstract reset(): void;

    public abstract getLockPointer(): boolean;
}