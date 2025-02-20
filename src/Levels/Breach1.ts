import {AbstractLevel} from "./AbstractLevel";
import {Game} from "../game";
import {Mesh, Vector3} from "@babylonjs/core";
import {BreadSlicePlatform} from "../GameObjects/BreadSlicePlatform";

export class Breach1 extends AbstractLevel {
    private _startPosition: Vector3;

    constructor(game: Game, id: number) {
        super(game, id);
        this._name = "breach_1";
        this._ressourceName = "BRECHE1";
        //this._startPosition = new Vector3(3.74, 0.91, -3.28);

    }

    protected async load(startPosition?: Vector3) {
        await super.load();

        let breadMesh: Mesh;

        this._game.getEnvironment().getAssets().allMeshes.forEach((m) => {
            console.log(m.name);
            if (m.name.includes("bread_slice")) {
                breadMesh = m;
            }
        })

        console.log(breadMesh);
        this._objects = [new BreadSlicePlatform(this._game, breadMesh)]



        //startPosition === null ? this._game.getPlayer().setPosition(this._startPosition) : this._game.getPlayer().setPosition(startPosition);
        //this._game.getPlayer().setPosition(this._startPosition);
    }

    initialize(): void {
    }

    update(): void {
        for (let object of this._objects) {
            object.update();
        }
    }


}