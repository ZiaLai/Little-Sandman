import {Game} from "../game";
import {AbstractMesh, Mesh} from "@babylonjs/core";

export abstract class MeshGameObject {

    protected _game: Game;
    private _mesh: AbstractMesh;

    constructor(game: Game, mesh: AbstractMesh) {
        this._game = game;
        this._mesh = mesh;
    }


    abstract update(): void;

    protected _detectPlayerFeet(): boolean {
        let ray = this._game.getPlayer().getFloorRay();

        let result = this._game.getScene().pickWithRay(ray, (mesh) => this._mesh === (mesh as Mesh));

        return ray.intersectsMesh(this._mesh).hit;

    }
}