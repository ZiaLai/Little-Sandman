import {TextBlock} from "@babylonjs/gui";

export class FadeText{
    public static async fadeOut(textBlock: TextBlock, duration: number = 1000) {
        return new Promise<void>((resolve) => {

            textBlock.alpha = 1;
            const step = 16;
            const totalSteps = duration / step;
            let currentStep = 0;

            const interval = setInterval(() => {
                currentStep++;
                textBlock.alpha = Math.max(1 - currentStep / totalSteps, 0);

                if (currentStep >= totalSteps) {
                    clearInterval(interval);
                    resolve();
                }
            }, step);
        });
    }
    public static async fadeIn(textBlock: TextBlock, duration: number = 1000) {
        return new Promise<void>((resolve) => {
            textBlock.alpha = 0;
            const step = 16;
            const totalSteps = duration / step;
            let currentStep = 0;

            const interval = setInterval(() => {
                currentStep++;
                textBlock.alpha = Math.min(currentStep / totalSteps, 1);

                if (currentStep >= totalSteps) {
                    clearInterval(interval);
                    resolve();
                }
            }, step);
        });
    }
}