import {Color3, Mesh, MeshBuilder, Scene, StandardMaterial, Vector3} from "@babylonjs/core";
import {Player} from "../Player";

export class ScarffAnimation {

    private rows = 7;
    private cols = 7;
    private spacing = 0.1;
    private gravity = new Vector3(0, -0.001, 0);
    private stiffness = 0.2;
    private damping = 0.98;
    private mesh: Mesh;
    private points = [];
    private wasMoving = false;

    public constructor(scene: Scene) {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                this.points.push({
                    pos: new Vector3((x - this.cols / 2) * this.spacing, (this.rows - y) * this.spacing, 0),
                    oldPos: null,
                    pinned: (y === 0) // Fixer certains sommets du haut
                });
            }
            if (y === 0) console.log("pins:", this.points.slice(-this.cols));
        }

        this.points.forEach(p => p.oldPos = p.pos.clone());

        this.mesh = MeshBuilder.CreateRibbon("cloth", {
            pathArray: Array.from({length: this.rows}, (_, y) =>
                Array.from({length: this.cols}, (_, x) =>
                    this.getPoint(x, y).pos.clone()
                )
            ),
            updatable: true,
            sideOrientation: Mesh.DOUBLESIDE
        }, scene);
        this.mesh.isPickable = false;
        let mat = new StandardMaterial("orangeMat", scene);
        mat.diffuseColor = new Color3(0.571, 0.198, 0.021);
        mat.roughness = 0.96;
        mat.indexOfRefraction = 28;
        mat.emissiveColor = new Color3(0.571, 0.198, 0.021);
        this.mesh.material = mat;
    }

    private getPoint(x, y) {
        if (x < 0 || y < 0 || x >= this.cols || y >= this.rows) return null;
        return this.points[y * this.cols + x];
    }

    public update(neckLocator, isMoving :boolean, player:Player): void {
        if (!isMoving && this.wasMoving) {
            for (let i = 0; i < this.points.length; i++) {
                this.points[i].oldPos = this.points[i].pos.clone();
            }
        }
        this.wasMoving = isMoving;
        for (let i = 0; i < this.points.length; i++) {

            const p = this.points[i];

            if (p.pinned) {
                // TODO 1 REUSSIR A POSITIONNER LE HAUT DE L4ECHARPE DERRIERE LE PERSO
                // TODO 2 : REUSSIR A POSITIONNER LE HAUT DE L4ECHARPE DE TELLE SORTE A CE QUE CA SUIVE LE HAUT DU COU
                p.oldPos = p.pos.clone();
                const localOffset = new Vector3(i * this.spacing - this.cols * this.spacing / 2, 0, 0); // écarte horizontalement TODO FONCTIONNE ?
                const worldOffset = Vector3.TransformCoordinates(localOffset, neckLocator.getWorldMatrix());
                let center = player.getPosition();
                console.log("neck position " + neckLocator.getAbsolutePosition());
                let pos = new Vector3().copyFrom(neckLocator.getAbsolutePosition());
                pos.y+=1.3;
                p.pos = pos;//neckLocator.getAbsolutePosition();//player.getRotateAroundPlayer(1.3, 0, neckLocator.getAbsolutePosition());
                //p.oldPos = worldOffset.clone(); // éviter élasticité inutile;
            }

            else if (!isMoving) {
                const velocity = p.pos.subtract(p.oldPos).scale(this.damping);
                const nextPos = p.pos.add(velocity).add(this.gravity);//.add(this.wind);
                p.oldPos = p.pos;
                p.pos = nextPos;

                }

            for (let y = 0; y < this.rows; y++) {
                for (let x = 0; x < this.cols; x++) {
                    const p1 = this.getPoint(x, y);
                    const neighbors = [
                        this.getPoint(x + 1, y),
                        this.getPoint(x, y + 1)
                    ];
                    for (let p2 of neighbors) {
                        if (!p1 || !p2) continue;
                        const delta = p2.pos.subtract(p1.pos);
                        const dist = this.spacing;
                        const diff = delta.length() - dist;
                        const correction = delta.normalize().scale(diff * 0.5 * this.stiffness);
                        if (!p1.pinned) p1.pos = p1.pos.add(correction);
                        if (!p2.pinned) p2.pos = p2.pos.subtract(correction);
                    }
                }
            }
        }
        // Mettre à jour la géométrie
        for (let i = 0; i < this.points.length; i++) {
            this.mesh.updateMeshPositions((positions) => {
                positions[i * 3 + 0] = this.points[i].pos.x;
                positions[i * 3 + 1] = this.points[i].pos.y;
                positions[i * 3 + 2] = this.points[i].pos.z;
            }, false);
        }

        this.mesh.refreshBoundingInfo();
    }
}