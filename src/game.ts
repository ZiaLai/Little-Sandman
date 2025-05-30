import {AbstractLevel} from "./Levels/AbstractLevel";
import {SugarlessBakery} from "./Levels/SugarlessBakery";
import {TransformNode, Vector3} from "@babylonjs/core";
import {Player} from "./Player";
import {CityLevel} from "./Levels/CityLevel";
import {BakersBedroom} from "./Levels/BakersBedroom";
import {Breach1} from "./Levels/Breach1";
import {SpriteLoader} from "./SpriteLoader";
import {App} from "./app";
import {GameState} from "./GameState";
import {AdvancedDynamicTexture, Button, Rectangle, StackPanel} from "@babylonjs/gui";
import {GameObject} from "./GameObjects/GameObject";
import {CinematicData} from "./data/CinematicData";
import {PauseMenu} from "./util/PauseMenu";
import {SpawnData} from "./SpawnData";

export class Game {

    private _app: App;
    private _pauseMenu: PauseMenu;
    private _player: Player;
    spriteLoader: SpriteLoader;

    private _levels: {};

    private _currentLevel : string;

    private frameCount: number;
    private _state : GameState;z
    private cinematicTimer : number = 0;
    private currentCinematic : CinematicData;
    private createPauseMenu: boolean = true;

    constructor(app: App) {
        this._app = app;
        this._state = GameState.PLAYING;

        let levels: AbstractLevel[] = [
            new CityLevel(this, 0),
            new BakersBedroom(this, 1),
            new SugarlessBakery(this, 2),
            new Breach1(this, 3)

        ];

        this._levels = {};
        this._makeLevelDictionary(levels);
        console.log(this._levels);

        this.spriteLoader = new SpriteLoader(this);

        this._currentLevel = "city";
    }

    private _makeLevelDictionary(levels: AbstractLevel[]): void {
        for (let level of levels) {
            this._levels[level.getName()] = level;
        }
    }

    public update(): void {
        switch (this._state){
            case GameState.PLAYING:
                this.getPlayer().getInput().setLockPointer(true);
                this._levels[this._currentLevel].update();
                if (this.getPlayer().getInput().pauseKeyDown){
                    this._state = GameState.ENTERING_PAUSE;
                    this.getPlayer().addMovementBlock();
                    //this.getPlayer().disableCamera();
                }
                break;

            case GameState.ENTERING_PAUSE:
                this.getPlayer().getInput().setLockPointer(false);
                this.getPlayer().getInput().exitPointerLock();
                this.displayPauseMenu();
                if (! this.getPlayer().getInput().pauseKeyDown){
                    this._state = GameState.PAUSE;
                }
                break;

            case GameState.PAUSE:
                this.getPlayer().getInput().setLockPointer(false);
                if (this.getPlayer().getInput().pauseKeyDown){
                    this._state = GameState.UNPAUSE;
                }
                break;

            case GameState.UNPAUSE:

                if (! this.getPlayer().getInput().pauseKeyDown){
                    this._state = GameState.PLAYING;
                    this._pauseMenu.hide();

                    this.getPlayer().getInput().requestPointerLock();
                    this.getPlayer().removeMovementBlock();
                    //this.getPlayer().camera.enable(this.getScene());
                }

                break;

            case GameState.CINEMATIC:
                this.playCinematic();
                break;

        }


    }
    public getGameState() : GameState {return this._state;}
    public switchPlayerLight(intensity: number): void {
        const light =  this.getScene().getLightByName("Area");
        light.intensity = intensity;
    }
    public playCinematic(): void {
        if (!this.currentCinematic){
            this._state = GameState.PLAYING;
            return ;
        }
        if (this.cinematicTimer< this.currentCinematic.getDuration()){
            console.log("in cinematic ");
            this.getScene().render();
            this.cinematicTimer+= this.getDeltaTime();
        }
        else {
            this._state = GameState.PLAYING;
            this.getPlayer().camera.enable(this.getScene());
            this.switchPlayerLight(27);
            this._levels[this._currentLevel].doAfterCinematic();
           // this.currentCinematic.stop();
            // TODO détruire la cinematique ?
        }
    }

