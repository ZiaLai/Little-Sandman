import {AbstractMesh, ActionManager, ExecuteCodeAction, Mesh} from "@babylonjs/core";
import {Game} from "../game";
import {GameObject} from "../GameObjects/GameObject";
import {Music} from "../AudioControl/Music";
import {SeparatedTracksMusic} from "../AudioControl/SeparatedTracksMusic";
import {SpawnData} from "../SpawnData";
import {ClearNightmareParticles} from "../util/ClearNightmareParticles";


export abstract class AbstractLevel {
    protected _name: string;
    protected _levelResourceName: string;
    protected _game: Game;

    protected _music: Music;

    protected _objectsMeshes: {};
    //protected _objects: {} = {}; // Dictionnaire de string name vers une liste de GameObjects
    protected _objects: GameObject[] = [];
    private _id: number;
    private _loading: boolean;
    protected _isNightmareLevel: boolean;
    protected _lastSpawnData: SpawnData;
    protected clearNigthmareParticleEmmitter:ClearNightmareParticles[] = [];

    protected _playWelcomeMonolog: boolean = true;


    protected constructor(game: Game, id: number, levelResourceName: string) {
        this._game = game;
        this._id = id;
        this._isNightmareLevel = false;
        this._levelResourceName = levelResourceName;
    }

    public getRessourceName(): string {
        return this._levelResourceName;
    }

    // Charge la ressource graphique du niveau
    protected async load() {
        console.log("in AstractLevel load");
        this._loading = true;
        //this._game.displayLoadingUI();
        // Désactivation de la scène
        this._game.getScene().detachControl();
        // this._game.getScene().dispose();
        // this._game.setScene(newScene, this._ressourceName);


        // await this._game.environment.changeAsset(this._ressourceName, newScene).then(()=> {
        //     // On déplace le joueur à la position de départ
        //     const position = this._game.getStartPosition();
        //     this._game.getPlayer().setPosition(position);
        //     this._loading = false;
        //
        // });
        this.setUpLights();
    }

    // Méthode appelée au "premier" démarrage du niveau (pas si on revisite le niveau après être allé dans un autre)
    public abstract initialize(): void;

    // Met à jour le niveau à chaque frame
    public abstract update(): void;

    // Rend le niveau actif
    public async setActive() {
        console.log("AbstractLevel, In setActive");
        await this.load();
    }

    protected abstract setUpLights():void;
    // Détruit la ressource du niveau, et ses objets
    public destroy() {
        for (let object of this._objects) {
            object.destroy();
        }

        if (this._music) this._music.destroy();

    }

    getName() {
        return this._name;
    }

    protected _finishedLoading() {
        //this._game.hideLoadingUI();
        this._game.getScene().attachControl();
        console.log("level " + this._name + " loaded");
    }

    protected abstract _addTriggers(): void;

    protected setMeshAsChangeLevelTrigger(mesh: Mesh, destination: string, spawnData?: SpawnData) {
        const outerMesh = this._game.getGameScene().getMeshByName("outer");

        console.log("outerMesh", outerMesh);
        console.assert(outerMesh instanceof AbstractMesh);

        mesh.actionManager.registerAction(
            new ExecuteCodeAction(
                {
                    trigger: ActionManager.OnIntersectionEnterTrigger,
                    parameter: outerMesh
                },
                () => {
                        // Changer le niveau
                        this._game.getApp().changeGameScene(destination, spawnData);
                },
            ),
        );
    }

    protected setMeshAsExecuteActionTrigger(mesh: Mesh, action: () => void): void {
        const outerMesh = this._game.getGameScene().getMeshByName("outer");

        mesh.actionManager.registerAction(
            new ExecuteCodeAction(
                {
                    trigger: ActionManager.OnIntersectionEnterTrigger,
                    parameter: outerMesh
                },
                action
            )
        )
    }

    protected setMeshAsSwapMeshTrigger(mesh: Mesh, triggerEffect: (mesh: Mesh) => void) {
        let shootingSystem = this._game.getApp().getShootingSystem();
        mesh.registerBeforeRender(() => {
            let shootingRay = shootingSystem.getShootingRay();
            if (shootingRay && !shootingSystem.isInteracting()) {
                let hitResult = shootingRay.intersectsMesh(mesh);
                if (hitResult.hit) {
                    triggerEffect(mesh);
                }
            }
        });
    }


    protected _upgradeMusic(): void {
        if (this._music instanceof SeparatedTracksMusic) {
            this._music.upgrade();
        }
    }

    protected _disablePlayerCamera(): void {
        this._game.getPlayer().disableCamera();
    }

    public getObjects() {
        return this._objects
    }
    public isNightmareLevel() {
        return this._isNightmareLevel;
    }
    public abstract doAfterCinematic(): void;

    SetLastSpawnData(spawnData: SpawnData) {
        this._lastSpawnData = spawnData;
    }

    getLastSpawnData(): SpawnData {
        return this._lastSpawnData;
    }
}