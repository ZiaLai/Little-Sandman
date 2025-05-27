import {State} from "../State";

export class CinematicData{
    private pathName: string;
    private duration: number;
    private skippable: boolean;
    private wantedState: State;

    constructor(pathName:string, duration:number, skippable:boolean, wantedState:State) {
        this.pathName = pathName;
        this.duration = duration;
        this.skippable = skippable;
        this.wantedState = wantedState;
    }
    public getPath(): string {
        return this.pathName;
    }
    public getDuration(): number {
        return this.duration;
    }
    public isSkippable(): boolean {
        return this.skippable;
    }
    public getWantedState() {
        return this.wantedState;
    }


}