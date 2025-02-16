import {AbstractLevel} from "./Levels/AbstractLevel";
import {Level1_1_1} from "./Levels/Level1_1_1";
import {Environment} from "./environment";
import {Engine, Scene, TransformNode, Vector3} from "@babylonjs/core";
import {Player} from "./Player";
import {CityLevel} from "./Levels/CityLevel";

export class Game {

    public environment: Environment;
    private _scene: Scene;
    private _player: Player;

    private levels: AbstractLevel[] = [
        new CityLevel(this, 0),
        new Level1_1_1(this, 1)
    ];
    private _currentLevel : number;
    private _engine: Engine;

    constructor(engine: Engine, scene: Scene, player: Player, environment: Environment) {
        this._engine = engine;
        this._player = player;
        this.environment = environment;
        this._scene = scene;
        this._currentLevel = 0;
    }

    public update(): void {
        this.levels[this._currentLevel].update();
    }

    public initializeLevel(): void {
        this.levels[this._currentLevel].initialize();
    }

    public setActiveLevel(levelIndex: number): void {
        this._currentLevel = levelIndex;
        this.levels[this._currentLevel].setActive();
    }

    public getPlayer(): Player {
        return this._player;
    }

    public getStartPosition(): Vector3 {
        console.log("transform nodes : ", this._scene.transformNodes);
        console.log("Meshes : ", this._scene.meshes);
        console.log("Game scene :", this._scene);
        const startNode: TransformNode = this._scene.getTransformNodeByName("START POSITION");
        if (startNode === null) {console.log("start position is null")}
        // todo : supprimer la ligne suivante quand Zia aura remonté la start pos (là on spawn sous la ville)
        return new Vector3(0, 12, 0);
        return startNode !== null ? startNode.getAbsolutePosition() : new Vector3(0, 30, 0);
    }

    public displayLoadingUI() {
        this._engine.displayLoadingUI();
    }

    public hideLoadingUI(): void {
        this._engine.hideLoadingUI();
    }

    public getScene() {
        return this._scene;
    }
}