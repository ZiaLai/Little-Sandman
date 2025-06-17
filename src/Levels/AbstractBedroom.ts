import {AbstractLevel} from "./AbstractLevel";
import {AbstractMesh, AnimationGroup, FreeCamera, StaticSound, Tools, Vector3} from "@babylonjs/core";
import {Game} from "../game";
import {SugarlessBakery} from "./SugarlessBakery";
import {PlaySound} from "../AudioControl/PlaySound";
import {UIActionButton} from "../util/UIActionButton";
import {SpawnData} from "../SpawnData";
import {CameraState} from "../util/CameraState";
import {CloudState} from "../util/CloudState";

export abstract class AbstractBedroom extends AbstractLevel {
    protected _cloudMeshes: AbstractMesh[];
    protected _cameraState: CameraState = CameraState.ZOOMING_IN;
    protected _cloudState: CloudState = CloudState.HIDDEN;
    private _sleeper: { animationGroups: AnimationGroup[]; mesh: AbstractMesh };
    private _sleeperHit: boolean;
    private _sleeperResourceName: string;
    protected _cloudTimer: number;
    protected fButton: UIActionButton;
    protected _goodNightSound: StaticSound;
    protected _camera: FreeCamera;

    //TODO Adapter les valeurs ci-dessous
    public static START_SPAWN_DATA: SpawnData = new SpawnData(new Vector3(3.89, 2.45, -7.52), new Vector3(0, 0, 0), null);
    protected _CAMERA_ZOOM_IN_TARGET: Vector3 = new Vector3(7.2, 4.3, 4);
    protected _CAMERA_ZOOM_OUT_TARGET: Vector3 = new Vector3(4, 3.8, 8);
    protected _CLOUD_POS: Vector3 = new Vector3(7.95, 4.6, 1.54);
    protected _CAMERA_TRIGGER_DISTANCE: number = 6;
    protected _CLOUD_ANIMATION_DELAY: number = 0.4;

    public constructor(game: Game, id: number, levelResourceName: string, sleeperResourceName: string) {
        super(game, id, levelResourceName);
        this._sleeperResourceName = sleeperResourceName;
        this._cloudTimer = 0;
    }

    public async initialize(): Promise<void> {
        this._disablePlayerCamera();

        const camera = new FreeCamera("bakersBedroomCam", this._CAMERA_ZOOM_OUT_TARGET, this._game.getGameScene());
        //TODO pas sur que la rotation soit toujours la même.
        camera.rotation.y = Tools.ToRadians(180);
        this._camera = camera;
        this._game.getGameScene().activeCamera = camera;

        this._initCloudMeshes();
        this._hideCloud();
        await this._initSleeper();

        await PlaySound.initAudio("https://cdn.jsdelivr.net/gh/ZiaLai/Little-Sandman@main/public/musics/sfx/good_night.ogg", "good_night").then((sound: StaticSound) => {
                this._goodNightSound = sound;
            }
        );

        this.fButton = new UIActionButton("Commencer", "https://cdn.jsdelivr.net/gh/ZiaLai/Little-Sandman@main/public/textures/fButton.png");
        this.fButton.hide();

    }

    protected _initCloudMeshes(): void {
        const cloudSphere1 = this._game.getGameScene().getTransformNodeByName("Sphere").getChildMeshes();
        const cloudSphere2 = this._game.getGameScene().getTransformNodeByName("Sphere.001").getChildMeshes();
        const cloudSphere3 = this._game.getGameScene().getTransformNodeByName("Sphere.002").getChildMeshes();
        const cloud = this._game.getGameScene().getTransformNodeByName("Cube").getChildMeshes();
        const levelPreview = this._game.getGameScene().getMeshByName("Plane");

        this._cloudMeshes = cloudSphere1
            .concat(cloudSphere2)
            .concat(cloudSphere3)
            .concat(cloud)
            .concat([levelPreview]);

        this._cloudState = CloudState.HIDDEN;
    }

