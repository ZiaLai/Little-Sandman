import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import {
    Engine,
    Scene,
    ArcRotateCamera,
    Vector3,
    HemisphericLight,
    Mesh,
    MeshBuilder,
    FreeCamera,
    Color4,
    StandardMaterial,
    Color3,
    PointLight,
    ShadowGenerator,
    Quaternion,
    Matrix,
    SceneLoader, SceneOptimizer, Sound, VideoTexture, PointerEventTypes, Texture,
} from "@babylonjs/core";
import { AdvancedDynamicTexture, StackPanel, TextBlock, Rectangle, Button, Control, Image } from "@babylonjs/gui";
import { Environment } from "./environment";
import { Player } from "./Player";
import {PlayerInput} from "./PlayerInput";
import {Game} from "./game";
import {TestRunner} from "./Test/TestRunner";
import {AllMonolog} from "./data/AllMonolog";
import {FadeText} from "./util/FadeText";
import {CustomLoadingScreen} from "./util/CustomLoadingScreen";
//import {CustomLoadingScreen} from "./util/CustomLoadingScreen";
enum State { START = 0, GAME = 1, LOSE = 2, CUTSCENE = 3, CINEMATIC, LES_FRAUDES, ACTIVEZ_SON }

export class App {
    // General Entire Application
    private _scene: Scene;
    private _canvas: HTMLCanvasElement;
    private _engine: Engine;

    private _input: PlayerInput;

    //Game State Related
    public assets;
    private _environment;
    private _player: Player;
    private _game: Game;


    //Scene - related
    private _state: number = 0;
    private _gamescene: Scene;
    private _cutScene: Scene;
    private _lastFrameTime: number = 0;
    private _sceneOptimizer;

    // TIMER FRAUDE
    private fraudeTimer = 0;
    private FRAUDE_DURATION = 7;

    // Cinematic timer
    private cinematicTimer = 0;
    private CINEMATIC_DURATION = 88;

    // -- Monolog

    private readonly allMonolog : string[][];
    private current_monolog_index = 0;
    private current_sentence_index = 0;
    private readonly monolog_played : boolean[];
    private isPlayingMonolog: boolean = true;

    private EXECUTE_TEST = true;
    private START_LEVEL = "city";

    constructor() {
        if (this.EXECUTE_TEST) new TestRunner().main();
        // -- Monolog data
        this.monolog_played = AllMonolog.getIsPlayed();
        this.allMonolog =  AllMonolog.getAllMonolog();

        this._canvas = this._createCanvas();

        // initialize babylon scene and engine
        this._engine = new Engine(this._canvas, true);
        // todo change loading screen (op)
        //this._engine.loadingScreen = new CustomLoadingScreen();
        this._scene = new Scene(this._engine);

        this._sceneOptimizer = new SceneOptimizer(this._scene);

        // hide/show the Inspector
        window.addEventListener("keydown", (ev) => {
            // Shift+Ctrl+Alt+I
            if (ev.shiftKey && ev.ctrlKey && ev.altKey) {
                if (this._scene.debugLayer.isVisible()) {
                    this._scene.debugLayer.hide();
                } else {
                    this._scene.debugLayer.show();
                }
            }
        });

        // run the main render loop
        // Instanciation de la classe game
        this._game = new Game(this);

        this._main();
    }

    private _createCanvas(): HTMLCanvasElement {

        //Commented out for development
        // document.documentElement.style["overflow"] = "hidden";
        // document.documentElement.style.overflow = "hidden";
        // document.documentElement.style.width = "100%";
        // document.documentElement.style.height = "100%";
        // document.documentElement.style.margin = "0";
        // document.documentElement.style.padding = "0";
        // document.body.style.overflow = "hidden";
        // document.body.style.width = "100%";
        // document.body.style.height = "100%";
        // document.body.style.margin = "0";
        // document.body.style.padding = "0";

        //create the canvas html element and attach it to the webpage
        this._canvas = document.createElement("canvas");
        this._canvas.style.width = "100%";
        this._canvas.style.height = "100%";
        this._canvas.id = "gameCanvas";
        document.body.appendChild(this._canvas);

        return this._canvas;
    }

