import {
    Scene,
    Mesh,
    PhysicsImpostor,
    AmmoJSPlugin,
    Vector3,
    SceneLoader,
    MeshBuilder
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import "@babylonjs/core/Physics/physicsEngineComponent"; // nécessaire pour .enablePhysics

export class ScarfAnimation {
    private scene: Scene;
    private clothMesh?: Mesh;

    constructor(scene: Scene, mesh) {
        this.scene = scene;
        this.clothMesh = mesh;
    }

    async initializePhysics(): Promise<void> {
        const gravity = new Vector3(0, -9.81, 0);

       // const Ammo = await loadAmmo();
        //const plugin = new AmmoJSPlugin();
        this.scene.enablePhysics(gravity);

    }


    applyClothPhysics(anchorTo?: Mesh, anchorIndices: number[] = []): void {
        if (!this.clothMesh) {
            console.warn("Cloth mesh not loaded.");
            return;
        }

        this.clothMesh.physicsImpostor = new PhysicsImpostor(
            this.clothMesh,
            PhysicsImpostor.SoftbodyImpostor,
            {
                mass: 1,
                pressure: 200,
                margin: 0.05
            },
            this.scene
        );

        // if (anchorTo) {
        //     setTimeout(() => {
        //         for (const i of anchorIndices) {
        //             this.clothMesh!.physicsImpostor!.addAnchor(anchorTo.physicsImpostor!, 0,0,1);
        //         }
        //     }, 100);
        // }
    }

    static createGround(scene: Scene): Mesh {
        const ground = MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, scene);
        ground.position.y = -1;
        ground.physicsImpostor = new PhysicsImpostor(
            ground,
            PhysicsImpostor.BoxImpostor,
            { mass: 0, restitution: 0.9 },
            scene
        );
        return ground;
    }
}
