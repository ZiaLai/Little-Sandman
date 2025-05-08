import {AbstractLevel} from "./AbstractLevel";
import {Environment} from "../environment";
import {Game} from "../game";
import {Scene} from "@babylonjs/core";


export class SugarlessBakery extends AbstractLevel{

    constructor(game: Game, id: number) {
        super(game, id);
        this._name = "sugarless_bakery";
        this._ressourceName = "bakery_level_02_01";
    }

    protected async load() {
        super.load();
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
    }

    protected setUpLights(): void {
        // TODO add lights sur les gateaux + lumiere rouge dans le four
    }

    protected setUpSkydome(): void {
        // TODO implement (esce qu'on peut changer de texture losqu'on corrige un element ? )
    }
}