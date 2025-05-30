import {Music} from "./Music";
import {Scene, Sound, StaticSound, StreamingSound} from "@babylonjs/core";
import {PlaySound} from "./PlaySound";

export class LoopMusic implements Music {

    private _scene: Scene;
    private _loop: StaticSound;

    private _musicData: any; // Liste [[intro_name, intro_path], [loop_name, loop_path]]

    constructor(scene: Scene, musicData: any) {
        this._scene = scene;

        this._musicData = musicData;

    }

    private async _initMusic() {

        let soundsReady = 0;

        const self = this;

        function soundReady() {
            soundsReady++;

        }

        let loop: StaticSound;

        await PlaySound.initAudio(this._musicData[1], this._musicData[0]).then((sound: StaticSound) => {
            loop = sound;
            console.log("loop", loop);
        })
        this._loop = loop;
    }

    async play(): Promise<void> {
        await this._initMusic().then(() => {
            console.log("init music then");
            this._loop.play({loop: true})
        });
    }

    destroy(): void {
        if (this._loop) {
            this._loop.stop();
        }
    }
}