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
        this._loadingDiv.style.justifyContent = "center";
        this._loadingDiv.style.alignItems = "center";
        let path = LoadingScreen64.getData();
        this._loadingDiv.innerHTML = `<img src="${path}" style="width: auto; height: auto;"  alt=""/>`;
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