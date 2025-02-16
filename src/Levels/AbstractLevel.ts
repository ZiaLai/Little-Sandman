import {Scene} from "@babylonjs/core";
import {Environment} from "../environment";
import {Game} from "../game";

export abstract class AbstractLevel {
    protected _name: string;
    protected _ressourceName: string;
    protected _game: Game;

    protected _objects = [];
    private _id: number;
    private _loading: boolean;

    protected constructor(game: Game, id: number) {
        this._game = game;
        this._id = id;
    }

    // Charge la ressource graphique du niveau
    protected async load() {
        this._loading = true;
        await this._game.environment.changeAsset(this._ressourceName).then(()=> {
            // On déplace le joueur à la position de départ
            console.log("in load, before getting startPosition");
            const position = this._game.getStartPosition();
            console.log(position);
            console.log(this._game.getPlayer());
            this._game.getPlayer().setPosition(position);
            console.log("après");
            this._loading = false;
        });


    }

    // Méthode appelée au "premier" démarrage du niveau (pas si on revisite le niveau après être allé dans un autre)
    public abstract initialize(): void;

    // Met à jour le niveau à chaque frame
    public abstract update(): void;

    // Rend le niveau actif
    public setActive() {
        this.load();
    }

    // Détruit la ressource du niveau, et ses objets
    public destroy() {
        for (let object of this._objects) {
            object.destroy();
        }
    }
}