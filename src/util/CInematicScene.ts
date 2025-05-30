import {
    ArcRotateCamera,
    Color3,
    Mesh,
    MeshBuilder, Plane,
    Scene,
    StandardMaterial, Texture,
    Vector3,
    VideoTexture
} from "@babylonjs/core";
import {CinematicData} from "../data/CinematicData";

export class CinematicScene {
    private videoTexture;
    private background:Mesh;
    private cinematicPlane :Mesh;
    private duration: number;
    constructor(scene: Scene, cinematicData : CinematicData, position : Vector3 = new Vector3(0,0,0.1), isBackgroundActive:boolean = true) {
        let camera = new ArcRotateCamera("cinematic camera", -Math.PI/2, Math.PI/2, 15,  Vector3.Zero(), scene); // TODO camera doit dépendre de position ?
        this.duration = cinematicData.getDuration();
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
            height: 13,
            //width: 7.3967,
            width: 26,
            //color: new Color3(7/225, 45/255, 88/255),

            sideOrientation: Mesh.DOUBLESIDE
        };
        this.cinematicPlane = MeshBuilder.CreatePlane("cinematic_plane", planeOpts, scene);
        this.cinematicPlane.position = position;
        if (isBackgroundActive){
            this.background = MeshBuilder.CreatePlane("plane", backgroudopt, scene);
            let mat= new StandardMaterial("mat", scene);
            mat.diffuseTexture = new Texture("https://cdn.jsdelivr.net/gh/ZiaLai/Little-Sandman@main/public/textures/title_screen2.jpg", scene);
            mat.emissiveColor = Color3.White();
            this.background.material = mat;
            this.background.position = new Vector3(0, 0, 0.2);
        }
        let material = new StandardMaterial("m", scene);
        material.diffuseTexture = this.videoTexture;
        material.roughness = 1;
        material.emissiveColor = Color3.White();
        this.cinematicPlane.material = material;
        this.stop();
    }
    public stop(): void {
        this.videoTexture.video.pause();
    }

    public executeActionAfterVideoLoaded(action: () => void) {
        this.videoTexture.onLoadObservable.addOnce(() => {
            action();
        });
    }
    public play(isCinematicIntro = false): void {
        this.videoTexture.video.play();
        if (isCinematicIntro){
            setTimeout(() => {
                this.cinematicPlane.isVisible = false;

            }, 87500);// TODO ajuster + voir si on met un fade in out blanc sur tout l'ecran (et pour avoir la meme transition que dans la video initiale)
        }
        setTimeout(()=> {
            this.stop();
            //TODO mettre gotosomething ici ? dans ce cas faut passer game non ca c'est opzs ca le prob...
            //
        }, this.duration*1000 );

    }


}