    private async _main(): Promise<void> {
        //await this._goToLesFraudes();// TODO décomenter quand on aura fini dev
        await this._goToStart(); // TODO enlever quand on  aura fini dev

        // Register a render loop to repeatedly render the scene

        this._engine.runRenderLoop(async () => {
            switch (this._state) {
                case State.START:
                    this.renderScene();
                    break;
                case State.CUTSCENE:
                    this.renderScene();
                    break;
                case State.GAME:
                    this._game.update();
                    this.renderScene();
                    break;
                case State.LOSE:
                    this.renderScene();
                    break;
                case State.CINEMATIC:
                    if (this.cinematicTimer< this.CINEMATIC_DURATION){
                        this.renderScene();
                        this.cinematicTimer+= this._scene.deltaTime/1000;
                    }
                    else {
                        await this._goToStart();
                    }
                    break;
                case State.LES_FRAUDES:
                    if(this.fraudeTimer < this.FRAUDE_DURATION){
                        this.renderScene();
                        this.fraudeTimer += this._scene.deltaTime/1000;
                    }
                    else{
                        await this._goToActivateSound();
                    }
                    break;
                case State.ACTIVEZ_SON:
                    this.renderScene();
                    break;
                default: break;
            }
        });

        //resize if the screen is resized/rotated
        window.addEventListener('resize', () => {
            this._engine.resize();
        });
    }

    private renderScene() {
        this._scene.render();
        //console.log("fps" + this._sceneOptimizer.targetFrameRate + " deltaTime : " + this._scene.deltaTime);
    }



    private async _goToLesFraudes(){
        this._engine.displayLoadingUI();
        this._scene.detachControl();
        let scene = new Scene(this._engine);
        scene.clearColor = new Color4(0,0,0,1);

        let camera = new FreeCamera("camera1", new Vector3(0, 0, 0), scene);
        camera.setTarget(Vector3.Zero());

        //--------GUI---------
        const guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        guiMenu.idealHeight = 720;

        //LOGO
        const imageRect = new Rectangle("titleContainer");
        imageRect.width = 1;
        imageRect.thickness = 0;
        imageRect.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;

        guiMenu.addControl(imageRect);

        const logo = new Image("logo", "/textures/logo_titre_blanc.png");
        logo.width = "256px";
        logo.height = "256px";
        imageRect.addControl(logo);


        // TODO : afficher et désafficher progressivement (et add une petite musique frauduleuse)

        //--SCENE FINISHED LOADING--
        await scene.whenReadyAsync();
        this._engine.hideLoadingUI();
        //lastly set the current state to the start state and set the scene to the start scene
        this._scene.dispose();
        this._scene = scene;
        this._state = State.LES_FRAUDES;
    }

    private async _goToActivateSound(){
        this._engine.displayLoadingUI();
        this._scene.detachControl();
        let scene = new Scene(this._engine);
        scene.clearColor = new Color4(0,0,0,1);

        let camera = new FreeCamera("camera1", new Vector3(0, 0, 0), scene);
        camera.setTarget(Vector3.Zero());

        //--------GUI---------
        const guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        guiMenu.idealHeight = 720;

        //
        const imageRect = new Rectangle("container");
        imageRect.width = 1;
        imageRect.thickness = 0;
        imageRect.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;

        guiMenu.addControl(imageRect);
        const logo = new Image("logo", "/textures/ls_headphones.png");
        logo.width = "256px";
        logo.height = "406px";
        logo.paddingTop = 150;
        logo.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        imageRect.addControl(logo);
        const text = new TextBlock("text", "Pour une meilleure expérience,\npensez à activer le son !") // TODO : si on veut décentrer vers le bas, il faut changer text alignement et block alignement sur bottom
        text.color ="white";
        text.fontStyle= "bold";
        text.fontFamily = "Trebuchet MS";
        text.fontSize = 25;
        text.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        text.paddingTop = "150px"
        imageRect.addControl(text);
        const ok = Button.CreateSimpleButton("start", "OK");
        ok.fontFamily = "Trebuchet MS";
        ok.width = 0.05
        ok.height = "75px";
        ok.color = "white";
        ok.thickness = 0;
        ok.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        ok.paddingBottom = 25;
        ok.cornerRadius = 10;
        ok.thickness = 2;

        imageRect.addControl(ok);

        ok.onPointerDownObservable.add(async() => {
            await this._goToCinematic();
            scene.detachControl(); //observables disabled
        });

        //--SCENE FINISHED LOADING--
        await scene.whenReadyAsync();
        this._engine.hideLoadingUI();
        //lastly set the current state to the start state and set the scene to the start scene
        this._scene.dispose();
        this._scene = scene;
        this._state = State.ACTIVEZ_SON;
    }

