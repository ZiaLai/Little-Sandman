import {AbstractLevel} from "./AbstractLevel";
import {Game} from "../game";
import {Color3, HemisphericLight, PointLight, Scene, Vector3} from "@babylonjs/core";
import {AdvancedDynamicTexture, Control, Image} from "@babylonjs/gui";
import {Scalar, Tools, TransformNode} from "@babylonjs/core";
import {SeparatedTracksMusic} from "../AudioControl/SeparatedTracksMusic";
import {SpawnData} from "../SpawnData";
import {BreadSlicePlatform} from "../GameObjects/BreadSlicePlatform";

enum KnifeState {RISING, RISEN, FALLING, FALLEN}


export class SugarlessBakery extends AbstractLevel{
    nb_nightmare_found = 0;

    // todo : décomenter
    // public static ENTRANCE_SPAWN_DATA: SpawnData = new SpawnData(new Vector3(-14.75, 1, 81.14),
    //                                                              new Vector3(0, 180, 0),
    //                                                              1.6);

    // todo : supprimer
    public static ENTRANCE_SPAWN_DATA: SpawnData = new SpawnData(new Vector3(0, 0, 0),
        new Vector3(0, 180, 0),
        1.6);

    private _knife: TransformNode;
    private _knifeState: KnifeState = KnifeState.RISING;
    private _knifeTimer: number = 0;
    private _knifeCanCreateBreadSlicePlatform: boolean = true;
    private _breadSlicePlatformTransformNode: TransformNode;

    constructor(game: Game, id: number) {
        super(game, id);
        this._name = "sugarless_bakery";
        this._ressourceName = "bakery_level_12";

        this._music = new SeparatedTracksMusic(this._game.getScene(), 2,
                                                [   ["piano1",  "./musics/sugarlessBakery/sugarless_bakery-Piano_1.ogg"           ],
                                                    ["piano2",  "./musics/sugarlessBakery/sugarless_bakery-Piano_2.ogg"           ],
                                                    ["flute",   "./musics/sugarlessBakery/sugarless_bakery-Flûte.ogg"             ],
                                                    ["bass",    "./musics/sugarlessBakery/sugarless_bakery-Basse.ogg"             ],
                                                    ["battery", "./musics/sugarlessBakery/sugarless_bakery-Set_de_batterie.ogg"   ],
                                                    ["guitar",  "./musics/sugarlessBakery/sugarless_bakery-Guitare_électrique.ogg"],
                                                    ["violins", "./musics/sugarlessBakery/sugarless_bakery-Violons.ogg"           ]]);
    }

    protected async load() {
        await super.load();
        // todo : charger la musique
        this.setUpGui();
        this._music.play();
        // this._upgradeMusic();
    }

    update(): void {

        for (const object of this._objects) {
            object.update();
        }

        this._updateKnife();

        // console.log("player position :", this._game.getPlayerPosition());
    }

    public initialize() {
        const breadSlice: TransformNode = this._game.getGameScene().getTransformNodeByName("bread_slice");
        breadSlice.getChildMeshes().forEach(mesh => {
            mesh.isVisible = false;
        })

        this._initKnife();

        this._breadSlicePlatformTransformNode = this._game.getGameScene().getTransformNodeByName("bread_slice");
        console.assert(this._breadSlicePlatformTransformNode);

        //this._objects["bread_slice"] = [];
    }

    private _initKnife() {
        this._knife = this._game.getGameScene().getTransformNodeByName("knife");
        this._knife.rotationQuaternion = null;
        this._knife.position.y -= 5;

        //console.log("GAME OBJECTS :", this._objects);
    }

    private _updateKnife() {

        //console.log("in update knife, state : ", this._knifeState);
        let x_rotation: number;
        switch (this._knifeState) {
            case KnifeState.RISING:
                x_rotation = Scalar.Lerp(this._knife.rotation.x, Tools.ToRadians(90), Math.PI / 128);

                this._knife.rotation = new Vector3(x_rotation, Tools.ToRadians(-180), Tools.ToRadians(-90));
                if (this._knife.rotation.x > Tools.ToRadians(89)) {
                    this._knifeState = KnifeState.RISEN;
                    this._knifeTimer = 0;
                    this._knifeCanCreateBreadSlicePlatform = true;
                }
                break;

            case KnifeState.RISEN:
                this._knifeTimer += this._game.getDeltaTime();
                if (this._knifeTimer >= 1 && this._knifeCanCreateBreadSlicePlatform) {
                    this._knifeCanCreateBreadSlicePlatform = false;


                    this._objects.push(new BreadSlicePlatform(this._game, this._breadSlicePlatformTransformNode, new Vector3(21.2, 21.65, 26.81)))
                }
                if (this._knifeTimer >= 2) this._knifeState = KnifeState.FALLING;
                break;

            case KnifeState.FALLING:
                x_rotation = Scalar.Lerp(this._knife.rotation.x, 0, Math.PI / 32);

                this._knife.rotation = new Vector3(x_rotation, Tools.ToRadians(-180), Tools.ToRadians(-90));
                if (this._knife.rotation.x < Tools.ToRadians(1)) {
                    this._knifeState = KnifeState.FALLEN;
                    this._knifeTimer = 0;
                }
                break;
            case KnifeState.FALLEN:
                this._knifeTimer += this._game.getDeltaTime();
                if (this._knifeTimer > 1) this._knifeState = KnifeState.RISING;
                break;
        }
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