import {AbstractLevel} from "./AbstractLevel";
import {Game} from "../game";
import {
    ActionManager, Color3,
    ExecuteCodeAction,
    HemisphericLight,
    Mesh, MeshBuilder, PointLight,
    Scene,
    SetValueAction, StandardMaterial, Texture,
    Vector3
} from "@babylonjs/core";

export class CityLevel extends AbstractLevel{

    constructor(game: Game, id: number) {
        super(game, id);
        this._name = "city";
        this._ressourceName = "city_v20";
    }

    protected async load() {
        await super.load();
        console.log("In city load");
        console.log(this._game.getEnvironment().getTriggers());
        this._addTriggers();
        console.log("after adding triggers");

        this._finishedLoading();
    }

    initialize(): void {

    }

    update(): void {
    }

    protected _addTriggers() {
        this._game.getEnvironment().getTriggers().forEach(m => {
            if (m.name.includes("bakers_bedroom")) {
                console.log("adding collide observable on : ", m.name);
                m.actionManager = new ActionManager(this._game.getScene());
                this.setMeshAsChangeLevelTrigger(m, "bakers_bedroom");
            }
        })
    }

    protected setUpLights(): void {

        var light0 = new HemisphericLight("nightLight", new Vector3(0, 1, 0), this._game.getGameScene());
        light0.diffuse = new Color3(35/255,67/255,131/255);
        light0.intensity = 0.5;
        // REVERBERES
        // function createPointLight(name: string, position: Vector3, scene: Scene): PointLight {
        //     const light = new PointLight(name, position, scene);
        //     light.diffuse = new Color3(181/255,121/255,27/255);
        //     light.intensity =25;
        //     return light;
        // }
        //
        // const positions:Vector3[] = [
        //     new Vector3(-5.99, 7.40, 8.10),
        //     new Vector3(-9.11, 8.05, 43.99),
        //     new Vector3(-27.15, 8.05,-81.65),
        //     new Vector3(-14.03, 7.40, 0.67),
        //     new Vector3(-10.78, 7.40,8.10),
        //     new Vector3(19.34, 7.40,-0.02),
        //     new Vector3(19.34, 7.40,-18.18),
        //     new Vector3(11.13, 7.40,-26.26),
        //     new Vector3(-6.58, 7.40,-26.26),
        //     new Vector3(-14.85, 7.40,-17.97),
        //     new Vector3(17.36, 6.95,-44.14),
        //     new Vector3(36.97, 6.95,-23.04),
        //     new Vector3(13.12, 6.52,-65.87),
        //     new Vector3(59.13, 6.52,-20.67),
        //     new Vector3(-55, 6.41,5.22),
        //     new Vector3(-8.77, 6.52,-65.87),
        //     new Vector3(-54.42, 6.52,-20.07),
        //     new Vector3(59.40, 6.52,2.89),
        //     new Vector3(13.23, 6.52,48.93),
        //     new Vector3(32.69, 6.52,39.08),
        //     new Vector3(48.10, 6.52,25.60),
        //
        // ];
        //
        // positions.forEach((pos, index) => {
        //     createPointLight(`pointLight${index}`, pos, this._game.getGameScene());
        // });


    }

    protected setUpSkydome(): void {
        // TODO POURQUOI CE *** DE SKYDOME EST BLANC !!!!!!??????
        const skydome = MeshBuilder.CreateSphere('skydome', {
            segments: 32,
            diameter: 1000,
            sideOrientation: Mesh.BACKSIDE,
            //slice: 0.5, // prendre seulement la moitié de la sphère
        }, this._game.getGameScene());
        skydome.infiniteDistance = true;

        // Material pour le ciel
        const skyMaterial = new StandardMaterial('skyMaterial', this._game.getGameScene());
        skyMaterial.diffuseTexture = new Texture("textures/skydome_chat_stars.png", this._game.getGameScene());
        //skyMaterial.diffuseTexture.scale(4);

        //skyMaterial.diffuseTexture.wrapU = Texture.WRAP_ADDRESSMODE;
        //skyMaterial.diffuseTexture.wrapV = Texture.WRAP_ADDRESSMODE;
        skyMaterial.diffuseTexture.coordinatesMode = Texture.SPHERICAL_MODE;
        skyMaterial.backFaceCulling = false;
        skydome.material = skyMaterial;
    }


}