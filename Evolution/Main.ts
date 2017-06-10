import { World, Tree, Animal, Vector2 } from "./Entities"
import { Net, Matrix } from "./Net"
import * as $ from "jquery"
window.onload = () => {
    let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("mainCanvas");
    let width: number = 400;
    let height: number = 400;
    let scale: number = Math.min(canvas.width / width, canvas.height / height);

    let maxTrees: number = 400;
    let initialPopulation: number = 20;

    let world: World = new World(canvas.getContext("2d"), width, height, maxTrees, initialPopulation, scale);

    addSummary(world);
    addFieldOfViewDrawControl();
    addSpeedControl(world);
    addMainCanvasListener(scale)

    world.start();
}

function addSummary(world: World): void {
    let summary: JQuery = $("#summary");
    let writeSummary = (w: World) => {
        summary.text("Trees: " + w.numberOfTrees + ", Animals: " + w.numberOfAnimals);
    };
    world.addUpdateListener(writeSummary);
}

function addSpeedControl(world: World): void {
    let speedSlider: JQuery = $("#speed");
    let speedLabel: JQuery = $("#speedLabel");
    speedSlider.val(world.speed);
    speedLabel.text(speedSlider.val());
    speedSlider.on('input change', (event: JQueryEventObject) => {
        speedLabel.text(speedSlider.val());
        world.speed = speedSlider.val();
    }); 
}

function addFieldOfViewDrawControl(): void {
    let drawFieldsOfView = $("#drawFieldsOfView");
    drawFieldsOfView.prop("checked", Animal.drawFieldOfView);
    drawFieldsOfView.click((event: JQueryEventObject) => {
        Animal.drawFieldOfView = drawFieldsOfView.prop('checked');
    });
}

function addMainCanvasListener(scale: number): void {
    let canvas: JQuery = $("#mainCanvas");
    let canoffset: JQueryCoordinates = canvas.offset();
    canvas.click((event: JQueryEventObject) => {
        let x: number = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft - Math.floor(canoffset.left);
        x = x / scale;
        let y: number = event.clientY + document.body.scrollTop + document.documentElement.scrollTop - Math.floor(canoffset.top) + 1;
        y = y / scale;
        alert(x + " " + y)
    });
}