import {AbstractLevel} from "./AbstractLevel";
import {Environment} from "../environment";
import {Game} from "../game";
import {ActionManager, Mesh, Scene} from "@babylonjs/core";


export class SugarlessBakery extends AbstractLevel {

    constructor(game: Game, id: number) {
        super(game, id);
        this._name = "sugarless_bakery";
        this._ressourceName = "bakery_level_12";
    }

    protected async load() {
        super.load();
        this._addTriggers();
        this._finishedLoading();
        // todo : charger la musique
    }

    update(): void {
        for (let key in this._objects) {
            for (let object of this._objects[key]) {
                object.update();
            }
        }
    }

    public initialize() {

    }

    protected _addTriggers(): void {
        //element_nightmare1 element_dream1 element_dream1_collider_trigger
        this._game.getEnvironment().getTriggers().forEach((mesh: Mesh) => {
            if (mesh.name.includes("collider_trigger")) {
                console.log("adding swap collide observable on : ", mesh.name);
                this.setMeshAsSwapMeshTrigger(mesh);
            }
        })
    }

    protected setUpLights(): void {
        // TODO add lights sur les gateaux + lumiere rouge dans le four
    }

    protected setUpSkydome(): void {
        // TODO implement (esce qu'on peut changer de texture losqu'on corrige un element ? )
    }
}