import {AbstractLevel} from "./AbstractLevel";
import {Game} from "../game";
import {ActionManager, Vector3} from "@babylonjs/core";

export class BakersBedroom extends AbstractLevel {
    private _startPosition: Vector3;

    constructor(game: Game, id: number) {
        super(game, id);
        this._name = "bakers_bedroom";
        this._ressourceName = "baker_bedroom v3";
        this._startPosition = new Vector3(3.74, 0.91, -3.28);

    }

    protected async load(startPosition?: Vector3) {
        await super.load();

        this._addTriggers();


        //startPosition === null ? this._game.getPlayer().setPosition(this._startPosition) : this._game.getPlayer().setPosition(startPosition);
        this._game.getPlayer().setPosition(this._startPosition);

        this._finishedLoading();
    }

    initialize(): void {
    }

    update(): void {
    }

    protected _addTriggers() {
        this._game.getEnvironment().getTriggers().forEach(m => {
            if (m.name.includes("exit")) {
                m.actionManager = new ActionManager(this._game.getScene());
                this.setMeshAsChangeLevelTrigger(m, "city", new Vector3(52, 3, 13));
            }
        })
    }
}