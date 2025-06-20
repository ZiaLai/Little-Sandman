import {AdvancedDynamicTexture, Button, TextBlock} from "@babylonjs/gui";
import {FadeText} from "./FadeText";
import {Game} from "../game";

export class Monolog {
    sentences: string[];
    current_sentence = 0;
    isFinished = false;
    textBlock: TextBlock;
    private _game: Game;


    constructor(sentences: string[], game: Game) {
        this._game = game;
        this.sentences = sentences;

    }

    public isPlayed(): boolean {
        return this.isFinished;
    }
    public async play(): Promise<void> {
        // bloquer joueur
        this._game.getPlayer().addMovementBlock();

        const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("Monolog");
        this.textBlock = new TextBlock();
        this.textBlock.color = "#FDF1bf";
        this.textBlock.fontSize = "4%";
        this.textBlock.fontFamily = "Trebuchet MS";
        this.textBlock.shadowOffsetX = 1;
        this.textBlock.shadowBlur = 15;
        this.textBlock.shadowColor = "#594000FF";
        this.textBlock.fontWeight = "bold";
        this.textBlock.textVerticalAlignment = TextBlock.VERTICAL_ALIGNMENT_BOTTOM;
        this.textBlock.paddingBottom = 100;
        this.textBlock.alpha = 0;
        this.textBlock.text = this.sentences[0];

        advancedTexture.addControl(this.textBlock);
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
                    // debloquer joueur
                    this._game.getPlayer().removeMovementBlock();
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