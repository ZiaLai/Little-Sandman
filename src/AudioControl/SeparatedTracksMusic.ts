import { Music } from "./Music";
import { Scene } from "@babylonjs/core";

export class SeparatedTracksMusic implements Music {
    private _scene: Scene;
    private _trackData: [string, string][];
    private _audioContext: AudioContext;
    private _buffers: AudioBuffer[] = [];
    private _sources: AudioBufferSourceNode[] = [];
    private _gains: GainNode[] = [];

    private _nbOfTracks: number;
    private _nbOfTracksPlaying: number;
    private _nbOfTracksPlayingAtStart: number;

    private _upgradeBuffer: AudioBuffer | null = null;

    constructor(scene: Scene, nbOfTracksPlayingAtStart: number, trackData: [string, string][]) {
        this._scene = scene;
        this._trackData = trackData;
        this._nbOfTracks = trackData.length;
        this._nbOfTracksPlayingAtStart = nbOfTracksPlayingAtStart;
        this._nbOfTracksPlaying = nbOfTracksPlayingAtStart;

        this._audioContext = new AudioContext();
    }

    private async _loadBuffer(url: string): Promise<AudioBuffer> {
        const res = await fetch(url);
        const arr = await res.arrayBuffer();
        return await this._audioContext.decodeAudioData(arr);
    }

    private async _initTracks() {
        this._buffers = await Promise.all(this._trackData.map(track => this._loadBuffer(track[1])));

        this._sources = [];
        this._gains = [];

        const now = this._audioContext.currentTime;

        for (let i = 0; i < this._buffers.length; i++) {
            const source = this._audioContext.createBufferSource();
            source.buffer = this._buffers[i];
            source.loop = true;

            const gain = this._audioContext.createGain();
            gain.gain.value = i < this._nbOfTracksPlayingAtStart ? 1 : 0;

            source.connect(gain);
            gain.connect(this._audioContext.destination);

            this._sources.push(source);
            this._gains.push(gain);
        }

        // Charger le son d'upgrade
        this._upgradeBuffer = await this._loadBuffer("https://cdn.jsdelivr.net/gh/ZiaLai/Little-Sandman@main/public/musics/sfx/upgrade.ogg");
    }

    async play(): Promise<void> {
        await this._initTracks();

        const startTime = this._audioContext.currentTime + 0.1; // Légère marge pour planifier

        for (let source of this._sources) {
            source.start(startTime);
        }
    }

    upgrade(): void {
        if (this._upgradeBuffer) {
            const source = this._audioContext.createBufferSource();
            source.buffer = this._upgradeBuffer;
            source.connect(this._audioContext.destination);
            source.start();
        }

        if (this._nbOfTracksPlaying < this._nbOfTracks) {
            this._gains[this._nbOfTracksPlaying].gain.setValueAtTime(1, this._audioContext.currentTime);
            this._nbOfTracksPlaying++;
        }
    }

    destroy(): void {
        for (const source of this._sources) {
            try {
                source.stop();
            } catch (e) {
                // ignore
            }
        }
        this._sources = [];
        this._gains = [];
    }
}
