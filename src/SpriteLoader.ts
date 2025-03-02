import {Game} from "./game";
import {Mesh, SceneLoader, Vector3} from "@babylonjs/core";

export class SpriteLoader {
    private _game: Game;

    constructor(game: Game) {
        this._game = game;
    }

    public async loadSprite(fileName: string) {
        return SceneLoader.ImportMeshAsync("", "./models/", fileName, this._game.getScene()).then((result) => {

            const mesh = result.meshes[0];
            mesh.rotationQuaternion = null;
            return mesh;
        })
    }

}