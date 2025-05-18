import {AbstractLevel} from "./AbstractLevel";
import {Game} from "../game";
import {Scalar, Tools, TransformNode, Vector3} from "@babylonjs/core";
import {SeparatedTracksMusic} from "../AudioControl/SeparatedTracksMusic";
import {SpawnData} from "../SpawnData";

enum KnifeState {RISING, RISEN, FALLING, FALLEN}


export class SugarlessBakery extends AbstractLevel{

    // todo : décomenter
    // public static ENTRANCE_SPAWN_DATA: SpawnData = new SpawnData(new Vector3(-14.75, 1, 81.14),
    //                                                              new Vector3(0, 180, 0),
    //                                                              1.6);

    // todo : supprimer
    public static ENTRANCE_SPAWN_DATA: SpawnData = new SpawnData(new Vector3(0, 0, 0),
        new Vector3(0, 180, 0),
        1.6);

    private _knife: TransformNode;
    private _knifeState: KnifeState = KnifeState.RISING;
    private _knifeTimer: number = 0;

    constructor(game: Game, id: number) {
        super(game, id);
        this._name = "sugarless_bakery";
        this._ressourceName = "bakery_level_12";

        this._music = new SeparatedTracksMusic(this._game.getScene(), 2,
                                                [   ["piano1",  "./musics/sugarlessBakery/sugarless_bakery-Piano_1.ogg"           ],
                                                    ["piano2",  "./musics/sugarlessBakery/sugarless_bakery-Piano_2.ogg"           ],
                                                    ["flute",   "./musics/sugarlessBakery/sugarless_bakery-Flûte.ogg"             ],
                                                    ["bass",    "./musics/sugarlessBakery/sugarless_bakery-Basse.ogg"             ],
                                                    ["battery", "./musics/sugarlessBakery/sugarless_bakery-Set_de_batterie.ogg"   ],
                                                    ["guitar",  "./musics/sugarlessBakery/sugarless_bakery-Guitare_électrique.ogg"],
                                                    ["violins", "./musics/sugarlessBakery/sugarless_bakery-Violons.ogg"           ]]);
    }

    protected async load() {
        await super.load();
        // todo : charger la musique
        this._music.play();
        // this._upgradeMusic();
    }

    update(): void {
        for (let key in this._objects) {
            for (let object of this._objects[key]) {
                object.update();
            }
        }

        this._updateKnife();

        console.log("player position :", this._game.getPlayerPosition());
    }

    public initialize() {
        this._initKnife();
    }

    private _initKnife() {
        this._knife = this._game.getGameScene().getTransformNodeByName("knife");
        this._knife.rotationQuaternion = null;
        this._knife.position.y -= 5;
    }

    private _updateKnife() {

        console.log("in update knife, state : ", this._knifeState);
        let x_rotation: number;
        switch (this._knifeState) {
            case KnifeState.RISING:
                x_rotation = Scalar.Lerp(this._knife.rotation.x, Tools.ToRadians(90), Math.PI / 128);

                this._knife.rotation = new Vector3(x_rotation, Tools.ToRadians(-180), Tools.ToRadians(-90));
                if (this._knife.rotation.x > Tools.ToRadians(89)) {
                    this._knifeState = KnifeState.FALLING;
                    this._knifeTimer = 0;
                }
                break;

            case KnifeState.RISEN:
                this._knifeTimer += this._game.getDeltaTime();
                if (this._knifeTimer >= 2) this._knifeState = KnifeState.FALLING;
                break;

            case KnifeState.FALLING:
                x_rotation = Scalar.Lerp(this._knife.rotation.x, 0, Math.PI / 32);

                this._knife.rotation = new Vector3(x_rotation, Tools.ToRadians(-180), Tools.ToRadians(-90));
                if (this._knife.rotation.x < Tools.ToRadians(1)) {
                    this._knifeState = KnifeState.FALLEN;
                    this._knifeTimer = 0;
                }
                break;
            case KnifeState.FALLEN:
                this._knifeTimer += this._game.getDeltaTime();
                if (this._knifeTimer > 1) this._knifeState = KnifeState.RISING;
                break;
        }
    }

    protected _addTriggers(): void {
    }

    protected setUpLights(): void {
        // TODO add lights sur les gateaux + lumiere rouge dans le four
    }

    protected setUpSkydome(): void {
        // TODO implement (esce qu'on peut changer de texture losqu'on corrige un element ? )
    }
}