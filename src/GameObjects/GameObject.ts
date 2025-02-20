import {Mesh} from "@babylonjs/core";
import {Game} from "../game";

export abstract class GameObject {
    protected _mesh: Mesh;
    protected _game: Game;

    constructor(game: Game, mesh: Mesh) {
        this._game = game;
        this._mesh = mesh;
    }

    public abstract update(): void;

    public destroy(): void {

    }
}