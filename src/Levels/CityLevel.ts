import {AbstractLevel} from "./AbstractLevel";
import {Game} from "../game";
import {
    ActionManager,
    Color3,
    FreeCamera,
    HemisphericLight,
    Mesh, PBRMaterial,
    Sound,
    StandardMaterial,
    Texture,
    PickWithRay, StreamingSound,
    Tools,
    Vector3, StaticSound
} from "@babylonjs/core";
import {AllMonolog} from "../data/AllMonolog";
import {BakersBedroom} from "./BakersBedroom";
import {Music} from "../AudioControl/Music";
import {LoopMusic} from "../AudioControl/LoopMusic";
import {SpawnData} from "../SpawnData";
import {IntroLoopMusic} from "../AudioControl/IntroLoopMusic";
import {CinematicScene} from "../util/CInematicScene";
import {AllCinematicData} from "../data/AllCInematicData";
import {GameState} from "../GameState";
import {PlaySound} from "../AudioControl/PlaySound";


enum CityLocation {SKATEPARK, CITY}

export class CityLevel extends AbstractLevel{

    private _skateparkMusic: Music;
    public static SKATEPARK_SPAWN_DATA: SpawnData = new SpawnData(new Vector3(21.79, 0.84, -376.14),
                                                                  new Vector3(0, 0, 0),
                                                                  -1.557);

    public static BAKERY_EXIT_SPAWN_DATA: SpawnData = new SpawnData(new Vector3(-56, 61.17, -30.75),
                                                                    new Vector3(0, Tools.ToRadians(270), 0),
                                                                    -2.102);

    static FOUNTAIN_SPAWN_DATA: SpawnData = new SpawnData(new Vector3(0,54,0),new Vector3(0,0,0), 0);

    private _subLocation: CityLocation;

    private _playTutorial = true;
    private _skateparkExitTriggerActive: boolean;
    private _skateparkEntranceTriggerActive: boolean;
    private _playCityEntranceCinematic: boolean = true;
    private _sounds: Record<string, StaticSound>;
    private _soundsPlayed: Record<string, boolean>;

    private _platformingTriggersActivation: boolean[];

    private cinematicScene: CinematicScene;
    private cinematicCamera = new FreeCamera("cinematic camera",new Vector3(0,10,-12));


    constructor(game: Game, id: number) {
        super(game, id);
        this._name = "city";
        this._ressourceName = "https://raw.githubusercontent.com/ZiaLai/Little-Sandman/main/public/models/city_v27.glb";

        this._music = new IntroLoopMusic(this._game.getScene(), [ ['intro', 'https://cdn.jsdelivr.net/gh/ZiaLai/Little-Sandman@main/public/musics/city/city_intro.ogg'],
                                                                  ['loop', 'https://cdn.jsdelivr.net/gh/ZiaLai/Little-Sandman@main/public/musics/city/city_loop.ogg'  ] ]);

        this._skateparkMusic = new LoopMusic(this._game.getScene(), ["skatepark", "https://cdn.jsdelivr.net/gh/ZiaLai/Little-Sandman@main/public/musics/skatepark/skatepark_v2.ogg" ]);
    }

    protected async load() {
        await super.load();
        console.log("In city load");
        console.log(this._game.getEnvironment().getTriggers());

        //Correction temporaire texture ZQSD
        const pbr = new PBRMaterial("zqsd", this._game.getGameScene());

        const texture = new Texture("https://cdn.jsdelivr.net/gh/ZiaLai/Little-Sandman@main/public/textures/zqsd_skatepark.png", this._game.getGameScene());
        texture.hasAlpha = true;
        texture.vScale = -1;

        pbr.albedoTexture = texture;
        pbr.albedoColor = new Color3(0.5, 0.5, 0.5);

        pbr.metallic = 0;
        pbr.roughness = 1;

        const zqsd = this._game.getGameScene().getMeshByName("zqsd");
        zqsd.material = pbr;

        // Debug temporaire collider poubelle
        const trash_collider = this._game.getGameScene().getMeshByName("g");
        trash_collider.isVisible = false;
        trash_collider.checkCollisions = true;
        trash_collider.isPickable = true;

        this._initSounds();
        this._addTriggers();
        console.log("after adding triggers");
        this.cinematicScene = new CinematicScene(this._game.getGameScene(), AllCinematicData.getData(2), new Vector3(0, 10, 1), false);
        this.cinematicScene.stop();

        if (this._playWelcomeMonolog) {
            AllMonolog.play(0, this._game);
            this._playWelcomeMonolog = false;
        }


        this._finishedLoading();
    }

