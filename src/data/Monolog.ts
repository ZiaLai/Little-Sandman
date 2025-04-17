class Monolog{
    sentences: string[];
    constructor(sentences: string[]) {
        this.sentences = sentences;
    }
    public play(){
        for (let sentence of this.sentences) {
            this.print_sentence(sentence);
        }
    }
    public print_sentence(sentence:string){
        // TODO implémenter
        // affiche la phrase un certain temps avec l'ihm ...
        // todo jouer avec alpha pour progrssif

        /*const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI");ki
        let text1 = new GUI.TextBlock();
        text1.text = sentence;
        text1.color = "white";
        text1.fontSize = 18;
        advancedTexture.addControl(text1);*/
    }
}