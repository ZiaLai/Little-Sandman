import {Music} from "./Music";
import {Scene, Sound, StaticSound, StreamingSound} from "@babylonjs/core";
import {PlaySound} from "./PlaySound";

export class IntroLoopMusic implements Music {
    private _scene
    private _intro: StaticSound;
    private _loop: StaticSound;

    private _musicData: any; // Liste [[intro_name, intro_path], [loop_name, loop_path]]

    constructor(scene: Scene, musicData: any) {
        this._scene = scene;

        this._musicData = musicData;

    }

    private async _initMusic(skipIntro?: boolean) {

        let soundsReady = 0;
        /*
        const self = this;

        function soundReady() {
            soundsReady++;
            console.log("soundReady : " + soundsReady);
            if (soundsReady === 2) {

                if (! skipIntro) {
                    self._intro.play();

                    self._intro.onEndedObservable.add(() => {
                        self._loop.play();
                    });
                }
                else {
                    self._loop.play();
                }
            }
        }*/
        let intro: StaticSound;
        await PlaySound.initAudio(this._musicData[0][1], this._musicData[0][0]).then((sound: StaticSound) => {
            intro = sound;
            console.log("intro", intro);
        })

        this._intro = intro;

        let loop: StaticSound;
        //
        await PlaySound.initAudio(this._musicData[1][1], this._musicData[1][0]).then((sound: StaticSound) => {
            loop = sound;
            console.log("loop", loop);
        })
        this._loop = loop;
    }

    play(skipIntro?: boolean): void {
        this._initMusic(skipIntro).then(() => {
            console.log("init music then");
            if (! skipIntro) {
                this._intro.play();

                this._intro.onEndedObservable.add(() => {
                    this._loop.play({loop: true});
                });
            }
            else {
                this._loop.play({loop: true});
            }
        });
    }

    destroy(): void {
        if (this._intro) {
            this._intro.stop();
        }

        if (this._loop) {
            this._loop.stop();
        }
    }
}