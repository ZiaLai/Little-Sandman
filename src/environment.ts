import {Scene, Mesh, Vector3, SceneLoader, AbstractMesh} from "@babylonjs/core";

export class Environment {
    private _scene: Scene;
    private _currentAssetName: string;
    private _assets: { allMeshes: any; env?: AbstractMesh; };
    private _triggers: Mesh[] = [];
    private _gameObjectsPositions: {} = {}; // On va surement plus avoir besoin de ça

    private _gameObjectsMeshes: {} = {};

    constructor(scene: Scene, assetName: string) {
        this._scene = scene;
        this._currentAssetName = assetName;

    }

    public async changeAsset(assetName: string, newScene: Scene) {
        this._currentAssetName = assetName;

        // Mettre à jour avec la nouvelle scène
        this._scene = newScene;

        // Suppression des assets précédents
        // this._assets.allMeshes.forEach((m) => {
        //     m.getScene()?.removeMesh(m);
        //
        //     m.dispose();
        // })
        this._triggers = [];
        // Chargement des nouveaux assets
        await this.load();
    }

    public async load() {
        var ground = Mesh.CreateBox("ground", 24, this._scene);
        ground.scaling = new Vector3(0.1, .02, 0.1);
        this._assets = await this._loadAsset();
        // Loop through all environment meshes that were imported
        this._assets.allMeshes.forEach((m) => {
            m.receiveShadows = true;
            m.checkCollisions = true;


            if (m.name.includes("collider")) {
                // Les colliders sont invisibles et matériels
               // m.isVisible = false;
                m.isPickable = true;
            }
            else if (m.name.includes("trigger")) {
                // m.visible = false;
                m.isPickable = false;
                m.checkCollisions = false;
                this._triggers.push(m);
            }
            else if (m.name.includes("bread_slice")) { // todo : remplacer par game_object (quand Zia aura mis les flags)
                // ça sert juste de repère pour placer les éléments manuellement
                m.isVisible = false;
                m.isPickable = false;
                m.checkCollisions = false;
                console.log("Adding game_object")
                //this._gameObjectsMeshes[m.name] = m;
                //this._gameObjectsPositions[m.name] = m.getAbsolutePosition();
            }
            else {
                // Tous les autres mesh ne vérifient pas les collisions
               // m.isPickable = false;
                m.isVisible = true;
                m.checkCollisions = false;
                m.isPickable = false;
            }

            // if (m.name.includes("immaterial")) {
            //     m.isPickable = false;
            //     m.checkCollisions = false;
            // }
        })
        console.log("GameObjects in Environment :", this._gameObjectsMeshes);
        ground.parent = this._assets.env;
    }

    public async _loadAsset() {
        const result = await SceneLoader.ImportMeshAsync(null, "./models/", this._currentAssetName + ".glb",
            this._scene);
        let env = result.meshes[0];
        // env.position.x = 5;
        // env.position.y = -15;
        console.log("environment position", env.position);
        let allMeshes = env.getChildMeshes();

        return {
            env: env, // reference to our entire imported glb (meshes and transform nodes)
            allMeshes: allMeshes // all of the meshes that are in the environment
        }
    }

    public getAssets() {
        return this._assets;
    }

    public getTriggers() {
        return this._triggers;
    }

    public getGameObjectsPositions(): {} {
        return this._gameObjectsPositions;
    }
}