    private async _initSleeper(): Promise<void> {
        const sleeper = await this._game.spriteLoader.loadSprite(this._sleeperResourceName);
        this._sleeper = sleeper;
        this._sleeperHit = false;
        //const bakerRoot = this._game.getGameScene().getTransformNodeByName("Armature");
        const bakerRoot = sleeper.mesh;

        bakerRoot.rotationQuaternion = null;

        console.log("bakerRoot", bakerRoot );

        bakerRoot.position = Vector3.Zero();
        bakerRoot.rotation.y = Tools.ToRadians(180);

        //console.log("baker animationGroups : ", baker.animationGroups);

        sleeper.animationGroups[0].play(true);
    }

    public update(): void {
        this._updateCamera();

        this._updateCloud();
    }

    private _updateCamera(): void {
        let distanceToPlayer: number = Vector3.Distance(this._CLOUD_POS, this._game.getPlayerPosition());

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
                if (distanceToPlayer <= this._CAMERA_TRIGGER_DISTANCE && this._cloudState === CloudState.SHOWN) this._cameraState = CameraState.ZOOMING_IN;

                break;

            case CameraState.ZOOMED_IN:
                if (distanceToPlayer > this._CAMERA_TRIGGER_DISTANCE) {
                    this._cameraState = CameraState.ZOOMING_OUT;
                    this.fButton.hide();
                }

                break;
        }
    }

    protected _updateCloud(): void {
        if (!this._cloudMeshes || this._cloudMeshes.length === 0) return;

        switch (this._cloudState) {
            case CloudState.HIDDEN:
                break;
            case CloudState.START_APPEARING:
                this._goodNightSound.play();
                this._cloudTimer = 0;
                this._cloudState = CloudState.APPEARING_1;
                break;
            case CloudState.APPEARING_1:
                this._cloudTimer += this._game.getDeltaTime();
                this._cloudMeshes[0].isVisible = true;
                this._cloudMeshes[1].isVisible = true;
                if (this._cloudTimer > this._CLOUD_ANIMATION_DELAY) {
                    this._cloudState = CloudState.APPEARING_2;
                    this._cloudTimer = 0;
                }
                break;

            case CloudState.APPEARING_2:
                this._cloudTimer += this._game.getDeltaTime();
                this._cloudMeshes[2].isVisible = true;
                this._cloudMeshes[3].isVisible = true;
                if (this._cloudTimer > this._CLOUD_ANIMATION_DELAY) {
                    this._cloudState = CloudState.APPEARING_3;
                    this._cloudTimer = 0;
                }
                break;

            case CloudState.APPEARING_3:
                this._cloudTimer += this._game.getDeltaTime();
                this._cloudMeshes[4].isVisible = true;
                this._cloudMeshes[5].isVisible = true;
                if (this._cloudTimer > this._CLOUD_ANIMATION_DELAY) {
                    this._cloudState = CloudState.APPEARING_4;
                    this._cloudTimer = 0;

                    this._cloudMeshes[6].isVisible = true;
                    this._cloudMeshes[7].isVisible = true;
                    this._cloudMeshes[8].isVisible = true;
                }
                break;

            case CloudState.APPEARING_4:
                this._cloudTimer += this._game.getDeltaTime();
                if (this._cloudTimer > this._CLOUD_ANIMATION_DELAY) {
                    this._cloudState = CloudState.SHOWN;
                    this._cloudTimer = 0;
                }
                break;

            case CloudState.SHOWN:

                if (this._cameraState === CameraState.ZOOMED_IN) {
                    this.fButton.show();

                    if (this._game.getPlayer().getInput().actionKeyDown) {
                        //TODO changer niveau
                        this._game.getApp().changeGameScene("sugarless_bakery", SugarlessBakery.ENTRANCE_SPAWN_DATA);
                        this._cloudState = null;
                    }
                }

                break;
        }
    }

    protected _hideCloud(): void {
        for (const mesh of this._cloudMeshes) {
            if (!mesh) continue;
            mesh.isVisible = false;
        }
    }
}