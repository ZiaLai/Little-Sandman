import {AdvancedDynamicTexture, Control, Rectangle} from "@babylonjs/gui";
import {Mesh, MeshBuilder, Vector3} from "@babylonjs/core";

export class StaminaBar{
    staminaBarContainer;
    staminaBarFill;
    advancedTexture;
    staminaPlane;

    constructor(mesh_parent, scene){
        this.staminaPlane = MeshBuilder.CreatePlane("staminaPlane", { width: 0.3, height: 0.5 }, scene);
        this.staminaPlane.parent = mesh_parent;
        this.staminaPlane.position = new Vector3(0.7, 1.5, 0);
        this.staminaPlane.billboardMode = Mesh.BILLBOARDMODE_ALL; // toujours face caméra

// 2. GUI pour ce plan
        this.advancedTexture = AdvancedDynamicTexture.CreateForMesh(this.staminaPlane);        // Conteneur de la barre
        this.staminaBarContainer = new Rectangle();
        this.staminaBarContainer.width = 0.3;
        this.staminaBarContainer.height = 1;
        this.staminaBarContainer.cornerRadius = 90;
        this.staminaBarContainer.color = "white";
        this.staminaBarContainer.thickness = 2;
        this.staminaBarContainer.background = "black";
        // this.staminaBarContainer.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        // this.staminaBarContainer.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        // this.staminaBarContainer.left = "20px";
        // this.staminaBarContainer.top = "-20px";
        this.advancedTexture.addControl(this.staminaBarContainer);

        // -- Barre d'endurance (remplissage)
        this.staminaBarFill = new Rectangle();
        this.staminaBarFill.width = 1;
        this.staminaBarFill.height = 1;
        //this.staminaBarFill.cornerRadius = 90; // TODO commenter ?
        this.staminaBarFill.thickness = 0;
        this.staminaBarFill.background = "yellow";
        this.staminaBarFill.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
        this.staminaBarContainer.addControl(this.staminaBarFill);
    }
    public updateStaminaBarAnimated(currentStamina, displayedStamina) {
        // Interpolation douce vers la vraie valeur
        const smoothing = 0.05; // Plus petit = plus lent
         displayedStamina += (currentStamina - displayedStamina) * smoothing;

        // Mise à jour visuelle
        this.staminaBarFill.height = Math.max(0, displayedStamina).toFixed(2);
        // Option : couleur dynamique
        if (displayedStamina > 0.5) {
            this.staminaBarFill.background = "yellow";
        } else if (displayedStamina > 0.2) {
            this.staminaBarFill.background = "orange";
        } else {
            this.staminaBarFill.background = "red";
        }
    }
    public updatePosition(vector: Vector3) {
        this.staminaPlane.position = vector;
    }
}
