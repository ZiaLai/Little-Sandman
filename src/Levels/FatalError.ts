import {AbstractLevel} from "./AbstractLevel";
import {Game} from "../game";
import {Color3, HemisphericLight, Vector3} from "@babylonjs/core";
import {Conveyor} from "../GameObjects/Conveyor";

export class FatalError extends AbstractLevel {
    private _initPos: boolean = true;
    private _conveyors: Conveyor[];

    constructor(game: Game, id: number) {
        super(game, id);
        this._name = "fatal_error";
        this._ressourceName = "fatal_error_proto";

    }

    protected _addTriggers(): void {
    }

    doAfterCinematic(): void {
    }

    initialize(): void {
        // Les directions des tapis roulants sont 90° vers la gauche par rapport à leur nom (Mauvais référentiel dans le nommage)
        this._conveyors = [
            new Conveyor(Vector3.Left(), this._game, this._game.getGameScene().getMeshByName("conveyorNorth_collider.001")),
            new Conveyor(Vector3.Backward(), this._game, this._game.getGameScene().getMeshByName("conveyorWest_collider")),
            new Conveyor(Vector3.Right(), this._game, this._game.getGameScene().getMeshByName("conveyorSouth_collider.001")),
            new Conveyor(Vector3.Forward(), this._game, this._game.getGameScene().getMeshByName("conveyorEast_collider.002")),
            new Conveyor(Vector3.Left(), this._game, this._game.getGameScene().getMeshByName("conveyorNorth_collider.003")),
            new Conveyor(Vector3.Right(), this._game, this._game.getGameScene().getMeshByName("conveyorSouth_collider.004"))
        ];


    }

    protected setUpLights(): void {
        var light0 = new HemisphericLight("nightLight", new Vector3(0, 1, 0), this._game.getGameScene());
        light0.diffuse = new Color3(0.066,0.082,1); // TODO plus violet ?
        light0.intensity = 2;
    }

    update(): void {
        if (this._initPos) {
            this._game.getPlayer().setPosition(new Vector3(-35, 47, 180));
            this._initPos = false;
        }

        for (const conveyor of this._conveyors) {
            conveyor.update();
        }
    }

}