import {Sound} from "@babylonjs/core";
import {App} from "../app";

export class MusicPlayer {
    private _app: App;

    constructor(app: App) {
        this._app = app;
    }

    public load(musicName) {}


    private _startMusic() {
        let soundsReady = 0;
        function soundReady() {
            soundsReady++;
            console.log("soundReady : " + soundsReady);
            if (soundsReady === 7) {
                for (let music of instruments) {
                    music.play();
                }
            }
        }
        let instruments = [
            new Sound("piano1", "./musics/sugarlessBakery/sugarless_bakery-Piano_1.ogg", this._app.getScene(), soundReady, {loop : true}),
            new Sound("piano2", "./musics/sugarlessBakery/sugarless_bakery-Piano_2.ogg", this._app.getScene(), soundReady, {loop : true}),
            new Sound("bass", "./musics/sugarlessBakery/sugarless_bakery-Basse.ogg", this._app.getScene(), soundReady, {loop : true}),
            new Sound("flute", "./musics/sugarlessBakery/sugarless_bakery-Flûte.ogg", this._app.getScene(), soundReady, {loop : true}),
            new Sound("guitar", "./musics/sugarlessBakery/sugarless_bakery-Guitare_électrique.ogg", this._app.getScene(), soundReady, {loop : true}),
            new Sound("battery", "./musics/sugarlessBakery/sugarless_bakery-Set_de_batterie.ogg", this._app.getScene(), soundReady, {loop : true}),
            new Sound("violins", "./musics/sugarlessBakery/sugarless_bakery-Violons.ogg", this._app.getScene(), soundReady, {loop : true})
        ]
    }
}