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
}