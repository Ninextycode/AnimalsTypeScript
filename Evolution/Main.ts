import {World, Tree, Animal, Vector2 } from "./Entities"

window.onload = () => {
    let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("canvas");
    let world: World = new World(canvas.getContext("2d"), 5);
    world.add(new Animal(Vector2.fromCartesian(31, 31), Math.PI / 2));
    world.add(new Tree(Vector2.fromCartesian(40, 40)));
    world.add(new Tree(Vector2.fromCartesian(40, 30)));
    world.add(new Tree(Vector2.fromCartesian(30, 40)));
    world.add(new Tree(Vector2.fromCartesian(30, 30)));

    world.start();
}
