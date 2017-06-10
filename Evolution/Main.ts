import { World, Tree, Animal, Vector2 } from "./Entities"
import { Net, Matrix } from "./Net"
import * as $ from "jquery"
window.onload = () => {
    let width: number = 400;
    let height: number = 400;
    let maxTrees: number = 400;
    let initialPopulation: number = 20;
    let scale: number = 1.5;

    $("#app").append(`<div><canvas id="canvas" width=\"${width * scale}"height="${height * scale}"></canvas></div>`);
    let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("canvas");
    let world: World = new World(canvas.getContext("2d"), width, height, maxTrees, initialPopulation, scale);

    $("#app").append(`
        <div>
            Speed: <input id="speed" type="range" step="0.1" min= "0" max="10" value="${world.speed}" style="width: 20%">
            <label id="speedLabel"/>
            </br>
            <input id="drawFieldsOfView" type="checkbox"> <label id="fieldOfVuewLabel">Draw fields of view</label>
        <div>`);
    $("#app").append(`<div id="summary"></div>`);

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
