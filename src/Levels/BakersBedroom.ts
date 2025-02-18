import {AbstractLevel} from "./AbstractLevel";
import {Game} from "../game";

export class BakersBedroom extends AbstractLevel {
    constructor(game: Game, id: number) {
        super(game, id);
        this._name = "bakers_bedroom";
        this._ressourceName = "baker_bedroom";

    }

    protected async load() {
        super.load();
    }

    initialize(): void {
    }

    update(): void {
    }

}