    private async _goToCinematic() {
        this._engine.displayLoadingUI();
        this._scene.detachControl();

        let scene = new Scene(this._engine);
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
        let ANote0VideoVidTex = new VideoTexture("truc_mushe", "https://dl.dropbox.com/scl/fi/i7ltk5bf40pv8kbmj4gen/cinematic_intro_ls_ss.mp4?rlkey=40fph0epvxqs3m2slpy2c64yr&st=w0dwxn5u&dl=0", scene);

        ANote0VideoMat.diffuseTexture = ANote0VideoVidTex;
        ANote0VideoMat.roughness = 1;
        ANote0VideoMat.emissiveColor = Color3.White();
        ANote0Video.material = ANote0VideoMat;

        // -- GUI
        const guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        guiMenu.idealHeight = 720;
        const imageRect = new Rectangle("titleContainer");
        imageRect.width = 1;
        imageRect.thickness = 0;
        guiMenu.addControl(imageRect);
        const skipbtn = Button.CreateSimpleButton("start", "Passer");
        skipbtn.fontFamily = "Trebuchet MS";
        skipbtn.width = 0.2
        skipbtn.height = "50px";
        skipbtn.color = "white";
        skipbtn.top = "-14px";
        skipbtn.thickness = 0;
        skipbtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        skipbtn.horizontalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        skipbtn.paddingRight = 20;
        skipbtn.paddingBottom = 20;

        imageRect.addControl(skipbtn);

        skipbtn.onPointerDownObservable.add(async() => {
            await this._goToStart();
            scene.detachControl(); //observables disabled
        });


        //--SCENE FINISHED LOADING--
        await scene.whenReadyAsync();
        this._engine.hideLoadingUI();
        //lastly set the current state to the start state and set the scene to the start scene
        this._scene.dispose();
        this._scene = scene;
        this._state = State.CINEMATIC;

    }
    private async _goToStart(){
        this._engine.displayLoadingUI();

        this._scene.detachControl();
        let scene = new Scene(this._engine);
        scene.clearColor = new Color4(0,0,0,1);
        let camera = new FreeCamera("camera1", new Vector3(0, 0, 0), scene);
        camera.setTarget(Vector3.Zero());

        //--------GUI---------
        const guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        guiMenu.idealHeight = 720;

        //background image
        const imageRect = new Rectangle("titleContainer");
        imageRect.width = 1;
        imageRect.thickness = 0;
        guiMenu.addControl(imageRect);

        //--START LOADING AND SETTING UP THE GAME DURING THIS SCENE--
        // await this._setUpGame(this.START_LEVEL);
        // await this._goToGame();
        const startbg = new Image("startbg", "models/title_screen2.jpg");
        imageRect.addControl(startbg);

        const startBtn = Button.CreateSimpleButton("start", "");
        startBtn.fontFamily = "Viga";
        startBtn.width = 1.5,
        startBtn.height = 1.5;
        imageRect.addControl(startBtn);

        //this handles interactions with the start button attached to the scene
        startBtn.onPointerDownObservable.add(async() => {
            await this._setUpGame(this.START_LEVEL).then(res =>{
                this._goToGame();
            });
            scene.detachControl(); //observables disabled
        });

        //--SCENE FINISHED LOADING--
        await scene.whenReadyAsync();
        this._engine.hideLoadingUI();
        //lastly set the current state to the start state and set the scene to the start scene
        this._scene.dispose();
        this._scene = scene;
        this._state = State.START;
    }

    private async _setUpGame(levelName: string) {
        let scene = new Scene(this._engine);
        this._gamescene = scene;

        //--CREATE ENVIRONMENT--
        let levelRessource = this._game.getLevelRessourceNameByLevelName(levelName);

        const environment = new Environment(scene, levelRessource);
        this._environment = environment;
        await this._environment.load(); //environment
        await this._loadCharacterAssets(scene);

        await this._game.setActiveLevel(levelName);


    }

