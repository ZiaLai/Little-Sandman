import {AbstractLevel} from "./AbstractLevel";
import {Game} from "../game";
import {ActionManager, FreeCamera, Scene, Tools, Vector3} from "@babylonjs/core";

export class BakersBedroom extends AbstractLevel {
    public static START_POSITION: Vector3 = new Vector3(3.89, 2.45, -7.52);

    constructor(game: Game, id: number) {
        super(game, id);
        this._name = "bakers_bedroom";
        this._ressourceName = "baker_bedroom_v5";

    }

    protected async load() {
        await super.load();

        this._addTriggers();

        //startPosition === null ? this._game.getPlayer().setPosition(this._startPosition) : this._game.getPlayer().setPosition(startPosition)

        this._finishedLoading();
    }

    initialize(): void {
        this._disablePlayerCamera();

        const camera = new FreeCamera("bakersBedroomCam", new Vector3(4, 3.8, 8), this._game.getGameScene());

        camera.rotation.y = Tools.ToRadians(180);

        this._game.getGameScene().activeCamera = camera;


        this._game.getPlayer().setMeshDirection(new Vector3( 0 , 0 , Tools.ToRadians(90) ));

        // const bakersSkeleton = this._game.getGameScene().getSkeletonById("skeleton0");
        //
        // console.assert(bakersSkeleton !== undefined);
        //
        // this._game.getScene().beginAnimation(bakersSkeleton, 0, 60, true);
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