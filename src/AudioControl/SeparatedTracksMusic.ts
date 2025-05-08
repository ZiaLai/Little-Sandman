import {Music} from "./Music";
import {Scene, Sound} from "@babylonjs/core";

export class SeparatedTracksMusic implements Music {

    private _scene: Scene;
    private _tracks: Sound[];
    private _trackData: any  // Liste de [nom, path] des instruments
    private _nbOfTracks: number;

    private _nbOfTracksPlaying: number;
    private _nbOfTracksPlayingAtStart: number;

    constructor (scene, nbOfTracksPlayingAtStart: number, trackData: any) {
        this._scene = scene;
        this._tracks = [];
        this._trackData = trackData;
        this._nbOfTracks = trackData.length;

        this._nbOfTracksPlaying = nbOfTracksPlayingAtStart;
        this._nbOfTracksPlayingAtStart = nbOfTracksPlayingAtStart;
    }

    private _initTracks(trackData: []) {
        let soundsReady = 0;
        const self = this;

        function soundReady() {
            soundsReady++;
            console.log("soundReady : " + soundsReady);
            if (soundsReady === self._nbOfTracks) {
                for (let music of self._tracks) {
                    music.play();
                }
            }
        }

        for (const elt of trackData) {
            const sound: Sound = new Sound(elt[0], elt[1], this._scene, soundReady, {loop: true});
            this._tracks.push(sound);
        }

        // Désactiver toutes les pistes à part les deux premières
        for (let i = this._nbOfTracksPlayingAtStart; i < this._nbOfTracks; i++) {
            this._tracks[i].setVolume(0);
        }
    }

    play(): void {
        this._initTracks(this._trackData);
    }

    upgrade(): void {
        if (this._nbOfTracksPlaying >= this._nbOfTracks) return;


        this._tracks[this._nbOfTracksPlaying].setVolume(1);
        this._nbOfTracksPlaying++;
    }

    destroy(): void {
        for (const track of this._tracks) {
            track.stop();
            track.dispose()
        }
    }

}