import {Music} from "./Music";
import {Scene, Sound, StaticSound, StreamingSound} from "@babylonjs/core";
import {PlaySound} from "./PlaySound";

export class SeparatedTracksMusic implements Music {

    private _scene: Scene;
    private _tracks: StaticSound[];
    private _trackData: any  // Liste de [nom, path] des instruments
    private _nbOfTracks: number;

    private _upgradeSound;

    private _nbOfTracksPlaying: number;
    private _nbOfTracksPlayingAtStart: number;

    constructor(scene, nbOfTracksPlayingAtStart: number, trackData: any) {
        this._scene = scene;
        this._tracks = [];
        this._trackData = trackData;
        this._nbOfTracks = trackData.length;

        this._nbOfTracksPlaying = nbOfTracksPlayingAtStart;
        this._nbOfTracksPlayingAtStart = nbOfTracksPlayingAtStart;
    }

    private async _initTracks() {
        this._nbOfTracksPlaying = this._nbOfTracksPlayingAtStart;

        let soundsReady = 0;
        const self = this;

        function soundReady() {
            soundsReady++;
            console.log("soundReady : " + soundsReady);
            if (soundsReady === self._nbOfTracks) {

            }
        }

        this._tracks = [];
        for (const elt of this._trackData) {
            await PlaySound.initAudio(elt[1], elt[0]).then(streamingSound => {
                this._tracks.push(streamingSound);
            });
            //const sound: Sound = new Sound(elt[0], elt[1], this._scene, soundReady, {loop: true, spatialSound: false});

        }

        // Désactiver toutes les pistes à part les deux premières
        for (let i = this._nbOfTracksPlayingAtStart; i < this._nbOfTracks; i++) {
            this._tracks[i].volume = 0;

        }
        await PlaySound.initAudio("https://dl.dropbox.com/scl/fi/a2gw9pz6jelwyf36pyr2d/upgrade.ogg?rlkey=adqo59ajv2e1fz7w265ct7xx6&st=2s2vsx3s&dl=0", 'upgrade').then((sound: StaticSound) => {
            this._upgradeSound = sound;
        })
    }

    play(): void {
        this._initTracks().then(() => {
            for (let music of this._tracks) {
                console.log("play music no:" + music.name);
                music.play({loop: true});
            }
        });

    }

    upgrade(): void {
        this._upgradeSound.play();

        if (this._nbOfTracksPlaying >= this._nbOfTracks) return;


        this._tracks[this._nbOfTracksPlaying].volume = 1;
        this._nbOfTracksPlaying++;
    }

    destroy(): void {
        for (const track of this._tracks) {
            track.stop();
            track.dispose()
        }
    }
}