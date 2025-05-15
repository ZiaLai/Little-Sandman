import {AbstractLevel} from "./AbstractLevel";
import {Environment} from "../environment";
import {Game} from "../game";
import {Scene} from "@babylonjs/core";
import {SeparatedTracksMusic} from "../AudioControl/SeparatedTracksMusic";


export class SugarlessBakery extends AbstractLevel{

    constructor(game: Game, id: number) {
        super(game, id);
        this._name = "sugarless_bakery";
        this._ressourceName = "bakery_level_02_01";

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
    }

    public initialize() {

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