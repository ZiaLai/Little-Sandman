import {AdvancedDynamicTexture, Button, TextBlock} from "@babylonjs/gui";
import {FadeText} from "./FadeText";

export class Monolog {
    sentences;
    current_sentence = 0;
    isFinished = false;
    constructor(sentences) {
        this.sentences = sentences;
    }
    public isPlayed(): boolean {
        return this.isFinished;
    }
    public async play(): Promise<void> {
        const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("cutscene")
        let text1 = new TextBlock();
        text1.text = this.sentences[this.current_sentence];
        text1.color = "#FDF1bf";
        text1.fontSize = 34;
        text1.fontFamily = "Trebuchet MS";
        text1.shadowOffsetX = 1;
        text1.shadowBlur = 15;
        text1.shadowColor = "#594000FF";
        text1.fontWeight = "bold";
        text1.textVerticalAlignment = TextBlock.VERTICAL_ALIGNMENT_BOTTOM;
        text1.paddingBottom = 100;
        advancedTexture.addControl(text1)
        await FadeText.fadeIn(text1);

        const next = Button.CreateSimpleButton("next", ""); // TODO changer pour timer ?
        next.width = 100;
        next.height = 100;
        advancedTexture.addControl(next);

        next.onPointerUpObservable.add(async () => {
            this.current_sentence++;
            advancedTexture.addControl(text1);
            await FadeText.fadeOut(text1);
            if (this.current_sentence > this.sentences.length - 1) {
                this.isFinished = true;
                text1.text = "";
                advancedTexture.addControl(text1);
                next.isVisible = false;
                advancedTexture.addControl(next);
                //TODO détruire ce gui ? (cest la fin de la fonction)
            } else {
                text1.text = this.sentences[this.current_sentence];
                advancedTexture.addControl(text1);
                await FadeText.fadeIn(text1);
            }

        })
    }
}