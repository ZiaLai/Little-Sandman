import {Mesh} from "@babylonjs/core";
import {Game} from "../game";

export abstract class GameObject {
    protected _mesh: Mesh;
    protected _game: Game;

    constructor(game: Game, mesh: Mesh) {
        console.log("Creating GameObject");

        this._game = game;
        this._mesh = mesh;
        if (this._mesh === undefined) {
            throw new Error("Undefined mesh when creating a GameObject");
        }
    }

    public abstract update(): void;

    public destroy(): void {

    }

    public getMesh(): Mesh {
        return this._mesh;
    }
}