import {AbstractLevel} from "./AbstractLevel";
import {Game} from "../game";
import {ActionManager, Color3, HemisphericLight, PointLight, Scene, Vector3} from "@babylonjs/core";

export class BakersBedroom extends AbstractLevel {
    private _startPosition: Vector3;

    constructor(game: Game, id: number) {
        super(game, id);
        this._name = "bakers_bedroom";
        this._ressourceName = "baker_bedroom v4";
        this._startPosition = new Vector3(3.74, 0.91, -3.28);

    }

    protected async load() {
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

    protected setUpLights(): void {
        var light0 = new HemisphericLight("berdroom_light", new Vector3(0, 1, 0), this._game.getGameScene());
        light0.diffuse = new Color3(35/255,67/255,131/255);
        light0.intensity = 0.3;
        // LOUPIote
        const light = new PointLight("loupiote", new Vector3(4, 2.8, 1), this._game.getGameScene());
        light.diffuse = new Color3(222/255,193/255,223/255);
        light.intensity =10;    }

    protected setUpSkydome(): void {

    }
}