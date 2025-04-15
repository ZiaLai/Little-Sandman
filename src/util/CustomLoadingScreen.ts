import {ILoadingScreen} from "@babylonjs/core";

export class CustomLoadingScreen implements ILoadingScreen {
    //optional, but needed due to interface definitions
    public loadingUIBackgroundColor: string
    constructor(public loadingUIText: string) {}
    public displayLoadingUI() {
        // todo c'est ici qu'il faut afficher le gfif sur tout l'ecran ? => comment faire ?
        // ou plutot une video ? car gif ca a l'air compliqué... ?

    }

    public hideLoadingUI() {
    }
}