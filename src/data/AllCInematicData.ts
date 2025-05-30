import {CinematicData} from "./CinematicData";
import {State} from "../State";

export class AllCinematicData {
    public static getAllCinematicData() {
        return  [
            new CinematicData("https://raw.githubusercontent.com/ZiaLai/Little-Sandman/main/public/videos/cinematic_intro_ls_ss.mp4",
                88, true, State.START),
            new CinematicData("https://cdn.jsdelivr.net/gh/ZiaLai/Little-Sandman@main/public/videos/Sugarless_to_Sugarfull.mov",7, false, State.THANKS),
            new CinematicData("https://cdn.jsdelivr.net/gh/ZiaLai/Little-Sandman@main/public/videos/intro_ville_compress.mov", 17, false, null)
        ];

    }
    public static getData(index: number): CinematicData {
        let data = this.getAllCinematicData();
        if (index < 0 || index > data.length - 1) {
            return null;
        }
        return data[index];
    }
}