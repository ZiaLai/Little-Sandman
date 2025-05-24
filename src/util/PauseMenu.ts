import {AdvancedDynamicTexture, Button, Control, Image, Rectangle, StackPanel, TextBlock} from "@babylonjs/gui";
import {Game} from "../game";
import {GameState} from "../GameState";
import {State} from "../State";
import {SpawnData} from "../SpawnData";
import {Vector3} from "@babylonjs/core";
import {CityLevel} from "../Levels/CityLevel";

export class PauseMenu {
    private advancedTexture: AdvancedDynamicTexture;
    private pauseMenu;
    constructor(game :Game) {
        this.advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("PAUSE UI");
        this.pauseMenu = new Rectangle();
        this.pauseMenu.width = "100%";
        this.pauseMenu.height = "100%";
        this.pauseMenu.alpha = 0.9;
        this.pauseMenu.thickness = 0;
        //this.pauseMenu.background = "#062E5b";
        this.pauseMenu.isVisible = false;
        this.pauseMenu.verticalAlignement = Control.VERTICAL_ALIGNMENT_CENTER;
        const bgImage = new Image("bg","/textures/etoiles.png");
        bgImage.alpha = 1;
        this.pauseMenu.addControl(bgImage);
        this.advancedTexture.addControl(this.pauseMenu);

        const buttonPanel = new StackPanel();
        buttonPanel.width = "100%";
        buttonPanel.isVertical = true;

        buttonPanel.spacing = 20;
        this.pauseMenu.addControl(buttonPanel);

        function createMenuButton(text, callback) {
            const button = Button.CreateSimpleButton("btn_" + text, "");
            button.fontFamily = "Trebuchet MS";
            button.width = 0.5
            button.height = "100px";
            button.color = "white";
            button.thickness = 1;
            button.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
            button.horizontalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
            button.paddingBottom = 20;
            button.onPointerEnterObservable.add(() => {
                button.background = "#0077cc";
            });

            button.onPointerOutObservable.add(() => {
                //button.background = "#005192";
                button.background = null;
            });

            button.onPointerUpObservable.add(callback);
            const outline = new TextBlock();
            outline.text = text;
            outline.fontStyle ="bold";
            outline.color = "white";
            outline.fontSize = "30px";
            outline.shadowOffsetX = 3;
            outline.shadowColor= "black";
            button.addControl(outline);

            return button;
        }
        buttonPanel.addControl(createMenuButton("Continuer", () => {
            this.pauseMenu.isVisible = false;
            game.setGamestate(GameState.PLAYING);
        }));

        buttonPanel.addControl(createMenuButton("Se téléporter au point de départ", () => {
            console.log("retourner point de depart cliquées");
            this.pauseMenu.isVisible = false;
            game.setGamestate(GameState.PLAYING);


            const spawnData = game.getCurrentLevel().getLastSpawnData();
            game.spawnPlayerAt(spawnData);


            //TODO tp le player (et afficher loading screen pour que ce soit pas trop chelou )
            // Il n'y a rien à charger, si on met le loading screen il restera une seule frame et on le verra même pas...
        }));

        if (game.getCurrentLevel().isNightmareLevel()){

            buttonPanel.addControl(createMenuButton("Recommencer", ()=>{
                console.log("Recommencer niveau");
                game.getCurrentLevel().destroy();
                game.getApp().changeGameScene(game.getCurrentLevel().getName(), game.getCurrentLevel().getLastSpawnData());

                this.pauseMenu.isVisible = false;
                game.setGamestate(GameState.PLAYING);
            }))
            buttonPanel.addControl(createMenuButton("Retour à la ville", ()=>{
                console.log("Retour à la ville");
                this.pauseMenu.isVisible = false;
                game.setGamestate(GameState.PLAYING);
                game.getCurrentLevel().destroy();
                game.getApp().changeGameScene("city", CityLevel.FOUNTAIN_SPAWN_DATA);
            }))
        }


        buttonPanel.addControl(createMenuButton("Quitter", () => {
            console.log("Quitter cliqué");
            game.getApp().goToSomething(State.START);
            this.pauseMenu.isVisible = false;
            game.setGamestate(GameState.PLAYING);
            //TODO (afficher un dialogue qui met en garde ; "attention toute votre progression sera perdue ? ))
        }));
    }
    public show():void{
        this.pauseMenu.isVisible = true;
    }

    public hide(): void {
        this.pauseMenu.isVisible = false;
    }
}