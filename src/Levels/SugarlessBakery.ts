import {AbstractLevel} from "./AbstractLevel";
import {Game} from "../game";
import {AbstractMesh, Color3, HemisphericLight, PointLight, Scene, Vector3} from "@babylonjs/core";
import {AdvancedDynamicTexture, Control, Image} from "@babylonjs/gui";
import {Scalar, Tools, TransformNode} from "@babylonjs/core";
import {SeparatedTracksMusic} from "../AudioControl/SeparatedTracksMusic";
import {SpawnData} from "../SpawnData";
import {BreadSlicePlatform} from "../GameObjects/BreadSlicePlatform";

enum KnifeState {RISING, RISEN, FALLING, FALLEN}

enum BarsState {CLOSED, OPENING, OPENED}

import {Mesh} from "@babylonjs/core";
import {ClearNightmareParticles} from "../util/ClearNightmareParticles";
import {State} from "../State";
import {AllMonolog} from "../data/AllMonolog";


export class SugarlessBakery extends AbstractLevel {
    private _nbNightmareFound: number = 0;

    // todo : décomenter
    public static ENTRANCE_SPAWN_DATA: SpawnData = new SpawnData(new Vector3(-14.75, 1, 81.14),
                                                                 new Vector3(0, 180, 0),
                                                                 1.6);

    // todo : supprimer
    // public static ENTRANCE_SPAWN_DATA: SpawnData = new SpawnData(new Vector3(0, 0, 0),
    //     new Vector3(0, 180, 0),
    //     1.6);

    private _knife: TransformNode;
    private _knifeState: KnifeState = KnifeState.RISING;
    private _knifeTimer: number = 0;
    private _knifeCanCreateBreadSlicePlatform: boolean = true;
    private _breadSlicePlatformTransformNode: TransformNode;
    private _barsMesh: AbstractMesh;
    private _barsState: BarsState;
    private _uiCounter: AdvancedDynamicTexture;


    constructor(game: Game, id: number) {
        super(game, id);
        this._isNightmareLevel = true;
        this._name = "sugarless_bakery";
        this._ressourceName = "https://raw.githubusercontent.com/ZiaLai/Little-Sandman/main/public/models/bakery_level_15.glb";

        this._music = new SeparatedTracksMusic(this._game.getScene(), 2,
                                                [   ["piano1",  "https://cdn.jsdelivr.net/gh/ZiaLai/Little-Sandman@main/public/musics/sugarlessBakery/sugarless_bakery-Piano_1.ogg"           ],
                                                    ["piano2",  "https://cdn.jsdelivr.net/gh/ZiaLai/Little-Sandman@main/public/musics/sugarlessBakery/sugarless_bakery-Piano_2.ogg"           ],
                                                    ["flute",   "https://cdn.jsdelivr.net/gh/ZiaLai/Little-Sandman@main/public/musics/sugarlessBakery/sugarless_bakery-Flute.ogg"             ],
                                                    ["bass",    "https://cdn.jsdelivr.net/gh/ZiaLai/Little-Sandman@main/public/musics/sugarlessBakery/sugarless_bakery-Basse.ogg"             ],
                                                    ["battery", "https://cdn.jsdelivr.net/gh/ZiaLai/Little-Sandman@main/public/musics/sugarlessBakery/sugarless_bakery-Set_de_batterie.ogg"   ],
                                                    ["guitar",  "https://cdn.jsdelivr.net/gh/ZiaLai/Little-Sandman@main/public/musics/sugarlessBakery/sugarless_bakery-Guitare_electrique.ogg"],
                                                    ["violons", "https://cdn.jsdelivr.net/gh/ZiaLai/Little-Sandman@main/public/musics/sugarlessBakery/sugarless_bakery-Violons.ogg"           ]]);
    }

    protected async load() {
        await super.load();
        this._addTriggers();
        //this._finishedLoading();
        this._nbNightmareFound = 0;
        this.setUpGui();
        this._music.play();
        this.setClearNightmareParticles();

        // this._upgradeMusic();
    }

    update(): void {

        for (const object of this._objects) {
            object.update();
        }

        this._updateKnife();

        this._updateBars();

        // console.log("player position :", this._game.getPlayerPosition());
    }

    public initialize() {
        this._nbNightmareFound = 0;

        const breadSlice: TransformNode = this._game.getGameScene().getTransformNodeByName("bread_slice");
        breadSlice.getChildMeshes().forEach(mesh => {
            mesh.isVisible = false;
        })

        this._initKnife();

        this._breadSlicePlatformTransformNode = this._game.getGameScene().getTransformNodeByName("bread_slice");
        console.assert(this._breadSlicePlatformTransformNode);

        this._initCakes();

        this._initBars();

        this._initSmallBakery();
        this._uiCounter = AdvancedDynamicTexture.CreateFullscreenUI("UI");


        AllMonolog.play(2, this._game);

        //this._objects["bread_slice"] = [];
    }

    private _initCakes() {
        let scene = this._game.getGameScene();
        for (let i=1; i < 7; i++) {
            const nightmareElement = this._game.getGameScene().getTransformNodeByName("element_nightmare" + i);
            scene.registerBeforeRender(() => {
                let origin = nightmareElement.getAbsolutePosition();
                let playerPosition = this._game.getPlayer().mesh.getAbsolutePosition();
                let direction = playerPosition.subtract(origin);
                direction.x = -direction.x;
                //direction.z = -direction.z; //Laisser même si commentée car je suis bête
                nightmareElement.setDirection(direction);
            })
        }
        /*
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
         */
    }

