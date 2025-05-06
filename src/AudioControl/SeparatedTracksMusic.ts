import {Music} from "./Music";
import {Sound} from "@babylonjs/core";

export class SeparatedTracksMusic implements Music {

    private _tracks: Sound[];

    constructor (tracks: Sound[]) {
        this._tracks = tracks;
    }

    play(): void {
    }
}