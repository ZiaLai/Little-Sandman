import {Game} from "./game";
import { SceneLoader, Vector3} from "@babylonjs/core";

export class SpriteLoader {
    private _game: Game;

    constructor(game: Game) {
        this._game = game;
    }

    public async loadSprite(fileName: string) {
        return SceneLoader.ImportMeshAsync("", "", fileName, this._game.getGameScene()).then((result) => {

            const mesh = result.meshes[0];
            mesh.rotationQuaternion = null;
            mesh.position = Vector3.Zero();

            return {
                mesh: mesh,
                animationGroups: result.animationGroups
            };
        })
    }

}