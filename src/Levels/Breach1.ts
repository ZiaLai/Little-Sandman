import {AbstractLevel} from "./AbstractLevel";
import {Game} from "../game";
import {Mesh, Vector3} from "@babylonjs/core";
import {BreadSlicePlatform} from "../GameObjects/BreadSlicePlatform";
import {GameObject} from "../GameObjects/GameObject";

export class Breach1 extends AbstractLevel {
    private _startPosition: Vector3;

    private _modelRessourcesByNames: {} = {
        "breadSlice": "bread_slice.glb"
    }


    constructor(game: Game, id: number) {
        super(game, id);
        this._name = "breach_1";
        this._ressourceName = "BRECHE1";


        //this._startPosition = new Vector3(3.74, 0.91, -3.28);

    }

    protected async load(startPosition?: Vector3) {
        await super.load();

        let breadMesh: Mesh;

        this._objectsMeshes = {};

        for (let key in this._modelRessourcesByNames) {
            await this._game.spriteLoader.loadSprite(this._modelRessourcesByNames[key]).then(result => {
                this._objectsMeshes[key] = result;
                console.log("Mesh loaded");
                console.log(this._objectsMeshes);
            });
        }

        console.log("objectsMeshes", this._objectsMeshes);

        // this._game.getEnvironment().getAssets().allMeshes.forEach((m) => {
        //     console.log(m.name);
        //     if (m.name.includes("bread_slice")) {
        //         breadMesh = m;
        //     }
        // })

        console.log("before loading asset");
        await this._loadObjects().then((result)=> {
            this._objects = result;
            // Réactivation de la scène quand le chargement est fini (évite au joueur de passer sous la map s'il charge avant)
            this._finishedLoading();
            console.log("after loading asset");
        })







        //startPosition === null ? this._game.getPlayer().setPosition(this._startPosition) : this._game.getPlayer().setPosition(startPosition);
        //this._game.getPlayer().setPosition(this._startPosition);
    }

    initialize(): void {
        console.log("Object type", typeof(this._objects[0]));
        console.log(this._objects);
        this._objects[0].getMesh().position = new Vector3(-10, 0, 0);
    }

    update(): void {
        for (let object of this._objects) {
            object.update();
        }
        //console.log("Object type", typeof(this._objects["breadSlice"]));
    }


    private async _loadObjects(): Promise<GameObject[]> {
        return [new BreadSlicePlatform(this._game, this._objectsMeshes["breadSlice"])];
    }

    protected _addTriggers(): void {
    }
}