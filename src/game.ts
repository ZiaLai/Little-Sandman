import {AbstractLevel} from "./Levels/AbstractLevel";
import {Level1_1_1} from "./Levels/Level1_1_1";
import {Environment} from "./environment";
import {Engine, Scene, TransformNode, Vector3} from "@babylonjs/core";
import {Player} from "./Player";
import {CityLevel} from "./Levels/CityLevel";
import {BakersBedroom} from "./Levels/BakersBedroom";
import {Breach1} from "./Levels/Breach1";
import {SpriteLoader} from "./SpriteLoader";

export class Game {

    public environment: Environment;
    private _scene: Scene;
    private _player: Player;
    spriteLoader: SpriteLoader;

    private _levels: {};

    private _currentLevel : string;
    private _engine: Engine;
    private frameCount: number;

    constructor(engine: Engine, scene: Scene, player: Player, environment: Environment) {
        let levels: AbstractLevel[] = [
            new CityLevel(this, 0),
            new BakersBedroom(this, 1),
            new Level1_1_1(this, 2),
            new Breach1(this, 3)

        ];
        this._levels = {};
        this._makeLevelDictionary(levels);
        console.log(this._levels);

        this._engine = engine;
        this._player = player;
        this.spriteLoader = new SpriteLoader(this);
        this.environment = environment;
        this._scene = scene;
        this._currentLevel = "city";
    }

    private _makeLevelDictionary(levels: AbstractLevel[]): void {
        for (let level of levels) {
            this._levels[level.getName()] = level;
        }
    }

    public update(): void {
        this._levels[this._currentLevel].update();

    }

    public initializeLevel(): void {
        this._levels[this._currentLevel].initialize();
    }

    public async setActiveLevel(name: string): Promise<void> {
        if (Object.keys(this._levels).includes(name)) {
            this._currentLevel = name;
            await this._levels[this._currentLevel].setActive();
        }
        else {
            throw new Error(`The level name "${name}" does not exist`);
        }
    }


    public getPlayer(): Player {
        return this._player;
    }

    public getStartPosition(): Vector3 {
        // console.log("transform nodes : ", this._scene.transformNodes);
        // console.log("Meshes : ", this._scene.meshes);
        // console.log("Game scene :", this._scene);
        const startNode: TransformNode = this._scene.getTransformNodeByName("START POSITION");
        if (startNode === null) {console.log("start position is null")}
        // todo : supprimer la ligne suivante quand Zia aura remonté la start pos (là on spawn sous la ville)
        //return new Vector3(30, 12, 28); // Devant fenetre boulangerie
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

    getEnvironment() {
        return this.environment;
    }

}