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
        this._game.displayLoadingUI();
        // Désactivation de la scène
        this._game.getScene().detachControl();
        await this._game.environment.changeAsset(this._ressourceName).then(()=> {
            // On déplace le joueur à la position de départ
            const position = this._game.getStartPosition();
            this._game.getPlayer().setPosition(position);
            this._loading = false;
            // Réactivation de la scène quand le chargement est fini (évite au joueur de passer sous la map s'il charge avant)
            this._game.hideLoadingUI();
            this._game.getScene().attachControl();
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