import {AbstractLevel} from "./AbstractLevel";
import {Environment} from "../environment";
import {Game} from "../game";
import {Color3, HemisphericLight, PointLight, Scene, Vector3} from "@babylonjs/core";
import {AdvancedDynamicTexture, Control, Image} from "@babylonjs/gui";


export class SugarlessBakery extends AbstractLevel{
    nb_nightmare_found = 0;
    constructor(game: Game, id: number) {
        super(game, id);
        this._name = "sugarless_bakery";
        this._ressourceName = "bakery_level_11";
    }

    protected async load() {
        super.load();
        // todo : charger la musique
        this.setUpGui();
    }

    update(): void {
        for (let key in this._objects) {
            for (let object of this._objects[key]) {
                object.update();
            }
        }
    }

    public initialize() {

    }

    protected _addTriggers(): void {
    }

    protected setUpLights(): void {
        // TODO add lights sur les gateaux + lumiere rouge dans le four
        var light0 = new HemisphericLight("nightLight", new Vector3(0, 1, 0), this._game.getGameScene());
        light0.diffuse = new Color3(0.066,0.082,1); // TODO plus violet ? z
        light0.intensity = 2;
        //---FOUR---
        const light = new PointLight("four", new Vector3(-8, 25, -90), this._game.getGameScene());// TODO CHANGE POS
        light.diffuse = new Color3(1,0,0);
        light.intensity =2000;
        // const cake1 = new PointLight("cake 1", new Vector3(4, 2.8, 1), this._game.getGameScene());
        // cake1.diffuse = new Color3(0.585, 1, 0.573);
        // cake1.intensity =10;

    }

    protected setUpSkydome(): void {
        // TODO implement (esce qu'on peut changer de texture losqu'on corrige un element ? )
    }
    private setUpGui(): void {
        const ui = AdvancedDynamicTexture.CreateFullscreenUI("UI");

        const compteur = new Image("compteur", "/textures/compteur-"+this.nb_nightmare_found+".png");
        compteur.width = "25%";
        compteur.height = "25%";
        compteur.stretch = Image.STRETCH_UNIFORM;
        compteur.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

        compteur.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        compteur.paddingLeft = 40;
        ui.addControl(compteur);

    }
}