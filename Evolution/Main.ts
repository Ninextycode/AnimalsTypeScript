import { World, Tree, Animal, Vector2 } from "./Entities"
import { Net, Matrix } from "./Net"
import * as $ from "jquery"
window.onload = () => {
    let width: number = 400;
    let height: number = 400;
    let scale: number = 1.5;

    let netCanvasWidth: number = 400;
    let netCanvasHeight: number = 400;
    let netCanvasScale: number = 1.5;

    let maxTrees: number = 400;
    let initialPopulation: number = 20;

    let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("mainCanvas");
    let world: World = new World(canvas.getContext("2d"), width, height, maxTrees, initialPopulation, scale);

    let summary: JQuery = $("#summary");
    let writeSummary = (w: World) => {
        summary.text("Trees: " + w.numberOfTrees + ", Animals: " + w.numberOfAnimals);
    };
    world.addUpdateListener(writeSummary);

    let speedSlider: JQuery = $("#speed");
    let speedLabel: JQuery = $("#speedLabel");
    speedLabel.text(speedSlider.val());
    speedSlider.on('input change', (event: JQueryEventObject) => {
        speedLabel.text(speedSlider.val());
        world.speed = speedSlider.val();
    }); 

    let drawFieldsOfView = $("#drawFieldsOfView");
    drawFieldsOfView.prop("checked", Animal.drawFieldOfView);
    drawFieldsOfView.click((event: JQueryEventObject) => {
        Animal.drawFieldOfView = drawFieldsOfView.prop('checked');
    });
    world.start();
}
