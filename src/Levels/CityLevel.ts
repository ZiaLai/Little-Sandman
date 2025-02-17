import {AbstractLevel} from "./AbstractLevel";
import {Game} from "../game";

export class CityLevel extends AbstractLevel{

    constructor(game: Game, id: number) {
        super(game, id);
        this._name = "City";
        this._ressourceName = "ville_with_collider_all4";
    }

    protected async load() {
        super.load();
    }

    initialize(): void {

    }

    update(): void {
    }
}