    private async _loadCharacterAssets(scene){

        async function loadCharacter(){
            //collision mesh
            const outer = MeshBuilder.CreateBox("outer", { width: 0.75, depth: 0.5, height: 2 }, scene);
            outer.isVisible = false;
            outer.isPickable = false;
            outer.checkCollisions = true;

            //move origin of box collider to the bottom of the mesh (to match player mesh)
            outer.bakeTransformIntoVertices(Matrix.Translation(0, 0.95, 0.33))

            //for collisions
            outer.ellipsoid = new Vector3(1, 1.5, 1);
            outer.ellipsoidOffset = new Vector3(0, 1.5, 0);

            outer.rotationQuaternion = new Quaternion(0, 1, 0, 0); // rotate the player mesh 180 since we want to see the back of the player


            // TRUC QUI MARCEH MAIS ON COMMENTE POUR FAIRE UN TEST
            return SceneLoader.ImportMeshAsync(null, "./models/", "little_sandman_22.glb", scene).then((result) => {
                const root = result.meshes[0];
                // body is our actual player mesh
                const body = root;
                body.parent = outer;
                body.isPickable = false; // so our raycasts don't hit ourselves
                body.getChildMeshes().forEach(m => {
                    m.isPickable = false;
                })
                const skeleton = result.skeletons[0];
                const bone = skeleton.bones[4];
                console.log(bone.name)
                // The player has 2 scarfs
                // The name of the first scarf is "Plane.001"
                const scarf1 = body.getChildMeshes().find(m => m.name.includes("Plane.001")) as Mesh;

                // The name of the second scarf is "Plane.003"
                const scarf2 = body.getChildMeshes().find(m => m.name.includes("Plane.003")) as Mesh;

                const tshirt = scene.getMeshByName("t shirt sans simul.001");

                if (scarf1 && scarf2 && bone) {
                    scarf1.scaling.setAll(100);
                    scarf1.position.y = -113;
                    scarf2.scaling.setAll(100);
                    scarf2.position.y = -117;
                    scarf2.position.z = 8;
                    scarf1.attachToBone(bone, tshirt);
                    scarf2.attachToBone(bone, tshirt);
                }

                return {
                    mesh: outer as Mesh,
                    animationGroups : result.animationGroups
                }
            })


        }
        return loadCharacter().then(assets=> {
            this.assets = assets;
        })

    }

    private async _initializeGameAsync(scene: Scene): Promise<void> {
        //temporary light to light the entire scene
        var light0 = new HemisphericLight("HemiLight", new Vector3(0, 1, 0), scene);
        light0.diffuse = new Color3(35/255,67/255,131/255);
        const light = new PointLight("sparklight", new Vector3(0, 0, 0), scene);
        //light.diffuse = new Color3(0.08627450980392157, 0.10980392156862745, 0.15294117647058825);
        light.intensity = 0;
        //light.radius = 1;

        const shadowGenerator = new ShadowGenerator(1024, light);
        shadowGenerator.darkness = 0.4;

        //Create the player
        this._player = new Player(this.assets, scene, this._canvas,  shadowGenerator);

        const camera = this._player.camera.activate();

        this._game.initializeLevel();


    }

