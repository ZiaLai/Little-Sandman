import {Scene, Mesh, Vector3, SceneLoader, AbstractMesh, StandardMaterial} from "@babylonjs/core";

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

    // Apparaît comme unused, mais la méthode est bien utilisée
    public async changeAsset(assetName: string, newScene: Scene) {
        this._currentAssetName = assetName;

        // Mettre à jour avec la nouvelle scène
        this._scene = newScene;

        this._triggers = [];
        // Chargement des nouveaux assets
        await this.load();
    }

    public async load() {
        var ground = Mesh.CreateBox("ground", 24, this._scene);
        ground.scaling = new Vector3(0.1, .02, 0.1);
        this._assets = await this._loadAsset();
        // Loop through all environment meshes that were imported
        this._assets.allMeshes.forEach((mesh: Mesh) => {
            mesh.receiveShadows = true;
            mesh.checkCollisions = true;
            console.log("name ", mesh.name);

            if (mesh.name.includes("collider") && mesh.name.includes("trigger")) {
                mesh.isVisible = true;
                mesh.isPickable = true;
                let material: StandardMaterial = new StandardMaterial("transparent", this._scene);
                material.alpha = 0;
                mesh.material = material;
                this._triggers.push(mesh);
            }
            else if (mesh.name.includes("collider")) {
                // Les colliders sont invisibles et matériels
                mesh.isVisible = false;
                mesh.isPickable = true;
            }
            else if (mesh.name.includes("trigger")) {
                mesh.isVisible = false;
                mesh.isPickable = true;
                mesh.checkCollisions = false;
                this._triggers.push(mesh);
            }
            else if (mesh.name.includes("dream")) {
                mesh.isVisible = false;
                mesh.isPickable = false;
            }
            else if (mesh.name.includes("bread_slice")) { // todo : remplacer par game_object (quand Zia aura mis les flags)
                // ça sert juste de repère pour placer les éléments manuellement
                mesh.isVisible = false;
                mesh.isPickable = false;
                mesh.checkCollisions = false;
                console.log("Adding game_object")
                //this._gameObjectsMeshes[m.name] = m;
                //this._gameObjectsPositions[m.name] = m.getAbsolutePosition();
            }
            else {
                // Tous les autres mesh ne vérifient pas les collisions
               // m.isPickable = false;
                mesh.isVisible = true;
                mesh.checkCollisions = false;
                mesh.isPickable = true;
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

        let result;
        if (this._currentAssetName === "city") { // Import de la ville sur dropbox car fichier lourd
            result = await SceneLoader.ImportMeshAsync(null, "", "https://www.dropbox.com/scl/fi/oge4a6288q6uupxnzhvp0/city_v20.glb?rlkey=t2vzo43aok9cc96kwndhxfgz2&st=55it1s67&dl=0");
        }
        else {
            result = await SceneLoader.ImportMeshAsync(null, "./models/", this._currentAssetName + ".glb",
                this._scene);
        }

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