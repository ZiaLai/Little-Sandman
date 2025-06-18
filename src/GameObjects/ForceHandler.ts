import {Force} from "../Force";

export class ForceHandler {
    public static handleMovement(object: any, force: Force) {
        const detectPlayerFeet = object._detectPlayerFeet();
        const hasForce = object._game.getPlayer().hasForce(object);

        if (detectPlayerFeet && !hasForce) {
            object._game.getPlayer().addForce(force);
        }
        if (!detectPlayerFeet && hasForce) {
            object._game.getPlayer().removeForce(object);
        }
    }
}