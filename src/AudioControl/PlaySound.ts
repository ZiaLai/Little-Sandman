import {CreateAudioEngineAsync, CreateStreamingSoundAsync, StreamingSound} from "@babylonjs/core";

export class PlaySound {

    public static async initAudio(url: string, songName: string): Promise<StreamingSound> {

        const audioEngine = await CreateAudioEngineAsync();
        await audioEngine.unlockAsync();

        // Audio engine is ready to play sounds ...

        // Track: "No" by Soulsonic
        // License: CC BY-ND 3.0
        return await CreateStreamingSoundAsync(songName, url, audioEngine);
    }
}