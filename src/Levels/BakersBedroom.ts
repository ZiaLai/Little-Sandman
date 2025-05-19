import {AbstractLevel} from "./AbstractLevel";
import {Game} from "../game";
import {
    AbstractMesh,
    AnimationGroup,
    FreeCamera,
    Tools,
} from "@babylonjs/core";
import {CityLevel} from "./CityLevel";
import {SpawnData} from "../SpawnData";
import {SugarlessBakery} from "./SugarlessBakery";

enum CameraState {ZOOMING_IN, ZOOMING_OUT, ZOOMED_IN, ZOOMED_OUT }

enum CloudState {HIDDEN, START_APPEARING, APPEARING_1, APPEARING_2, APPEARING_3, SHOWN}
import {ActionManager, Color3, HemisphericLight, PointLight, Vector3} from "@babylonjs/core";
import {AllMonolog} from "../data/AllMonolog";

export class BakersBedroom extends AbstractLevel {
    public static START_SPAWN_DATA: SpawnData = new SpawnData(new Vector3(3.89, 2.45, -7.52),
                                                              new Vector3(0, 0, 0),
                                                              null);

    private _CAMERA_ZOOM_IN_TARGET: Vector3 = new Vector3(7.2, 4.3, 4);
    private _CAMERA_ZOOM_OUT_TARGET: Vector3 = new Vector3(4, 3.8, 8);

    private _CLOUD_POS: Vector3 = new Vector3(7.95, 4.6, 1.54);

    private _CAMERA_TRIGGER_DISTANCE: number = 6;

    private _CLOUD_ANIMATION_DELAY: number = 0.2;

    private _cameraState: CameraState = CameraState.ZOOMING_IN;
    private _cloudState: CloudState = CloudState.HIDDEN;
    private _cloudTimer: number = 0;

    private _camera: FreeCamera;


    private _cloudMeshes: AbstractMesh[];
    private _baker: { animationGroups: AnimationGroup[]; mesh: AbstractMesh };

    constructor(game: Game, id: number) {
        super(game, id);
        this._name = "bakers_bedroom";
        this._ressourceName = "baker_bedroom v7";

    }

    protected async load() {
        await super.load();
        this._addTriggers();
        //startPosition === null ? this._game.getPlayer().setPosition(this._startPosition) : this._game.getPlayer().setPosition(startPosition);
        AllMonolog.play(1);
        this._finishedLoading();
    }

    initialize(): void {
        this._disablePlayerCamera();

        const camera = new FreeCamera("bakersBedroomCam", this._CAMERA_ZOOM_OUT_TARGET, this._game.getGameScene());
        camera.rotation.y = Tools.ToRadians(180);
        this._camera = camera;
        this._game.getGameScene().activeCamera = camera;


        this._initCloudMeshes();

        this._hideCloud();

        this._initBaker();

        // const bakersSkeleton = this._game.getGameScene().getSkeletonById("skeleton0");
        //
        // console.assert(bakersSkeleton !== undefined);
        //
        // this._game.getScene().beginAnimation(bakersSkeleton, 0, 60, true);
    }

    private _initCloudMeshes(): void {
        const cloudSphere1 = this._game.getGameScene().getTransformNodeByName("Sphere").getChildMeshes();
        const cloudSphere2 = this._game.getGameScene().getTransformNodeByName("Sphere.001").getChildMeshes();
        const cloudSphere3 = this._game.getGameScene().getTransformNodeByName("Sphere.002").getChildMeshes();
        const cloud = this._game.getGameScene().getTransformNodeByName("Cube").getChildMeshes();
        const levelPreview = this._game.getGameScene().getMeshByName("Plane");

        console.log("cloud", cloud);
        console.log("cloudSphere1", cloudSphere1);

        const allMeshes = cloudSphere1
            .concat(cloudSphere2)
            .concat(cloudSphere3)
            .concat(cloud)
            .concat( [levelPreview] );

        this._cloudMeshes = allMeshes;

        this._cloudState = CloudState.START_APPEARING;
    }

    update(): void {
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
                if (distanceToPlayer > this._CAMERA_TRIGGER_DISTANCE) this._cameraState = CameraState.ZOOMING_OUT;

                break;
        }
    }

    protected _addTriggers() {
        // TODO trigged boulangere (sand)
        //TODO triger nuage (rentrer dans le reve)
        this._game.getEnvironment().getTriggers().forEach(m => {
            if (m.name.includes("exit")) {
                m.actionManager = new ActionManager(this._game.getScene());
                this.setMeshAsChangeLevelTrigger(m, "city", CityLevel.BAKERY_EXIT_SPAWN_DATA);
            }
        })
    }

    protected setUpLights(): void {
        var light0 = new HemisphericLight("berdroom_light", new Vector3(0, 1, 0), this._game.getGameScene());
        light0.diffuse = new Color3(35/255,67/255,131/255);
        light0.intensity = 0.3;
        // LOUPIote
        const loupiote = new PointLight("loupiote", new Vector3(10, 3, 3), this._game.getGameScene());
        loupiote.diffuse = new Color3(222/255,193/255,223/255);
        loupiote.intensity =10;

        const aura = new PointLight("aura_cauchemar", new Vector3(7.4, 4.5, 2), this._game.getGameScene());
        aura.diffuse = new Color3(0.559,0.359,1);
        aura.intensity =10;
    }

    protected setUpSkydome(): void {

    }

    private async _initBaker() {
        const baker = await this._game.spriteLoader.loadSprite("BOULANGERE.glb");

        this._baker = baker;
        //const bakerRoot = this._game.getGameScene().getTransformNodeByName("Armature");
        const bakerRoot = baker.mesh;

        bakerRoot.rotationQuaternion = null;

        console.log("bakerRoot", bakerRoot );

        bakerRoot.position = Vector3.Zero();
        bakerRoot.rotation.y = Tools.ToRadians(180);

        //console.log("baker animationGroups : ", baker.animationGroups);

        baker.animationGroups[0].play(true);
    }

    private _hideCloud() {
        console.log("in hide cloud, cloudMeshes: ", this._cloudMeshes );
        for (const mesh of this._cloudMeshes) {
            if (!mesh) continue;
            mesh.isVisible = false;
        }
    }

    private _updateCloud() {
        if (!this._cloudMeshes || this._cloudMeshes.length === 0) return;

        //console.log("in updateCLoud, state :", this._cloudState, "timer: ", this._cloudTimer);

        switch (this._cloudState) {
            case CloudState.HIDDEN:
                break;
            case CloudState.START_APPEARING:
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
                    this._cloudState = CloudState.SHOWN;
                    this._cloudTimer = 0;

                    this._cloudMeshes[6].isVisible = true;
                    this._cloudMeshes[7].isVisible = true;
                    this._cloudMeshes[8].isVisible = true;
                }
                break;

            case CloudState.SHOWN:

                if (this._game.getPlayer().getInput().actionKeyDown && this._cameraState === CameraState.ZOOMED_IN) {
                    this._game.getApp().changeGameScene("sugarless_bakery", SugarlessBakery.ENTRANCE_SPAWN_DATA);
                    this._cloudState = null;
                }

                break;
        }
    }
}