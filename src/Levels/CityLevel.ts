import {AbstractLevel} from "./AbstractLevel";
import {Game} from "../game";
import {ActionManager, ExecuteCodeAction, Mesh, Scene, SetValueAction} from "@babylonjs/core";

export class CityLevel extends AbstractLevel{

    constructor(game: Game, id: number) {
        super(game, id);
        this._name = "city";
        this._ressourceName = "city_v20";
    }

    protected async load() {
        await super.load();
        console.log("In city load");
        console.log(this._game.getEnvironment().getTriggers());
        this._addTriggers();
        console.log("after adding triggers");

        this._finishedLoading();
    }

    initialize(): void {

    }

    update(): void {
    }

    protected _addTriggers() {
        this._game.getEnvironment().getTriggers().forEach(m => {
            if (m.name.includes("bakers_bedroom")) {
                console.log("adding collide observable on : ", m.name);
                m.actionManager = new ActionManager(this._game.getScene());
                this.setMeshAsChangeLevelTrigger(m, "bakers_bedroom");
            }
        })
    }

    protected setUpLights(): void {
        // TODO sun et reverberes
    }

    protected setUpSkydome(): void {
        // TODO add night sky
    }


}