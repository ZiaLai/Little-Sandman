import {AbstractLevel} from "./AbstractLevel";
import {Environment} from "../environment";
import {Game} from "../game";


export class Level1_1_1 extends AbstractLevel{

    constructor(game: Game, id: number) {
        super(game, id);
        this._name = "sugarless_bakery";
        this._ressourceName = "bakery_indoors_with_textures";
    }

    protected async load() {
        super.load();
        // todo : charger la musique
    }

    public update() {
        for (let object of this._objects) {
            object.update();
        }
    }

    public initialize() {

    }
}