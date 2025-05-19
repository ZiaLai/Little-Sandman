import {Music} from "./Music";
import {Scene, Sound} from "@babylonjs/core";

export class IntroLoopMusic implements Music {
    private _scene
    private _intro: Sound;
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
            if (soundsReady === 2) {
                self._intro.play();

                self._intro.onEndedObservable.add(() => {
                    self._loop.play();
                });
            }
        }

        const intro = new Sound(this._musicData[0][0], this._musicData[0][1], this._scene, soundReady);
        this._intro = intro;

        const loop = new Sound(this._musicData[1][0], this._musicData[1][1], this._scene, soundReady, {loop: true, spatialSound: false});
        this._loop = loop;
    }

    play(): void {
        this._initMusic();
    }

    destroy(): void {
        if (this._intro) {
            this._intro.stop();
            this._intro.dispose();
        }

        if (this._loop) {
            this._loop.stop();
            this._loop.dispose();
        }
    }
}