    initialize(): void {
        this._game.getGameScene().getMeshByName(" pont collider stairs").name = "pont collider";

        this._skateparkExitTriggerActive = true;

        if (this._playTutorial) {
            this._subLocation = CityLocation.SKATEPARK

            this._skateparkEntranceTriggerActive = false;
            this._skateparkExitTriggerActive = true;

            this._game.getPlayer().setPosition(CityLevel.SKATEPARK_SPAWN_DATA.position);

            this._game.getPlayer().setMeshDirection(CityLevel.SKATEPARK_SPAWN_DATA.direction);

            this._game.getPlayer().camera.setAlpha(CityLevel.SKATEPARK_SPAWN_DATA.alpha);

            this._skateparkMusic.play();

            this._playTutorial = false;
        }
        else {
            this._subLocation = CityLocation.CITY;

            this._skateparkExitTriggerActive = true;
            this._skateparkEntranceTriggerActive = false;
            console.log("HELLO play");
            this._music.play();
        }

        this._initBaker();


    }

    update(): void {

    }

    protected _addTriggers() {
        this._platformingTriggersActivation = [true, false, false, false, false];

            this._game.getEnvironment().getTriggers().forEach((mesh: Mesh) => {
            if (mesh.name.includes("bakers_bedroom")) {
                console.log("adding collide observable on : ", mesh.name);
                mesh.actionManager = new ActionManager(this._game.getScene());

                const sfxAction6 = async () => {
                    this._game.getPlayer().addMovementBlock();
                    this._sounds["on_the_right_track_6"].play();
                    this._game.getPlayer().disableCamera();

                    function sleep(ms) {
                        return new Promise(resolve => setTimeout(resolve, ms));
                    }

                    await sleep(2000);
                    this._game.getApp().changeGameScene("bakers_bedroom", BakersBedroom.START_SPAWN_DATA)
                }

                // const observer = this._sounds["on_the_right_track_6"].onEndedObservable.add(() => {
                //     this._game.getApp().changeGameScene("bakers_bedroom", BakersBedroom.START_SPAWN_DATA);
                //
                //     // Optionnel : retirer l’observer si tu veux éviter des appels multiples plus tard
                //     this._sounds["on_the_right_track_6"].onEndedObservable.remove(observer);
                // });

                this.setMeshAsExecuteActionTrigger(mesh, sfxAction6);
            }

            if (mesh.name.includes("sound_reset")) {

                const resetAction = () => {
                    if (this._platformingTriggersActivation[0]) return;
                    this._platformingTriggersActivation = [true, false, false, false, false];
                }

                mesh.isPickable = false;
                mesh.actionManager = new ActionManager(this._game.getScene());
                this.setMeshAsExecuteActionTrigger(mesh, resetAction);
            }

            if (mesh.name.includes("platforming")) {
                mesh.isPickable = false;

                let i: number;
                if (mesh.name.includes(".001")) {
                    i = 2;
                } else if (mesh.name.includes(".002")) {
                    i = 3;
                } else if (mesh.name.includes(".003")) {
                    i = 4;
                } else if (mesh.name.includes(".004")) {
                    i = 5;
                } else {
                    i = 1;
                }

                const sfxAction = () => {
                    if (! this._platformingTriggersActivation[i - 1]) return;

                    this._sounds["on_the_right_track_" + i].play();

                    this._platformingTriggersActivation[i - 1] = false;
                    this._platformingTriggersActivation[i] = true;

                }

                mesh.actionManager = new ActionManager(this._game.getScene());
                this.setMeshAsExecuteActionTrigger(mesh, sfxAction);
            }

            if (mesh.name.includes("entrance_skatepark")) {
                mesh.isPickable = false;
                mesh.actionManager = new ActionManager(this._game.getScene());
                const entranceAction = () => {
                    if (! this._skateparkEntranceTriggerActive) return;
                    console.assert(this._subLocation === CityLocation.CITY);

                    this._skateparkEntranceTriggerActive = false;
                    this._skateparkExitTriggerActive = true;

                    this._subLocation = CityLocation.SKATEPARK;

                    this._music.destroy();

                    this._skateparkMusic.play();
                }
                this.setMeshAsExecuteActionTrigger(mesh, entranceAction);
            }

            if (mesh.name.includes("exit_skatepark")) {
                mesh.isPickable = false;
                mesh.actionManager = new ActionManager(this._game.getScene());
                const exitAction = async () => {
                    if (!this._skateparkExitTriggerActive) return;
                    console.assert(this._subLocation === CityLocation.SKATEPARK);
                    this._skateparkMusic.destroy();
                    if (this._playCityEntranceCinematic) {
                        await this.introduction();
                    }
                    else {
                        this._firstCityEntrance();
                    }
                }
                this.setMeshAsExecuteActionTrigger(mesh, exitAction);
            }
        })
    }
    private _firstCityEntrance(){
        this._subLocation = CityLocation.CITY;
        if (this._music instanceof IntroLoopMusic) {
            this._music.play(this._playCityEntranceCinematic); // Si on joue la cinématique, on skip l'intro, sinon on la joue
        }
        this._playCityEntranceCinematic = false;
        this._skateparkExitTriggerActive = false;
        this._skateparkEntranceTriggerActive = true;
    }

