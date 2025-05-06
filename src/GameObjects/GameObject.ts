import {
    AbstractMesh,
    Mesh,
    Quaternion,
    RichTypeVector2,
    RichTypeVector3,
    TransformNode,
    Vector3
} from "@babylonjs/core";
import {Game} from "../game";

export abstract class GameObject {
    protected _mesh: Mesh;
    protected _game: Game;
    protected _blenderId: string;
    private _startPosition: Vector3;
    protected _child: TransformNode;
    protected _hitbox;

    constructor(game: Game, mesh: Mesh, startPosition: Vector3, blenderId: string) {
        console.log("Creating GameObject");

        this._game = game;
        this._mesh = mesh.clone(blenderId); // On crée une copie du mesh passé en paramètre
        this._mesh.checkCollisions = false;
        this._mesh.isPickable = true;

        //this._child = this._mesh.getChildTransformNodes()[0];

        console.log("Game object child", this._child);
      //  this._mesh = root.getChildMeshes()[0];
        this._blenderId = blenderId;
        this._startPosition = startPosition;
        if (this._mesh === undefined) {
            throw new Error("Undefined mesh when creating a GameObject");
        }
    }

    public abstract update(): void;

    public initialize(): void {
        this._mesh.position = this._startPosition;
        console.log("Initialized breadSlice. Position is now :", this._mesh.position, this._mesh.name, this._mesh.uniqueId);
        //this._initializePosition();
    }

    private _initializePosition(): void {
        let dico = this._game.getEnvironment().getGameObjectsPositions();
        for (let key in dico) {
            if (key.includes(this._blenderId) && dico[key] !== Vector3.Zero()) {

                let x = dico[key].x;
                let y = dico[key].y;
                let z = dico[key].z;
                // Les axes de Blender sont inversés par rapport à ceux de Babylon...
                //this._mesh.position = new Vector3(-x, -z, y);
                let position = new Vector3(x, y, -z);
                console.log("Setting position at", position);

                this._mesh.position = new Vector3(x, y, -z);

                console.log("bread slice type", this._mesh.parent);
            }
        }
    }

    public destroy(): void {

    }

    public getMesh(): Mesh {
        return this._mesh;
    }
}