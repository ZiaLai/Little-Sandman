import {Monolog} from "../util/Monolog";

export class AllMonolog {

    static getAllMonolog(): Monolog[] {
        return [
        new Monolog(["Te voici dans la Réalité... le monde humain.",
            "Ta mission commence mainteant.",
            "Plonges dans le sommeil les éveillés... repeuple le pays des rêves.",
            "Va, Jeune Sable. Pour cette première mission, je te guiderai.",
            "Plusieurs âmes dans les environs n'ont pas encore rejoint le rêve...",
            "Trouve-les..."]),
            new Monolog(["N'aie craite. Nous sommes invisibles aux yeux des mortels...",
            "Approche-toi puis utilise le clic gauche pour répendre le sable..."]),
            new Monolog(["Je sens une perturbation dans le rêve... Si le rêveur cauchemarde, il risque de quiter le rêve...",
            "Ton sable peut arranger cela.",
            "Mais tu vas devoir t'indroduire dans le rêve et affronter ses peurs."])
        ]
    }

    static play(index: number) {
        if (index < this.getAllMonolog().length) {
            if (!this.getAllMonolog()[index].isPlayed()){
                this.getAllMonolog()[index].play();
            }
            else{console.log("monolog" + index + " already played")}
        }
        else {
            console.log("Monolog index invalid: " + index);
        }
    }
}