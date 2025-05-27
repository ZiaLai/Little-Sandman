import {AdvancedDynamicTexture, Control, Image, Rectangle, StackPanel, TextBlock} from "@babylonjs/gui";

export class UIActionButton {
    private readonly container:Rectangle;
    constructor(actionText:string, pathImageControl:string) {
        let advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI_" + actionText);
        this.container = new Rectangle();
        this.container.width = "15%"
        this.container.height = "10%";
        this.container.thickness = 0;
        this.container.horizontalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        this.container.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        advancedTexture.addControl(this.container);

        const panel = new StackPanel();
        panel.height = "100%";
        panel.width = "100%";
        panel.isVertical = false;
        panel.spacing = 10;
        panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.container.addControl(panel);


        const text = new TextBlock();
        text.text = actionText;
        text.fontStyle ="bold";
        text.color = "white";
        text.fontSize = "35%";
        text.shadowOffsetX = 3;
        text.shadowColor= "black";
        text.paddingLeft = "15px";


        const imageControl = new Image("ImageControl",pathImageControl);
        imageControl.width = "35px"
        imageControl.height = "35px"

        panel.addControl(text);

        panel.addControl(imageControl);

    }

    public hide(): void {
        this.container.isVisible = false;
    }
    public show(): void {
        this.container.isVisible = true;
    }
}