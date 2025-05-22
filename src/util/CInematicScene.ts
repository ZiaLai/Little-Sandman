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
import {CinematicData} from "../data/CinematicData";

export class CinematicScene {
    private videoTexture;
    constructor(scene: Scene, cinematicData : CinematicData, position : Vector3 = new Vector3(0,0,0.1)){
        let path_video = cinematicData.getPath();
        //this.setVideoTexture(path_video, scene);
        this.videoTexture =  new VideoTexture("truc_mushe", path_video, scene);

        this.videoTexture.onLoadObservable.addOnce(() => {
            let camera = new ArcRotateCamera("cinematic camera", -Math.PI/2, Math.PI/2, 15,  Vector3.Zero(), scene); // TODO camera doit dépendre de position ?
            //camera.setTarget(new Vector3(0, 0, 0.2));

            let planeOpts = {
                // TODO cette taille est correcte pour toutes les cinematiques ?
                height: 12,
                //width: 7.3967,
                width: 22,
                sideOrientation: Mesh.DOUBLESIDE
            };
            let backgroudopt = {
                height: 24,
                //width: 7.3967,
                width: 44,
                color: new Color3(1, 1, 1),
                sideOrientation: Mesh.DOUBLESIDE
            };
            let cinematic_plane = MeshBuilder.CreatePlane("cinematic_plane", planeOpts, scene);
            cinematic_plane.position = position;
            // let background = MeshBuilder.CreatePlane("plane", backgroudopt, scene);

            //background.position = new Vector3(0, 0, 0.2);
            let material = new StandardMaterial("m", scene);
            material.diffuseTexture = this.videoTexture;
            material.roughness = 1;
            material.emissiveColor = Color3.White();
            cinematic_plane.material = material;
        })


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