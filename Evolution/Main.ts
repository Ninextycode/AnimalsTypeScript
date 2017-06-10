import { World, Tree, Animal, Vector2 } from "./Entities"
import { Net, Matrix } from "./Net"
import * as $ from "jquery"
window.onload = () => {
    let width: number = 300;
    let height: number = 300;
    let scale: number = 3;

    $("body").append(`<div><canvas id=\"canvas\" width=\"${width * scale}\"height=\"${height * scale}\"></canvas></div>`);
    $("body").append(`<div><button type=\"button\" id=\"animationButton\">Stop drawing</button></div>`);
    $("body").append(`<div id="summary"></div>`);
    let summary: JQuery = $("#summary");

    let writeSummary = (w: World) => {
        summary.text("Trees: " + w.numberOfTrees + ", Animals: " + w.numberOfAnimals);
    };

    let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("canvas");
    let world: World = new World(canvas.getContext("2d"), width, height, 50, 20, scale);
    world.addUpdateListener(writeSummary);
    $("#animationButton").click((event: JQueryEventObject) => {
        world.shouldDraw = !world.shouldDraw;
        $("#animationButton").text((world.shouldDraw ? "Stop" : "Start") + " drawing");
    });

    world.start();
}
