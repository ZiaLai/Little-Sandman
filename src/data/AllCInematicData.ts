import {CinematicData} from "./CinematicData";
import {State} from "../State";

export class AllCinematicData {
    public static getAllCinematicData() {
        return  [
            new CinematicData("https://dl.dropbox.com/scl/fi/i7ltk5bf40pv8kbmj4gen/cinematic_intro_ls_ss.mp4?rlkey=40fph0epvxqs3m2slpy2c64yr&st=w0dwxn5u&dl=0",
                88, true, State.START),
            new CinematicData("https://dl.dropbox.com/scl/fi/a4gqak9mq0f4t6ysakdn4/Sugarless-to-Sugarfull.mov?rlkey=cq33ickq77tyzzhzgbrhddl55&st=whb8yjt7&dl=0",7, false, State.THANKS),
            new CinematicData("https://dl.dropbox.com/scl/fi/49aa5hggyb5sd7cb8n3mm/intro-ville.mov?rlkey=mx95ivuy7mhf1k84swmj6bcuk&st=lcqjf5jf&dl=0", 17, false, null)
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