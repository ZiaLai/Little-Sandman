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

export class Game {

    private _app: App;

    private _player: Player;
    spriteLoader: SpriteLoader;

    private _levels: {};

    private _currentLevel : string;

    private frameCount: number;
    private _state : GameState;
    private cinematicTimer : number;
    private currentCinematic : CinematicData;

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
        //TODO completer
        // TODO c'est ici qu'on doit "ecouter" si on appuie sur le bouton qui demmare le menu pause ?
        switch (this._state){
            case GameState.PLAYING:this._levels[this._currentLevel].update();
                break;

            case GameState.PAUSE: this.pauseMenu();break; // TODO afficher menu pause;
                // TODO capter l'event qui permet de passer en pause

            case GameState.CINEMATIC: this.playCinematic();break;

        }


    }
    public playCinematic(): void {
        if (this.cinematicTimer< this.currentCinematic.getDuration()){
            this.getScene().render();
            this.cinematicTimer+= this.getScene().deltaTime/1000;
        }
        else {
            // TODO détruire la cinematique ?
        }
    }
    public pauseMenu():void{
        // TODO implementer
        const advancedTexture =AdvancedDynamicTexture.CreateFullscreenUI("UI");

        const pauseMenu = new Rectangle();
        // TODO mettre image
        pauseMenu.width = "80%";
        pauseMenu.height = "80%";
        pauseMenu.thickness = 0;
        pauseMenu.background = "#222";
        pauseMenu.isVisible = false;
        advancedTexture.addControl(pauseMenu);

    // Créer un StackPanel pour les boutons
        const buttonPanel = new StackPanel();
        buttonPanel.width = "100%";
        buttonPanel.isVertical = true;
        pauseMenu.addControl(buttonPanel);

        // Fonction pour créer des boutons cohérents
        function createMenuButton(text, callback) {
            const button = Button.CreateSimpleButton("btn_" + text, text);
            button.width = "80%";
            button.height = "50px";
            button.color = "white";
            button.cornerRadius = 10;
            button.background = "#444";
            button.paddingTop = "10px";
            button.onPointerUpObservable.add(callback);
            return button;
        }

    // Ajouter des boutons au panel
        buttonPanel.addControl(createMenuButton("Reprendre", () => {
            pauseMenu.isVisible = false;
            console.log("Reprendre");
        }));

        buttonPanel.addControl(createMenuButton("Retourner au point de départ", () => {
            console.log("Options cliquées");
        }));

        buttonPanel.addControl(createMenuButton("Quitter", () => {
            console.log("Quitter cliqué");
        }));
        // TODO si pas dans un niveau, ajouter "recommencer" et " retour à la ville"
    }

    public initializeLevel(): void {
        this._levels[this._currentLevel].initialize();
    }

    public async setActiveLevel(name: string, playerPosition?: Vector3): Promise<void> {

        console.assert(Object.keys(this._levels).includes(name), `The level name "${name}" does not exist`);

        //let newScene = new Scene(this._engine);
        // this._scene.dispose();

        this._levels[this._currentLevel].destroy();

        this._currentLevel = name;

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

    set gamestate(GameState) {this._state = GameState;}
    set setCurrentCinematic(cinematic ){this.currentCinematic = cinematic;}
}