    private _initSmallBakery(): void {
        this._game.getGameScene().getTransformNodeByName("murs_plafond_regularSolid").getChildMeshes().forEach(mesh => {
            if (mesh.name === "murs_plafond_regularSolid_primitive3") return;
            mesh.isPickable = false;
        });
    }

    private _initBars(): void {
        this._barsMesh = this._game.getGameScene().getMeshByName("bars_regularSolid");
        console.assert(this._barsMesh);

        this._barsState = BarsState.CLOSED;
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

    private _updateBars() {
        switch (this._barsState) {
            case BarsState.CLOSED:
                break;
            case BarsState.OPENING:
                this._barsMesh.position.y += 1.5 * this._game.getDeltaTime();
                if (this._barsMesh.position.y >= 10) this._barsState = BarsState.OPENED;
                break;
            case BarsState.OPENED:
                break;
        }
    }
    private setClearNightmareParticles(){
        for (let i = 0; i < 7; i++) {
            if (i==0){
                this.clearNigthmareParticleEmmitter.push(null);

            }
            else if  (i == 6){
                this.clearNigthmareParticleEmmitter.push(
                    new ClearNightmareParticles(this._game.getGameScene(),
                        this._game.getGameScene().getTransformNodeByName("element_dream6").getAbsolutePosition(),
                        0.4));
            }
            else {
                this.clearNigthmareParticleEmmitter.push(
                    new ClearNightmareParticles(this._game.getGameScene(),
                        this._game.getGameScene().getTransformNodeByName("element_dream"+i).getAbsolutePosition()));

            }
        }

    }
    protected _addTriggers(): void {
        //element_nightmare1 element_dream1 element_dream1_collider_trigger
        this._game.getEnvironment().getTriggers().forEach((mesh: Mesh) => {
            let colliderTriggerEffect: (mesh: Mesh) => void = async (mesh: Mesh) => {
                let meshName = mesh.name.split("_");
                let index = meshName[1].charAt(meshName[1].length - 1);
                let elementNightMare = this._game.getScene().getTransformNodeByName(meshName[0] + "_nightmare" + index);
                let elementDream = this._game.getScene().getTransformNodeByName(meshName[0] + "_" + meshName[1]);
                let willAdd: boolean = false;
                elementNightMare.getChildMeshes().forEach(mesh => {
                    mesh.isVisible = false;
                })
                elementDream.getChildMeshes().forEach(mesh => {
                    if (!mesh.isVisible) {
                        willAdd = true;
                        mesh.isVisible = true;
                    } else {
                        willAdd = false;
                    }
                })
                if (willAdd) {
                    this._nbNightmareFound++;
                    this.setUpGui();
                    this.clearNigthmareParticleEmmitter[index].start();
                    this._upgradeMusic();
                    if (this._nbNightmareFound == 6) {
                        function sleep(ms) {
                            return new Promise(resolve => setTimeout(resolve, ms));
                        }

                        await sleep(3000);
                        await this._game.getApp().goToSomething(State.CINEMATIC, 1).then(() => {
                            this.destroy();
                        });
                        //this.destroy
                    }
                }
                //console.log("swap done", this._nbNightmareFound);

            }

            if (mesh.name.includes("element_dream6")) {
                const baseEffect = colliderTriggerEffect;

                colliderTriggerEffect = (mesh: Mesh) => {
                    baseEffect(mesh);
                    this._barsState = BarsState.OPENING;
                }
            }

            if (mesh.name.includes("collider_trigger")) {
                //console.log("adding swap collide observable on : ", mesh.name);
                this.setMeshAsSwapMeshTrigger(mesh, colliderTriggerEffect);
            }
        })
    }

    protected setUpLights(): void {
        var light0 = new HemisphericLight("nightLight", new Vector3(0, 1, 0), this._game.getGameScene());
        light0.diffuse = new Color3(0.066,0.082,1); // TODO plus violet ?
        light0.intensity = 2;
        //---FOUR---
        const light = new PointLight("four", new Vector3(-8, 25, -90), this._game.getGameScene());
        light.diffuse = new Color3(1,0,0);
        light.intensity = 2000;
        // const cake1 = new PointLight("cake 1", new Vector3(4, 2.8, 1), this._game.getGameScene());
        // cake1.diffuse = new Color3(0.585, 1, 0.573);
        // cake1.intensity =10 ;

    }

    private setUpGui(): void {
        const ui = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        const compteursURL = [
            "https://cdn.jsdelivr.net/gh/ZiaLai/Little-Sandman@main/public/textures/compteur-0.png",
            "https://cdn.jsdelivr.net/gh/ZiaLai/Little-Sandman@main/public/textures/compteur-1.png",
            "https://cdn.jsdelivr.net/gh/ZiaLai/Little-Sandman@main/public/textures/compteur-2.png",
            "https://cdn.jsdelivr.net/gh/ZiaLai/Little-Sandman@main/public/textures/compteur-3.png",
            "https://cdn.jsdelivr.net/gh/ZiaLai/Little-Sandman@main/public/textures/compteur-4.png",
            "https://cdn.jsdelivr.net/gh/ZiaLai/Little-Sandman@main/public/textures/compteur-5.png",
            "https://cdn.jsdelivr.net/gh/ZiaLai/Little-Sandman@main/public/textures/compteur-6.png"
        ];
        const compteur = new Image("compteur", compteursURL[this._nbNightmareFound]);
        compteur.width = "25%";
        compteur.height = "25%";
        compteur.stretch = Image.STRETCH_UNIFORM;
        compteur.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

        compteur.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        compteur.paddingLeft = 40;
        this._uiCounter.addControl(compteur);

    }

    doAfterCinematic(): void {
    }
}