import {AbstractMesh, ActionManager, ExecuteCodeAction, Mesh, Scene, Vector3} from "@babylonjs/core";
import {Environment} from "../environment";
import {Game} from "../game";
import {GameObject} from "../GameObjects/GameObject";


export abstract class AbstractLevel {
    protected _name: string;
    protected _ressourceName: string;
    protected _game: Game;

    protected _objectsMeshes: {};
    protected _objects: {} = {}; // Dictionnaire de string name vers une liste de GameObjects
    private _id: number;
    private _loading: boolean;

    protected constructor(game: Game, id: number) {
        this._game = game;
        this._id = id;
    }

    public getRessourceName(): string {
        return this._ressourceName;
    }

    // Charge la ressource graphique du niveau
    protected async load() {
        console.log("in AstractLevel load");
        this._loading = true;
        this._game.displayLoadingUI();
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
        this.setUpSkydome();

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
    protected abstract setUpSkydome():void;
    // Détruit la ressource du niveau, et ses objets
    public destroy() {

        const root = this._game.getScene().getTransformNodeById("__root__"); // Todo : débugguer ce truc
        console.log("root", root);
        root?.dispose();

        for (let key in this._objects) {
            for (let object of this._objects[key]) {
                object.destroy();
            }

        }
    }

    getName() {
        return this._name;
    }

    protected _finishedLoading() {
        this._game.hideLoadingUI();
        this._game.getScene().attachControl();
        console.log("level " + this._name + " loaded");
    }

    protected abstract _addTriggers(): void;

    protected setMeshAsChangeLevelTrigger(m: Mesh, destination: string, playerPosition?: Vector3) {
        const outerMesh = this._game.getGameScene().getMeshByName("outer");

        console.log("outerMesh", outerMesh);
        console.assert(outerMesh instanceof AbstractMesh);

        m.actionManager.registerAction(
            new ExecuteCodeAction(
                {
                    trigger: ActionManager.OnIntersectionEnterTrigger,
                    parameter: outerMesh
                },
                () => {
                        // Changer le niveau
                        this._game.getApp().changeGameScene(destination, playerPosition);
                },
            ),
        );
    }
}