import {
    ArcRotateCamera,
    Color3,
    Mesh,
    MeshBuilder,
    Scene,
    StandardMaterial,
    Vector3,
    VideoTexture
} from "@babylonjs/core";
import {AdvancedDynamicTexture, Button, Control, Rectangle} from "@babylonjs/gui";
import {CinematicData} from "../data/CinematicData";

export class CinematicScene{
    constructor(scene: Scene, cinematicData : CinematicData ){
        let path_video = cinematicData.getPath();
        let skippable = cinematicData.isSkippable();
        let wantedState = cinematicData.getWantedState();
        let camera = new ArcRotateCamera("arcR", -Math.PI/2, Math.PI/2, 15,  Vector3.Zero(), scene);
        //camera.setTarget(new Vector3(0, 0, 0.2));

        let planeOpts = {
            height: 12,
            //width: 7.3967,
            width: 22,
            sideOrientation: Mesh.DOUBLESIDE
        };
        let backgroudopt = {
            height: 1000,
            //width: 7.3967,
            width: 10000,
            sideOrientation: Mesh.DOUBLESIDE
        };
        let ANote0Video = MeshBuilder.CreatePlane("plane", planeOpts, scene);
        let background = MeshBuilder.CreatePlane("plane", backgroudopt, scene);

        let vidPos = (new Vector3(0, 0, 0.1))
        ANote0Video.position = vidPos;
        background.position = new Vector3(0, 0, 0.2);
        let ANote0VideoMat = new StandardMaterial("m", scene);
        let ANote0VideoVidTex = new VideoTexture("truc_mushe", path_video, scene);// "https://dl.dropbox.com/scl/fi/i7ltk5bf40pv8kbmj4gen/cinematic_intro_ls_ss.mp4?rlkey=40fph0epvxqs3m2slpy2c64yr&st=w0dwxn5u&dl=0"

        ANote0VideoMat.diffuseTexture = ANote0VideoVidTex;
        ANote0VideoMat.roughness = 1;
        ANote0VideoMat.emissiveColor = Color3.White();
        ANote0Video.material = ANote0VideoMat;

    }


}