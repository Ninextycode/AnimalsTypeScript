import { World, Tree, Animal, Vector2 } from "./Entities"
import { Net, Matrix } from "./Net"
import * as $ from "jquery"


var mainWorld: World;
var demoWorld: World;


window.onload = () => {
    let canvasMain: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("mainCanvas");
    let canvasDemo: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("demoCanvas");

    let widthMain: number = 400;
    let heightMain: number =250;
    let widthDemo: number = 100;
    let heightDemo: number = 100;


    let scaleMain: number = Math.min(canvasMain.width / widthMain, canvasMain.height / heightMain);
    let scaleDemo: number = Math.min(canvasDemo.width / widthDemo, canvasDemo.height / heightDemo);

    let maxTrees: number = 400;
    let initialPopulation: number = 20;

    mainWorld = new World(canvasMain.getContext("2d"), widthMain, heightMain, maxTrees, initialPopulation, scaleMain);
    demoWorld = new World(canvasDemo.getContext("2d"), widthDemo, heightDemo, 0, 0, scaleDemo);


    

    mainWorld.start();
    demoWorld.start();
    demoWorld.speed = 0;

    addMainControls(scaleMain)
    addDemoControls(scaleDemo);
    addNetDrawing();
}

function addMainControls(scale: number) {
    addSummary();
    addFieldOfViewDrawControl();
    addSpeedControl($("#mainSpeed"), $("#mainSpeedLabel"), mainWorld);
    addMainCanvasListener(scale);
}

function addDemoControls(scale: number) {
    addDemoCanvasListener(scale);
    addSpeedControl($("#demoSpeed"), $("#demoSpeedLabel"), demoWorld);
    addClearDemoButton();
    addRemoveAnimalDemoButton();
}

function addSummary(): void {
    let summary: JQuery = $("#summary");
    let writeSummary = (w: World) => {
        summary.text("Trees: " + w.numberOfTrees + ", Animals: " + w.numberOfAnimals);
    };
    mainWorld.addUpdateListener(writeSummary);
}

function addSpeedControl(speedSlider: JQuery, speedLabel: JQuery, world: World): void {
    speedSlider.val(world.speed);

    speedSlider.change((event: JQueryEventObject) => {
        speedLabel.text(speedSlider.val());
        world.speed = speedSlider.val();
    }); 
    speedLabel.text(speedSlider.val());
    speedSlider.trigger("change");
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
    let offset: JQueryCoordinates = canvas.offset();
    canvas.mousedown((event: JQueryEventObject) => {
        let p: Vector2 = getCoordinatesOfClick(canvas, event, scale);
        let a: Animal = mainWorld.getCopyOfAnimalAt(p);
        if (a == null) {
            return;
        }
        setupDemonstrationWorld(a);
    });
}

function setupDemonstrationWorld(animalToDemo: Animal) {
    animalToDemo.ableToDie = false;
    animalToDemo.ableToGiveBirth = false;
    animalToDemo.position = Vector2.fromCartesian(demoWorld.width / 2, 5);
    animalToDemo.angle = Math.PI / 2;
    demoWorld.clearFromAnimals();
    demoWorld.addObject(animalToDemo);
}

function addDemoCanvasListener(scale: number): void {
    let canvas: JQuery = $("#demoCanvas");

    let offset: JQueryCoordinates = canvas.offset();
    canvas.mousedown((event: JQueryEventObject) => {
        let p: Vector2 = getCoordinatesOfClick(canvas, event, scale);
        let t: Tree = new Tree(p);
        demoWorld.addObject(t);
    });
}

function getCoordinatesOfClick(canvas: JQuery, event: JQueryEventObject, scale: number): Vector2 {
    let x: number = 0;
    let y: number = 0;

    if (event.pageX || event.pageY) {
        x = event.pageX;
        y = event.pageY;
    }
    else {
        x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    x -= canvas.offset().left;
    y -= canvas.offset().top;

    x = x / scale;
    y = y / scale;

    return Vector2.fromCartesian(x, y);
} 

function addClearDemoButton(): void {
    let btn: JQuery = $("#cleanDemoButton");
    btn.click((event: JQueryEventObject) => {
        demoWorld.clearFromTrees();
    });
}

function addRemoveAnimalDemoButton(): void {
    let btn: JQuery = $("#removeDemoAnimalButton");
    btn.click((event: JQueryEventObject) => {
        demoWorld.clearFromAnimals();
    });
}

function addNetDrawing(): void{
    let canvasNet: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("netCanvas");
    demoWorld.addUpdateListener((w: World) => {
        w.drawNthAnimalNet(0, canvasNet.getContext("2d"));
    });
}