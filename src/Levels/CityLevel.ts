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
        this._game.getEnvironment().getTriggers().forEach((mesh: Mesh) => {
            if (mesh.name.includes("bakers_bedroom")) {
                console.log("adding collide observable on : ", mesh.name);
                mesh.actionManager = new ActionManager(this._game.getScene());
                this.setMeshAsChangeLevelTrigger(mesh, "bakers_bedroom");
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