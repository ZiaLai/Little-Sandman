import {
    CreateAudioEngineAsync,
    CreateSoundAsync,
    CreateStreamingSoundAsync,
    StaticSound,
    StreamingSound
} from "@babylonjs/core";

export class PlaySound {

    public static async initAudio(url: string, songName: string): Promise<StaticSound> {

        const audioEngine = await CreateAudioEngineAsync();
        await audioEngine.unlockAsync();

        // Audio engine is ready to play sounds ...

        // Track: "No" by Soulsonic
        // License: CC BY-ND 3.0
        return await CreateSoundAsync(songName, url, audioEngine);
    }
}