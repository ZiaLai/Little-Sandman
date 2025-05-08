import {Music} from "./Music";
import {Sound} from "@babylonjs/core";

export class IntroLoopMusic implements Music {
    private _intro: Sound;
    private _loop: Sound;

    constructor(intro: Sound, loop: Sound) {
        this._intro = intro;
        this._loop = loop;
    }

    play(): void {
    }

    stop(): void {
    }

}