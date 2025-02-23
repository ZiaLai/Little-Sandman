import {ActionManager, ExecuteCodeAction, Scalar, Scene} from "@babylonjs/core";

export abstract class PlayerInput {
    public isActive: boolean = false;
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

    public abstract reset(): void;
}