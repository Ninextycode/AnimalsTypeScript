import {World, Tree, Animal, Vector2 } from "./Entities"

window.onload = () => {
    let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("canvas");
    let world: World = new World(canvas.getContext("2d"));
    world.add(new Tree(new Vector2(40, 40)));
    world.add(new Tree(new Vector2(40, 30)));
    world.add(new Tree(new Vector2(30, 40)));
    world.add(new Tree(new Vector2(30, 30)));
    world.add(new Animal(new Vector2(31, 31), Math.PI / 3));
    console.log("a");
    world.start();
}