    public displayPauseMenu():void{
        // if (this.createPauseMenu) {
        //     this._pauseMenu = new PauseMenu(this);
        //     this.createPauseMenu = false;
        // }
        // else {
        //     this._pauseMenu.show();
        // }
        this._pauseMenu.show();
        // TODO si pas dans un niveau, ajouter "recommencer" et " retour à la ville"
    }

    public initializeLevel(): void {
        this._levels[this._currentLevel].initialize();
        this.createPauseMenu = true;
    }

    public async setActiveLevel(name: string, playerPosition?: Vector3): Promise<void> {

        console.assert(Object.keys(this._levels).includes(name), `The level name "${name}" does not exist`);

        //let newScene = new Scene(this._engine);
        // this._scene.dispose();

        this._levels[this._currentLevel].destroy();

        this._currentLevel = name;

        this._pauseMenu = new PauseMenu(this);

        await this._levels[this._currentLevel].setActive();

        //this._player.reset();
        // if (playerPosition !== undefined) {
        //     this._player.setPosition(playerPosition);
        // }

        }


    public getPlayer(): Player {
        return this._app.getPlayer();
    }

    public getStartPosition(): Vector3 {
        // console.log("transform nodes : ", this._scene.transformNodes);
        // console.log("Meshes : ", this._scene.meshes);
        // console.log("Game scene :", this._scene);
        const startNode: TransformNode = this._app.getScene().getTransformNodeByName("START POSITION");
        if (startNode === null) {console.log("start position is null")}
        // todo : supprimer la ligne suivante quand Zia aura remonté la start pos (là on spawn sous la ville)
        //return new Vector3(30, 12, 28); // Devant fenetre boulangerie
        return new Vector3(0, 12, 0);
        console.log("START POSITION", startNode.getAbsolutePosition());
        return startNode !== null ? startNode.getAbsolutePosition() : new Vector3(0, 30, 0);
    }

    public displayLoadingUI() {
        this._app.getEngine().displayLoadingUI();
    }

    public hideLoadingUI(): void {
        this._app.getEngine().hideLoadingUI();
    }

    public getScene() {
        return this._app.getScene();
    }

    public getGameScene() {
        return this._app.getGameScene();
    }

    // public setScene(scene: Scene, ressourceName: string) {
    //     this._scene = scene;
    //     this._app.changeGameScene(ressourceName);
    // }

    public setPlayer(player: Player) {
        this._player = player;
    }

    getEnvironment() {
        return this._app.getEnvironment();
    }

    getApp() {
        return this._app;
    }


    getLevelRessourceNameByLevelName(levelName: string) {
        for (const value of Object.values(this._levels)) {
            const level = value as AbstractLevel;
            if (level.getName() === levelName) return level.getRessourceName();
        }
        return null;
    }

    public getPlayerPosition(): Vector3 {
        return this.getPlayer().mesh.position;
    }

    public getDeltaTime(): number {
        return this.getPlayer().getDeltaTime();
    }

    public destroyGameObject(gameObject: GameObject) {
        const index: number = this._levels[this._currentLevel].getObjects().indexOf(gameObject);
        if (index !== -1) {
            this._levels[this._currentLevel].getObjects().splice(index, 1);
        }

    }

    public getCurrentLevel(): AbstractLevel {
        return this._levels[this._currentLevel];
    }

    public  setGamestate(GameState) {this._state = GameState;}
    public  setCurrentCinematic(cinematic ){this.currentCinematic = cinematic;}

    spawnPlayerAt(spawnData: SpawnData) {
        if (spawnData === undefined) {
            spawnData = SpawnData.DEFAULT_VALUE;

        }
        this.getPlayer().setPosition(spawnData.position);
        this.getPlayer().setMeshDirection(spawnData.direction);
        if (spawnData.alpha) this.getPlayer().camera.setAlpha(spawnData.alpha);

        this.getCurrentLevel().SetLastSpawnData(spawnData);
    }
}