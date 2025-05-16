import {AbstractLevel} from "./AbstractLevel";
import {Game} from "../game";
import {ActionManager, ExecuteCodeAction, Mesh, Scene, SetValueAction} from "@babylonjs/core";
import {IntroLoopMusic} from "../AudioControl/IntroLoopMusic";
import {BakersBedroom} from "./BakersBedroom";

export class CityLevel extends AbstractLevel{

    constructor(game: Game, id: number) {
        super(game, id);
        this._name = "city";
        this._ressourceName = "city_v20";

        this._music = new IntroLoopMusic(this._game.getScene(), [ ['intro', './musics/city/city_intro.ogg'],
                                                                  ['loop', './musics/city/city_loop.ogg'  ] ]);
    }

    protected async load() {
        await super.load();
        console.log("In city load");
        console.log(this._game.getEnvironment().getTriggers());
        this._addTriggers();
        console.log("after adding triggers");

        this._music.play();

        this._finishedLoading();
    }

    initialize(): void {

    }

    update(): void {
    }

    protected _addTriggers() {
        this._game.getEnvironment().getTriggers().forEach(m => {
            if (m.name.includes("bakers_bedroom")) {
                console.log("adding collide observable on : ", m.name);
                m.actionManager = new ActionManager(this._game.getScene());
                this.setMeshAsChangeLevelTrigger(m, "bakers_bedroom", BakersBedroom.START_POSITION);
            }
        })
    }

    protected setUpLights(): void {
        // TODO sun et reverberes
    }

    protected setUpSkydome(): void {
        // TODO add night sky
    }


}