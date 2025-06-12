import {AdvancedDynamicTexture, Button, Control, Image, Rectangle, TextBlock} from "@babylonjs/gui";
import {Game} from "../game";

export class UiFatalError {
    private advancedTexture : AdvancedDynamicTexture;
    private window : Rectangle;
    private titleblock : TextBlock;
    private contentBlock : TextBlock;
    private _game:Game;
    private current_sentence = 0;
    private errorMessages : string[];
    private isFinished = false;

    constructor(errorMessages: string[], errorTitle :string, game:Game) {
        this._game = game;
        this.errorMessages = errorMessages;
        this.advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("ErrorUi "+errorTitle);
        this.window = new Rectangle();
        this.window.width = "100%";
        this.window.height = "100%";
        this.window.alpha = 0.9;
        this.window.thickness = 0;
        this.window.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        const bgImage = new Image("bg","https://cdn.jsdelivr.net/gh/ZiaLai/Little-Sandman@main/public/textures/etoiles.png");// TODO mettre le fond
        this.window.addControl(bgImage);

        this.titleblock = new TextBlock();
        this.titleblock.text = errorTitle;
        // TODO mettre la police spleciale
        this.window.addControl(this.titleblock);

        this.contentBlock = new TextBlock();
        this.contentBlock.fontFamily = "FatalError-Regular"
        this.window.addControl(this.contentBlock);

        this.advancedTexture.addControl(this.window);
    }

    public play():void {
        // bloquer joueur
        this._game.getPlayer().addMovementBlock();
        const next = Button.CreateSimpleButton("next", "");
        next.width = 100;
        next.height = 100;
        this.advancedTexture.addControl(next);
        next.onPointerUpObservable.add(async () => {
            this.current_sentence++;
            if (this.current_sentence > this.errorMessages.length - 1) {
                this.isFinished = true;
                this.advancedTexture.dispose();
                // debloquer joueur
                this._game.getPlayer().removeMovementBlock();
            }
            else {
                this.contentBlock.text = this.errorMessages[this.current_sentence];
                this.advancedTexture.addControl(this.contentBlock);
            }
        });

    }
}