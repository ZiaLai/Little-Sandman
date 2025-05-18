import {AbstractLevel} from "./AbstractLevel";
import {Game} from "../game";
import {ActionManager, ExecuteCodeAction, Mesh, Scene, SetValueAction, Tools, Vector3} from "@babylonjs/core";
import {IntroLoopMusic} from "../AudioControl/IntroLoopMusic";
import {BakersBedroom} from "./BakersBedroom";
import {Music} from "../AudioControl/Music";
import {LoopMusic} from "../AudioControl/LoopMusic";
import {SpawnData} from "../SpawnData";

export class CityLevel extends AbstractLevel{

    private _skateparkMusic: Music;
    public static SKATEPARK_SPAWN_DATA: SpawnData = new SpawnData(new Vector3(20, 1, -378),
                                                                  new Vector3(0, 0, 0),
                                                                  -1.557);

    public static BAKERY_EXIT_SPAWN_DATA: SpawnData = new SpawnData(new Vector3(-56, 13.55, -30.75),
                                                                    new Vector3(0, Tools.ToRadians(270), 0),
                                                                    -2.102);

    private _playTutorial = true;

    constructor(game: Game, id: number) {
        super(game, id);
        this._name = "city";
        this._ressourceName = "city";

        this._music = new IntroLoopMusic(this._game.getScene(), [ ['intro', './musics/city/city_intro.ogg'],
                                                                  ['loop', './musics/city/city_loop.ogg'  ] ]);

        this._skateparkMusic = new LoopMusic(this._game.getScene(), ["skatepark", "./musics/skatepark/skatepark_v2.ogg" ]);

        // this._skateparkMusic = new LoopMusic(this._game.)
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

        if (this._playTutorial) {
            this._game.getPlayer().setPosition(CityLevel.SKATEPARK_SPAWN_DATA.position);

            this._game.getPlayer().setMeshDirection(CityLevel.SKATEPARK_SPAWN_DATA.direction);

            this._game.getPlayer().camera.setAlpha(CityLevel.SKATEPARK_SPAWN_DATA.alpha);

            this._skateparkMusic.play();

            this._playTutorial = false;
        }
        else {
            this._music.play();
        }



        //this._game.getPlayer().setPosition( new Vector3(0, -2, 0));

        console.log("player position :", this._game.getPlayer().mesh.position);
    }

    update(): void {
        console.log(this._game.getPlayerPosition());
    }

    protected _addTriggers() {
        this._game.getEnvironment().getTriggers().forEach(m => {
            if (m.name.includes("bakers_bedroom")) {
                console.log("adding collide observable on : ", m.name);
                m.actionManager = new ActionManager(this._game.getScene());
                this.setMeshAsChangeLevelTrigger(m, "bakers_bedroom", BakersBedroom.START_SPAWN_DATA);
            }
        })
    }

    protected setUpLights(): void {
        // TODO sun et reverberes
    }

    protected setUpSkydome(): void {
        // TODO add night sky
    }

    public destroy(): void {
        super.destroy();

        if (this._skateparkMusic) this._skateparkMusic.destroy();
    }


}