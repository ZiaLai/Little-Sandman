import {AbstractLevel} from "./AbstractLevel";
import {Game} from "../game";
import {ActionManager, FreeCamera, Scene, Tools, Vector3} from "@babylonjs/core";

export class BakersBedroom extends AbstractLevel {
    private _startPosition: Vector3;

    constructor(game: Game, id: number) {
        super(game, id);
        this._name = "bakers_bedroom";
        this._ressourceName = "baker_bedroom_v5";
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
        this._disablePlayerCamera();

        const camera = new FreeCamera("bakersBedroomCam", new Vector3(4, 3.8, 8), this._game.getGameScene());

        camera.rotation.y = Tools.ToRadians(180);

        this._game.getGameScene().activeCamera = camera;
    }

    update(): void {
        console.log(this._game.getPlayer().camera.getIsActive());
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
        // TODO implement (sun et point de lumiere sur la lampe de chevet)
    }

    protected setUpSkydome(): void {
        // TODO implement
    }
}