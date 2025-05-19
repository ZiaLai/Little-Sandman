import {Music} from "./Music";
import {Scene, Sound} from "@babylonjs/core";

export class LoopMusic implements Music {

    private _scene: Scene;
    private _loop: Sound;

    private _musicData: any; // Liste [[intro_name, intro_path], [loop_name, loop_path]]

    constructor(scene: Scene, musicData: any) {
        this._scene = scene;

        this._musicData = musicData;

    }

    private _initMusic() {

        let soundsReady = 0;

        const self = this;

        function soundReady() {
            soundsReady++;
            console.log("soundReady : " + soundsReady);
            if (soundsReady === 1) {
                self._loop.play();
            }
        }

        const loop = new Sound(this._musicData[0], this._musicData[1], this._scene, soundReady, {loop: true, spatialSound: false});
        this._loop = loop;
    }

    play(): void {
        this._initMusic();
    }

    destroy(): void {
        if (this._loop) {
            this._loop.stop();
            this._loop.dispose();
        }
    }
}