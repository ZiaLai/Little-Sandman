import {AbstractLevel} from "./AbstractLevel";
import {Game} from "../game";
import {Color3, HemisphericLight, PointLight, Ray, RayHelper, Scene, Vector3} from "@babylonjs/core";
import {AdvancedDynamicTexture, Control, Image} from "@babylonjs/gui";
import {Scalar, Tools, TransformNode} from "@babylonjs/core";
import {SeparatedTracksMusic} from "../AudioControl/SeparatedTracksMusic";
import {SpawnData} from "../SpawnData";
import {BreadSlicePlatform} from "../GameObjects/BreadSlicePlatform";

enum KnifeState {RISING, RISEN, FALLING, FALLEN}
import {ActionManager, Mesh} from "@babylonjs/core";


export class SugarlessBakery extends AbstractLevel {
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

    private _cakes: TransformNode[] = [];

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
        this._addTriggers();
        //this._finishedLoading();
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


        this._updateCakes();
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

        this._initCakes();

        //this._objects["bread_slice"] = [];
    }

    private _initCakes() {
        for (let i=1; i < 7; i++) {
            const nightmare = this._game.getGameScene().getTransformNodeByName("element_nightmare" + i);
            const dream = this._game.getGameScene().getTransformNodeByName("element_dream" + i);

            nightmare.rotationQuaternion = null;
            dream.rotationQuaternion = null;

            this._cakes.push(nightmare);
            this._cakes.push(dream);
        }

        // Pour que les gâteaux pointent tous vers la même direction
        this._cakes.find(node => node.name === "element_nightmare1")
            .rotation = new Vector3(Tools.ToRadians(289.5), Tools.ToRadians(202), Tools.ToRadians(91.5));

        this._cakes.find(node => node.name === "element_nightmare2")
            .rotation = new Vector3(0, Tools.ToRadians(189.2), 0);

        this._cakes.find(node => node.name === "element_nightmare3")
            .rotation = new Vector3(Tools.ToRadians(90), 0, 0);
    }

    private _updateCakes() {
        // TODO : update la rotation des gâteaux

        const playerPos = this._game.getPlayerPosition();

        for (const cake of this._cakes) {
           cake.lookAt(playerPos);

        }

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
        //element_nightmare1 element_dream1 element_dream1_collider_trigger
        this._game.getEnvironment().getTriggers().forEach((mesh: Mesh) => {
            if (mesh.name.includes("collider_trigger")) {
                console.log("adding swap collide observable on : ", mesh.name);
                this.setMeshAsSwapMeshTrigger(mesh);
            }
        })
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