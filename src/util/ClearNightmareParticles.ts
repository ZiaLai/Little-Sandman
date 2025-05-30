import {Color4, ParticleSystem, Scene, Texture, Vector3} from "@babylonjs/core";

export class ClearNightmareParticles {

    private particleSystem: ParticleSystem;
    private timer = 0;
    private duration = 1;

    constructor(scene: Scene, position: Vector3, coef = 1) {
        this.particleSystem = new ParticleSystem("Clear nightmare", 2000, scene);
        this.particleSystem.emitter = position;
        this.particleSystem.particleTexture =  new Texture("https://cdn.jsdelivr.net/gh/ZiaLai/Little-Sandman@main/public/textures/grain_sable.png", scene);

        this.particleSystem.color1 = new Color4(0.96, 1, 0.7);
        this.particleSystem.color2 = new Color4(1, 0.92, 0.2);
        this.particleSystem.colorDead = new Color4(0.19, 0.2, 0, 0);


        this.particleSystem.minSize = 0.1 * coef;
        this.particleSystem.maxSize = 1 * coef;

        this.particleSystem.minLifeTime = 5* coef;
        this.particleSystem.maxLifeTime = 100* coef;

        this.particleSystem.emitRate = 2000;
        this.particleSystem.createSphereEmitter(1,Math.PI/3);

        this.particleSystem.minEmitPower = 10* coef;
        this.particleSystem.maxEmitPower = 100* coef;

        this.particleSystem.gravity = new Vector3(0, -9.81, 0);

    }
    public start(): void {
        // TODO on limite la durée où ?
        this.particleSystem.start();
        setTimeout(() => {
            this.particleSystem.stop();
        }, 2000);
    }

}