import {
    ArcRotateCamera,
    Color3,
    Mesh,
    MeshBuilder,
    Scene,
    StandardMaterial, Texture,
    Vector3,
    VideoTexture
} from "@babylonjs/core";
import {CinematicData} from "../data/CinematicData";

export class CinematicScene {
    private videoTexture;
    constructor(scene: Scene, cinematicData : CinematicData, position : Vector3 = new Vector3(0,0,0.1), isBackgroundActive:boolean = true) {
        let camera = new ArcRotateCamera("cinematic camera", -Math.PI/2, Math.PI/2, 15,  Vector3.Zero(), scene); // TODO camera doit dépendre de position ?
        let path_video = cinematicData.getPath();
        this.videoTexture =  new VideoTexture("truc_mushe", path_video, scene);
        this.videoTexture.video.loop = false;
        //camera.setTarget(new Vector3(0, 0, 0.2));

        let planeOpts = {
            // TODO cette taille est correcte pour toutes les cinematiques ?
            height: 12,
            //width: 7.3967,
            width: 22,
            sideOrientation: Mesh.DOUBLESIDE
        };
        let backgroudopt = {
            height: 15,
            //width: 7.3967,
            width: 26,
            //color: new Color3(7/225, 45/255, 88/255),

            sideOrientation: Mesh.DOUBLESIDE
        };
        let cinematic_plane = MeshBuilder.CreatePlane("cinematic_plane", planeOpts, scene);
        cinematic_plane.position = position;
        if (isBackgroundActive){
            let background = MeshBuilder.CreatePlane("plane", backgroudopt, scene);
            let mat= new StandardMaterial("mat", scene);
            mat.diffuseTexture = new Texture("https://dl.dropbox.com/scl/fi/xks3956v41md7khfu69wm/etoiles.png?rlkey=546hvia23n1mbjl8u1ge5kmp2&st=ijtvzih7&dl=0", scene);
            mat.emissiveColor = Color3.White();
            background.material = mat;
            background.position = new Vector3(0, 0, 0.2);
        }
        let material = new StandardMaterial("m", scene);
        material.diffuseTexture = this.videoTexture;
        material.roughness = 1;
        material.emissiveColor = Color3.White();
        cinematic_plane.material = material;



    }
    public stop(): void {
        this.videoTexture.video.pause();
    }

    public executeActionAfterVideoLoaded(action: () => void) {
        this.videoTexture.onLoadObservable.addOnce(() => {
            action();
        });
    }
    public play(): void {
        this.videoTexture.video.play();
    }


}