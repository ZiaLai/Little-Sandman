import {ILoadingScreen} from "@babylonjs/core";
import {LoadingScreen64} from "../data/LoadingScreen64";

export class CustomLoadingScreen implements ILoadingScreen {
    loadingUIBackgroundColor = "#000000";
    loadingUIText = "";

    private readonly _loadingDiv: HTMLDivElement;

    constructor() {
        this._loadingDiv = document.createElement("div");
        this._loadingDiv.id = "gifLoadingScreen";
        this._loadingDiv.style.position = "absolute";
        this._loadingDiv.style.top = "0";
        this._loadingDiv.style.left = "0";
        this._loadingDiv.style.width = "100%";
        this._loadingDiv.style.height = "100%";
        this._loadingDiv.style.backgroundColor = this.loadingUIBackgroundColor;
        this._loadingDiv.style.display = "flex";
        //this._loadingDiv.style.flexDirection = "column";
        this._loadingDiv.style.justifyContent = "center";
        this._loadingDiv.style.alignItems = "center";
        //this._loadingDiv.style.zIndex = "1000";
        //let path = LoadingScreen64.getData();
        //this._loadingDiv.innerHTML = `<img src="${path}" style="width: auto; height: auto;"  alt=""/>`;
        const style = document.createElement("style");
        style.innerHTML = `
        @keyframes spritePlay {
            from { background-position: 0 0; }
            to { background-position: -700vw 0; } /* 7 frames × 1920px */
        }
        #spriteLoader {
            width: 100vw;
            height: 100vh;
            background-image: url("https://cdn.jsdelivr.net/gh/ZiaLai/Little-Sandman@main/public/textures/loading_screen_sprite_sheet.png");
            background-repeat: no-repeat;
            background-size: 700vw 100vh;
            animation: spritePlay 1s steps(7) infinite;  
            
        }
        `;
        document.head.appendChild(style);

        // Contenu du loading screen
        this._loadingDiv.innerHTML = `
            <div id="spriteLoader"></div>
        `;


    }

    displayLoadingUI() {
        document.body.appendChild(this._loadingDiv);
    }

    hideLoadingUI() {
        if (this._loadingDiv.parentElement) {
            this._loadingDiv.parentElement.removeChild(this._loadingDiv);
        }
    }
}