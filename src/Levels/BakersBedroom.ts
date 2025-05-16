import {AbstractLevel} from "./AbstractLevel";
import {Game} from "../game";
import {ActionManager, FreeCamera, Scene, Tools, Vector3} from "@babylonjs/core";
import {SpriteLoader} from "../SpriteLoader";

enum CameraState {ZOOMING_IN, ZOOMING_OUT, ZOOMED_IN, ZOOMED_OUT }

export class BakersBedroom extends AbstractLevel {
    public static START_POSITION: Vector3 = new Vector3(3.89, 2.45, -7.52);

    private _CAMERA_ZOOM_IN_TARGET: Vector3 = new Vector3(7.2, 4.3, 4);
    private _CAMERA_ZOOM_OUT_TARGET: Vector3 = new Vector3(4, 3.8, 8);

    private _CLOUD_POS: Vector3 = new Vector3(7.95, 4.6, 1.54);

    private _CAMERA_TRIGGER_DISTANCE: number = 6;

    private _cameraState: CameraState = CameraState.ZOOMING_IN;

    private _camera: FreeCamera;

    constructor(game: Game, id: number) {
        super(game, id);
        this._name = "bakers_bedroom";
        this._ressourceName = "baker_bedroom v7";

    }

    protected async load() {
        await super.load();

        this._addTriggers();

        //startPosition === null ? this._game.getPlayer().setPosition(this._startPosition) : this._game.getPlayer().setPosition(startPosition)

        this._finishedLoading();
    }

    initialize(): void {
        this._disablePlayerCamera();

        const camera = new FreeCamera("bakersBedroomCam", this._CAMERA_ZOOM_OUT_TARGET, this._game.getGameScene());

        camera.rotation.y = Tools.ToRadians(180);

        this._camera = camera;

        this._game.getGameScene().activeCamera = camera;


        this._game.getPlayer().setMeshDirection(new Vector3( 0 , 0 , Tools.ToRadians(90) ));

        this._initBaker();

        // const bakersSkeleton = this._game.getGameScene().getSkeletonById("skeleton0");
        //
        // console.assert(bakersSkeleton !== undefined);
        //
        // this._game.getScene().beginAnimation(bakersSkeleton, 0, 60, true);
    }

    update(): void {
        console.log(this._game.getPlayer().camera.getIsActive());

        this._updateCamera();
    }

    private _updateCamera(): void {
        console.log(this._cameraState);

        let distanceToPlayer: number = Vector3.Distance(this._CLOUD_POS, this._game.getPlayerPosition());
        console.log("distance :", distanceToPlayer);

        switch (this._cameraState) {
            case CameraState.ZOOMING_IN:
                this._camera.position = Vector3.Lerp(this._camera.position, this._CAMERA_ZOOM_IN_TARGET, 0.1);
                if (Vector3.Distance(this._camera.position, this._CAMERA_ZOOM_IN_TARGET) < 0.01) this._cameraState = CameraState.ZOOMED_IN;

                if (distanceToPlayer > this._CAMERA_TRIGGER_DISTANCE) this._cameraState = CameraState.ZOOMING_OUT;

                break;

            case CameraState.ZOOMING_OUT:
                this._camera.position = Vector3.Lerp(this._camera.position, this._CAMERA_ZOOM_OUT_TARGET, 0.05);
                if (Vector3.Distance(this._camera.position, this._CAMERA_ZOOM_OUT_TARGET) < 0.01) this._cameraState = CameraState.ZOOMED_OUT;

                if (distanceToPlayer <= this._CAMERA_TRIGGER_DISTANCE) this._cameraState = CameraState.ZOOMING_IN;

                break;

            case CameraState.ZOOMED_OUT:
                if (distanceToPlayer <= this._CAMERA_TRIGGER_DISTANCE) this._cameraState = CameraState.ZOOMING_IN;

                break;

            case CameraState.ZOOMED_IN:
                if (distanceToPlayer > this._CAMERA_TRIGGER_DISTANCE) this._cameraState = CameraState.ZOOMING_OUT;

                break;
        }
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

    private async _initBaker() {
        const baker = await this._game.spriteLoader.loadSprite("baker.glb");

        console.log("baker animationGroups : ", baker.animationGroups);

        // Marche pas TODO : chercher pourquoi il n'y a pas l'anim (export blender ???)
        // baker.animationGroups[0].play(true);
    }

    private _hideCloud() {
        //this._game.getScene().
    }
}