import {Scene, Mesh, Vector3, SceneLoader, AbstractMesh} from "@babylonjs/core";

export class Environment {
    private _scene: Scene;
    private _currentAssetName: string;
    private _assets: { allMeshes: any; env?: AbstractMesh; };

    constructor(scene: Scene, assetName: string) {
        this._scene = scene;
        this._currentAssetName = assetName;

    }

    public async changeAsset(assetName: string) {
        this._currentAssetName = assetName;
        // Suppression des assets précédents
        this._assets.allMeshes.forEach((m) => {
            m.dispose();
        })
        // Chargement des nouveaux assets
        this.load();
    }

    public async load() {
        var ground = Mesh.CreateBox("ground", 24, this._scene);
        ground.scaling = new Vector3(1, .02, 1);
        this._assets = await this._loadAsset();
        // Loop through all environment meshes that were imported
        this._assets.allMeshes.forEach((m) => {
            m.receiveShadows = true;
            m.checkCollisions = true;

            let state;
            if (m.name.includes("collider")) {
                m.isVisible = false;
                m.isPickable = true;
                state = "collider"
            }
            else {
                m.isPickable = false;
                m.checkCollisions = false;
                state = "immaterial"
            }
            if (state === "collider") {
                console.log(m.name, state);

            }
            if (m.name.includes("startPosition")) {
                console.log("startPosition : ", m.getAbsolutePosition());
            }

            // if (m.name.includes("immaterial")) {
            //     m.isPickable = false;
            //     m.checkCollisions = false;
            // }
        })
    }

    public async _loadAsset() {
        const result = await SceneLoader.ImportMeshAsync(null, "./models/", this._currentAssetName + ".glb",
            this._scene);
        let env = result.meshes[0];
        let allMeshes = env.getChildMeshes();

        return {
            env: env, // reference to our entire imported glb (meshes and transform nodes)
            allMeshes: allMeshes // all of the meshes that are in the environment
        }
    }
}