import {AbstractLevel} from "./AbstractLevel";
import {Game} from "../game";
import {Mesh, Scene, Vector3} from "@babylonjs/core";
import {BreadSlicePlatform} from "../GameObjects/BreadSlicePlatform";
import {GameObject} from "../GameObjects/GameObject";
import {Knife} from "../GameObjects/Knife";



export class Breach1 extends AbstractLevel {
    private _startPosition: Vector3;

    // On liste les noms des ressources graphiques des objets dont on a besoin par leur nom
    // todo : Pourquoi on fait pas ça ailleurs ? Si on fait ça là on va devoir tout réecrire à chaque niveau
    // Pourtant le modèle de tranche de pain ne change pas d'un niveau à l'autre. Le mettre dans game ?
    private _modelRessourcesByNames: {} = {
        "breadSlice": "bread_slice_v2.glb",
        "knife": "knife.glb"
    }


    constructor(game: Game, id: number) {
        super(game, id);
        this._name = "breach_1";
        this._ressourceName = "BRECHE1";


        //this._startPosition = new Vector3(3.74, 0.91, -3.28);

    }

    protected async load() {
        await super.load();

        let breadMesh: Mesh;

        // Dictionnaire contenant les ressources graphiques de chaque objet
        this._objectsMeshes = {};

        // Chargement des sprites des meshs
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
        console.log(this._objects);

        for (let key in this._objects) {
            for (let object of this._objects[key]) {
                console.log("INitializing object", object);
                object.initialize();
                console.log("Bread Slice Position", this._objects["breadSlice"][0]);
            }
        }
        //this._objects["breadSlice"][0].getMesh().position = new Vector3(10, 0, -30);
    }

    update(): void {
        for (let key in this._objects) {
            for (let object of this._objects[key]) {
                object.update();
            }
        }
    }


    private async _loadObjects(): Promise<{}> {

        // Dictionnaire des objets. nom de l'objet : [liste des objets de ce type]
        return {
            "breadSlice" : [
                new BreadSlicePlatform(this._game, this._objectsMeshes["breadSlice"], new Vector3(7, 6, -15), "bread_slice")
            ],
            "knife" : [
                new Knife(this._game, this._objectsMeshes["knife"], new Vector3(0, 0, 0), "knife")
            ]
            };
    }

    protected _addTriggers(): void {
    }

    protected setUpLights(): void {
    }

    protected setUpSkydome(): void {
    }
}