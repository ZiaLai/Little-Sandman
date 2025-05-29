import {Monolog} from "../util/Monolog";
import {Game} from "../game";

export class AllMonolog {
    private static _game: Game;

    static getAllMonolog(): Monolog[] {
        return [
        this._createMonolog(["Te voici dans la Réalité… le monde humain.",
            "Ta mission commence maintenant.",
            "Plonge dans le sommeil les éveillés… Repeuple le pays des rêves.",
            "Va, Jeune Sable. Pour cette première mission, je te guiderai.",
            "Plusieurs âmes dans les environs n'ont pas encore rejoint le rêve…",
            "Trouve-les…"]),

        this._createMonolog(["N'aie crainte, nous sommes invisibles aux yeux des mortels…",
            "Approche-toi, puis utilise le clic gauche pour répandre le sable…"]),

        this._createMonolog(["Je sens une perturbation dans le rêve… Si le rêveur cauchemarde, il risque de quitter le rêve…",
            "Ton sable peut arranger cela.",
            "Mais tu vas devoir explorer le rêve et affronter ses peurs…"])
        ]
    }

    private static _createMonolog(sentences: string[]): Monolog {
        return new Monolog(sentences, this._game);
    }


    static play(index: number, game: Game) {
        this._game = game;

        if (index < this.getAllMonolog().length){
            if (!this.getAllMonolog()[index].isPlayed()) {
                setTimeout(() => {
                    this.getAllMonolog()[index].play();
                }, 500); //TODO ajuster valeur delais
            }
            else{console.log("monolog" + index + " already played")}
        }
        else {
            console.log("Monolog index invalid: " + index);
        }
    }
}