import {World, Tree, Animal, Vector2 } from "./Entities"
import { Net } from "./Net"
window.onload = () => {
    let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("canvas");
    let world: World = new World(canvas.getContext("2d"), 600, 600, 1);
    world.add(new Animal(Vector2.fromCartesian(38, 8), Math.PI / 8));
    world.add(new Tree(Vector2.fromCartesian(63, 11)));
    world.start();
}
