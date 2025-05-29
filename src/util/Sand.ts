import {
    AbstractEngine,
    Color4,
    MeshBuilder,
    ParticleSystem,
    Scene,
    StandardMaterial,
    Texture,
    Vector3
} from "@babylonjs/core";

export class Sand {


    public static getParticleSystem(scene: Scene) {
        /*let particleSystem = new ParticleSystem("particles", 150, scene); //scene is optional and defaults to the current scene
        let emetter = particleSystem.createCylinderEmitter(1, 1, 0, 0);*/

        // Create a particle system
        let particleSystem = new ParticleSystem("particles", 2000, scene);

        //Texture of each particle
        particleSystem.particleTexture = new Texture("https://dl.dropbox.com/scl/fi/g33hxd66um5fgtjva5l0l/grain_sable.png?rlkey=k326v862pk1a3ztyto82v3lzx&st=kpli4xaq&dl=0", scene);
        //particleSystem.blendMode = ParticleSystem.BLENDMODE_STANDARD;

        // Where the particles come from
        particleSystem.emitter = new Vector3(0,4.35,-1); // TODO changer d'endroit en fonctioin du ls => prendre en param ? comment update faudra déplacer emmetteur en meme temps que ls

        // Colors of all particles
        particleSystem.color1 = new Color4(0.96, 1, 0.7);
        particleSystem.color2 = new Color4(1, 0.92, 0.2);
        particleSystem.colorDead = new Color4(0.19, 0.2, 0, 0);

        // Size of each particle (random between...
        particleSystem.minSize = 0.01;
        particleSystem.maxSize = 0.1;

        // Life time of each particle (random between...
        particleSystem.minLifeTime = 0.3;
        particleSystem.maxLifeTime = 1.0;

        // Emission rate
        particleSystem.emitRate = 1000;

        /******* Emission Space ********/
        particleSystem.createPointEmitter(new Vector3(-0.1,-0.1,-1), new Vector3(0.1,0.1,-1));

        // Speed
        particleSystem.minEmitPower = 2;
        particleSystem.maxEmitPower = 4;
        particleSystem.updateSpeed = 0.01;

        //
        particleSystem.gravity = new Vector3(-0.05, -0.5, 0);
        return particleSystem;

    }
}