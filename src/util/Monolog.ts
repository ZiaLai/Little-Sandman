import {AdvancedDynamicTexture, Button, TextBlock} from "@babylonjs/gui";
import {FadeText} from "./FadeText";

export class Monolog {
    sentences;
    current_sentence = 0;
    isFinished = false;
    textBlock: TextBlock;
    constructor(sentences) {
        this.sentences = sentences;
        this.init_textBlock()

    }
    private init_textBlock() {
        this.textBlock = new TextBlock();
        this.textBlock.color = "#FDF1bf";
        this.textBlock.fontSize = 34;
        this.textBlock.fontFamily = "Trebuchet MS";
        this.textBlock.shadowOffsetX = 1;
        this.textBlock.shadowBlur = 15;
        this.textBlock.shadowColor = "#594000FF";
        this.textBlock.fontWeight = "bold";
        this.textBlock.textVerticalAlignment = TextBlock.VERTICAL_ALIGNMENT_BOTTOM;
        this.textBlock.paddingBottom = 100;
        this.textBlock.alpha = 0;
    }
    public isPlayed(): boolean {
        return this.isFinished;
    }
    public async play(): Promise<void> {
        //TODO bloquer joueur
        const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("Monolog")
        this.textBlock.text = this.sentences[0];
        advancedTexture.addControl(this.textBlock)
        await FadeText.fadeIn(this.textBlock);
        const next = Button.CreateSimpleButton("next", "");
        next.width = 100;
        next.height = 100;
        advancedTexture.addControl(next);
        let canClick = true;
        next.onPointerUpObservable.add(async () => {
            if (canClick){
                canClick = false;
                this.current_sentence++;
                await FadeText.fadeOut(this.textBlock);
                if (this.current_sentence > this.sentences.length - 1) {
                    this.isFinished = true;
                    this.textBlock.text = "";
                    advancedTexture.addControl(this.textBlock);
                    next.isVisible = false;
                    advancedTexture.addControl(next);
                    //TODO debloquer joueur
                    //TODO détruire ce gui ? (cest la fin de la fonction)
                }
                else {
                    this.textBlock.text = this.sentences[this.current_sentence];
                    advancedTexture.addControl(this.textBlock);
                    await FadeText.fadeIn(this.textBlock);
                    canClick = true;
                }
            }
        })
    }
}