    private async _goToGame(){
        //--SETUP SCENE--
        this._scene.detachControl();
        let scene = this._gamescene;
        scene.clearColor = new Color4(0.01568627450980392, 0.01568627450980392, 0.20392156862745098); // a color that fit the overall color scheme better

        //--INPUT--
       // this._input = new PlayerInput(scene);

        //--GUI--
        const playerUI = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        //dont detect any inputs from this ui while the game is loading
        scene.detachControl();

        //create a simple button
        /*const loseBtn = Button.CreateSimpleButton("lose", "LOSE");
        loseBtn.width = 0.2
        loseBtn.height = "40px";
        loseBtn.color = "white";
        loseBtn.top = "-14px";
        loseBtn.thickness = 0;
        loseBtn.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        playerUI.addControl(loseBtn);*/
        if (this.isPlayingMonolog){
            const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("cutscene")
            let text1 = new TextBlock();
            text1.text = this.allMonolog[this.current_monolog_index][this.current_sentence_index];
            text1.color = "#FFFDB6FF";
            text1.fontSize = 34;
            text1.fontFamily = "Trebuchet MS";
            text1.shadowOffsetX = 1;
            text1.shadowBlur= 15;
            text1.shadowColor= "#594000FF";
            text1.fontWeight = "bold";
            text1.textVerticalAlignment = TextBlock.VERTICAL_ALIGNMENT_BOTTOM;
            text1.paddingBottom = 100;
            advancedTexture.addControl(text1)
            await FadeText.fadeIn(text1);

            const next = Button.CreateSimpleButton("next", ""); // TODO changer pour timer ?
            next.width = 100;
            next.height = 100;
            advancedTexture.addControl(next);

            next.onPointerUpObservable.add(async () => {
                this.current_sentence_index++;
                advancedTexture.addControl(text1);
                await FadeText.fadeOut(text1);
                if (this.current_monolog_index <= this.allMonolog.length - 1) {

                    if (this.current_sentence_index > this.allMonolog[this.current_monolog_index].length - 1) {
                        this.monolog_played[this.current_monolog_index] = true;
                        this.current_monolog_index += 1;
                        this.current_sentence_index = 0;
                        this.isPlayingMonolog = false;
                        text1.text = "";
                        advancedTexture.addControl(text1);
                        next.isVisible = false;
                        advancedTexture.addControl(next); // TODO travailler les variables pour pouvoir afficher un autre dialogue à un autre moment.
                    }
                    else {
                        text1.text = this.allMonolog[this.current_monolog_index][this.current_sentence_index];
                        advancedTexture.addControl(text1);
                        await FadeText.fadeIn(text1);
                    }
                }
            })

        }
        // Bouton pour tester le changement d'environnement
        const changeButton = Button.CreateSimpleButton("change", "CHANGE");
        changeButton.width = 0.2
        changeButton.height = "40px";
        changeButton.color = "white";
        changeButton.top = "14px";
        changeButton.thickness = 0;
        changeButton.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        playerUI.addControl(changeButton);

        changeButton.onPointerDownObservable.add(() => {
            this.changeGameScene("sugarless_bakery");
        })


        //this handles interactions with the start button attached to the scene
        /*loseBtn.onPointerDownObservable.add(() => {
            this._goToLose();
            scene.detachControl(); //observables disabled
        });*/

        //primitive character and setting
        await this._initializeGameAsync(scene);

        //--WHEN SCENE FINISHED LOADING--
        await scene.whenReadyAsync();
        //scene.getMeshByName("outer").position = scene.getTransformNodeByName("startPosition").getAbsolutePosition() // move the player to the start position;

        //get rid of start scene, switch to gamescene and change states
        this._scene.dispose();
        this._state = State.GAME;
        this._scene = scene;
        //this._engine.hideLoadingUI();

        //the game is ready, attach control back
        //this._startMusic();
        this._scene.attachControl();

    }

    private async _goToLose(): Promise<void> {
        this._engine.displayLoadingUI();

        //--SCENE SETUP--
        this._scene.detachControl();
        let scene = new Scene(this._engine);
        scene.clearColor = new Color4(0, 0, 0, 1);
        let camera = new FreeCamera("camera1", new Vector3(0, 0, 0), scene);
        camera.setTarget(Vector3.Zero());

        //--GUI--
        const guiMenu = AdvancedDynamicTexture.CreateFullscreenUI("UI");
        const mainBtn = Button.CreateSimpleButton("mainmenu", "MAIN MENU");
        mainBtn.width = 0.2;
        mainBtn.height = "40px";
        mainBtn.color = "white";
        guiMenu.addControl(mainBtn);
        //this handles interactions with the start button attached to the scene
        mainBtn.onPointerUpObservable.add(() => {
            this._goToStart();
        });

        //--SCENE FINISHED LOADING--
        await scene.whenReadyAsync();
        this._engine.hideLoadingUI(); //when the scene is ready, hide loading
        //lastly set the current state to the lose state and set the scene to the lose scene
        this._scene.dispose();
        this._scene = scene;
        this._state = State.LOSE;
    }

    public async changeGameScene(levelName: string, playerPosition?: Vector3) {
        console.log("In changeGameScene");
        this._game.displayLoadingUI();

        await this._setUpGame(levelName);
        await this._goToGame();

        this._player.reset();

        if (playerPosition !== undefined) this._player.setPosition(playerPosition);

       this._game.hideLoadingUI();
    }

    getEnvironment() {
        return this._environment;
    }

    getScene() {
        return this._scene;
    }

    getEngine() {
        return this._engine;
    }

    getGameScene() {
        return this._gamescene;
    }

    getPlayer() {
        return this._player;
    }
}
new App();