import {AbstractLevel} from "./AbstractLevel";
import {Game} from "../game";
import {ActionManager, ExecuteCodeAction, SetValueAction} from "@babylonjs/core";

export class CityLevel extends AbstractLevel{

    constructor(game: Game, id: number) {
        super(game, id);
        this._name = "city";
        this._ressourceName = "city_v4";
    }

    protected async load() {
        await super.load();
        console.log("In city load");
        console.log(this._game.getEnvironment().getTriggers());
        this._game.getEnvironment().getTriggers().forEach(m => {
            if (m.name.includes("bakers_bedroom")) {
                console.log("adding collide observable on : ", m.name);
                m.actionManager = new ActionManager(this._game.getScene());
                m.actionManager.registerAction(
                    new ExecuteCodeAction(
                        {
                            trigger: ActionManager.OnIntersectionEnterTrigger,
                            parameter: this._game.getScene().getMeshByName("outer")
                        },
                        () => {
                            this._game.setActiveLevel("bakers_bedroom");
                            console.log("trigger collision");
                        },
                    ),
                );
            }
        })


    }

    initialize(): void {

    }

    update(): void {
    }
}