    protected setUpLights(): void {

        var light0 = new HemisphericLight("nightLight", new Vector3(0, 1, 0), this._game.getGameScene());
        light0.diffuse = new Color3(35/255,67/255,131/255);
        light0.intensity = 0.9;
        // REVERBERES
        // function createPointLight(name: string, position: Vector3, scene: Scene): PointLight {
        //     const light = new PointLight(name, position, scene);
        //     light.diffuse = new Color3(181/255,121/255,27/255);
        //     light.intensity =25;
        //     return light;
        // }
        //
        // const positions:Vector3[] = [
        //     new Vector3(-5.99, 7.40, 8.10),
        //     new Vector3(-9.11, 8.05, 43.99),
        //     new Vector3(-27.15, 8.05,-81.65),
        //     new Vector3(-14.03, 7.40, 0.67),
        //     new Vector3(-10.78, 7.40,8.10),
        //     new Vector3(19.34, 7.40,-0.02),
        //     new Vector3(19.34, 7.40,-18.18),
        //     new Vector3(11.13, 7.40,-26.26),
        //     new Vector3(-6.58, 7.40,-26.26),
        //     new Vector3(-14.85, 7.40,-17.97),
        //     new Vector3(17.36, 6.95,-44.14),
        //     new Vector3(36.97, 6.95,-23.04),
        //     new Vector3(13.12, 6.52,-65.87),
        //     new Vector3(59.13, 6.52,-20.67),
        //     new Vector3(-55, 6.41,5.22),
        //     new Vector3(-8.77, 6.52,-65.87),
        //     new Vector3(-54.42, 6.52,-20.07),
        //     new Vector3(59.40, 6.52,2.89),
        //     new Vector3(13.23, 6.52,48.93),
        //     new Vector3(32.69, 6.52,39.08),
        //     new Vector3(48.10, 6.52,25.60),
        //
        // ];
        //
        // positions.forEach((pos, index) => {
        //     createPointLight(`pointLight${index}`, pos, this._game.getGameScene());
        // });


    }

    public destroy(): void {
        super.destroy();

        if (this._skateparkMusic) this._skateparkMusic.destroy();
    }

    private async introduction(): Promise<void> {
        let cinematic  = AllCinematicData.getData(2);
        console.log("PLAY POULET");
        this.cinematicScene.play();
        //this._game.setGamestate(GameState.DO_NOTHING); // TODO : stopper le joueur proprement ?
        this._game.getPlayer().addMovementBlock();
        this._game.getScene().activeCamera = new FreeCamera("cinematic camera",new Vector3(0,10,-12));
        this._game.getPlayer().disableCamera();
        this._game.switchPlayerLight(0);
        this._game.setGamestate(GameState.CINEMATIC);
        this._game.setCurrentCinematic(cinematic);


    }

    doAfterCinematic(): void {
        this._game.getPlayer().removeMovementBlock();
        this._firstCityEntrance();
        this.cinematicScene.stop();
    }

    private async _initBaker() {
        const baker = await this._game.spriteLoader.loadSprite("https://cdn.jsdelivr.net/gh/ZiaLai/Little-Sandman@main/public/models/BOULANGERE.glb");

        //const bakerRoot = this._game.getGameScene().getTransformNodeByName("Armature");
        const bakerRoot = baker.mesh;

        const armature = bakerRoot.getChildTransformNodes()[0];

        bakerRoot.rotationQuaternion = null;
        armature.rotationQuaternion = null;

        armature.position = new Vector3(-42, 63.6, 34.5);
        armature.rotation.y = Tools.ToRadians(90);
        armature.rotation.x = Tools.ToRadians(90);

        baker.animationGroups[0].play(true);
    }

    private _initSounds() {
        const soundsNames = [];

        for (let i=1; i < 7; i++) {
            soundsNames.push("on_the_right_track_" + i);
        }
        const soundsURL = [
            "https://cdn.jsdelivr.net/gh/ZiaLai/Little-Sandman@main/public/musics/sfx/OnTheRightTrack/on_the_right_track_1.ogg",
            "https://cdn.jsdelivr.net/gh/ZiaLai/Little-Sandman@main/public/musics/sfx/OnTheRightTrack/on_the_right_track_2.ogg",
            "https://cdn.jsdelivr.net/gh/ZiaLai/Little-Sandman@main/public/musics/sfx/OnTheRightTrack/on_the_right_track_3.ogg",
            "https://cdn.jsdelivr.net/gh/ZiaLai/Little-Sandman@main/public/musics/sfx/OnTheRightTrack/on_the_right_track_4.ogg",
            "https://cdn.jsdelivr.net/gh/ZiaLai/Little-Sandman@main/public/musics/sfx/OnTheRightTrack/on_the_right_track_5.ogg",
            "https://cdn.jsdelivr.net/gh/ZiaLai/Little-Sandman@main/public/musics/sfx/OnTheRightTrack/on_the_right_track_6.ogg"
        ];


        this._sounds = {}

        for (let i=0; i < 6; i++) {
            PlaySound.initAudio(soundsURL[i], soundsNames[i]).then((sound: StaticSound) => {
                this._sounds[soundsNames[i]] = sound;
            });
        }

        this._soundsPlayed = {};

        for (const name of Object.keys(this._sounds)) {
            this._soundsPlayed[name] = false;
        }
    }
}