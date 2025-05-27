import {
    Mesh,
    TransformNode,
    Vector3
} from "@babylonjs/core";
import {Game} from "../game";

export abstract class GameObject {
    protected _meshes: Mesh[];
    protected _game: Game;
    protected _blenderId: string;
    private _startPosition: Vector3;
    protected _hitbox;
    protected _parentNode;

    constructor(game: Game, parentNode: TransformNode, startPosition: Vector3) {
        //console.log("Creating GameObject");

        this._game = game;

        this._parentNode = parentNode.clone("GameObject", null);

        this._parentNode.position = startPosition;

        const children = this._parentNode.getChildMeshes();

        this._meshes = [];

        for (const child of children) {
            const mesh: Mesh = child as Mesh;
            mesh.checkCollisions = false;
            mesh.isPickable = true;
            mesh.isVisible = true;
            this._meshes.push(mesh.clone(""));
        }



        //this._blenderId = blenderId;
        this._startPosition = startPosition;
       // if (! this._meshes) throw new Error("Undefined mesh when creating a GameObject");

    }

    public abstract update(): void;

    public initialize(): void {
        this._parentNode.position = this._startPosition;
        // console.log("Initialized breadSlice. Position is now :", this._mesh.position, this._mesh.name, this._mesh.uniqueId);
    }

    // private _initializePosition(): void {
    //     let dico = this._game.getEnvironment().getGameObjectsPositions();
    //     for (let key in dico) {
    //         if (key.includes(this._blenderId) && dico[key] !== Vector3.Zero()) {
    //
    //             let x = dico[key].x;
    //             let y = dico[key].y;
    //             let z = dico[key].z;
    //             // Les axes de Blender sont inversés par rapport à ceux de Babylon...
    //             //this._mesh.position = new Vector3(-x, -z, y);
    //             let position = new Vector3(x, y, -z);
    //             console.log("Setting position at", position);
    //
    //             this._mesh.position = new Vector3(x, y, -z);
    //
    //             console.log("bread slice type", this._mesh.parent);
    //         }
    //     }
    // }

    public destroy(): void {
        for (const mesh of this._meshes) {
            mesh.dispose();
        }

        this._parentNode.dispose();

        this._game.destroyGameObject(this);

        //console.log("Game object destroyed", this._game.getCurrentLevel().getObjects());

    }

    public getMeshes(): Mesh[] {
        return this._meshes;
    }
}