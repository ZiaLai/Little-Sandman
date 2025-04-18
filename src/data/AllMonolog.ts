export class AllMonolog {

    static getAllMonolog(): string[][] {
        return [
        ["Te voici dans la Réalité... le monde humain.",
            "Ta mission commence mainteant.",
            "Plonges dans le sommeil les éveillés... repeuple le pays des rêves.",
            "Va, Jeune Sable. Pour cette première mission, je te guiderai.",
            "Plusieurs âmes dans les environs n'ont pas encore rejoint le rêve...",
            "Trouve-les..."],
        ["N'aie craite. Nous sommes invisibles aux yeux des mortels...",
            "Approche-toi puis utilise le clic gauche pour répendre le sable..."],
        ["Je sens une perturbation dans le rêve... Si le rêveur cauchemarde, il risque de quiter le rêve...",
            "Ton sable peut arranger cela.",
            "Mais tu vas devoir t'indroduire dans le rêve et affronter ses peurs."]
        ]
    }

    static getIsPlayed() {

        let isPlayed = [];
        for(let monolog in  this.getAllMonolog()){
            isPlayed.push(false);
        };
        return isPlayed;
    }
}