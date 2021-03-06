﻿import { ListNode } from "./List"
import { Net } from "./Net"

export class Vector2 {
    private constructor(public readonly x: number, public readonly y: number) { };
    add(p: Vector2): Vector2 {
        return new Vector2(this.x + p.x, this.y + p.y);
    }
    scale(a: number): Vector2 {
        return new Vector2(this.x * a, this.y * a);
    }
    get r(): number {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }
    get theta(): number {
        return Math.atan2(this.y, this.x);
    }
    rotate(theta: number): Vector2 {
        return new Vector2(this.r * Math.cos(this.theta + theta), this.r * Math.sin(this.theta + theta));
    }
    static fromPolar(r: number, theta: number): Vector2 {
        return new Vector2(Math.cos(theta) * r, Math.sin(theta) * r);
    }
    static fromCartesian(x: number, y: number): Vector2 {
        return new Vector2(x, y);
    }
    static readonly unitVector: Vector2 = new Vector2(1, 1);

    toString() {
        return "( " + this.x + ", " + this.y + ")";
    }
}

interface Positionable {
    position: Vector2;
}

interface Drawable extends Positionable {
    position: Vector2;
    draw(ctx: CanvasRenderingContext2D, scale: number): void;
}

interface Updatable extends Positionable {
    position: Vector2;
    step(t: number): void;
}

export class Circle implements Drawable {

    constructor(public position: Vector2 = Vector2.fromCartesian(0, 0),
        public radius: number = 0, public angle : number = 0, public color: string = "0ffffff") { };

    draw(ctx: CanvasRenderingContext2D, scale: number = 1): void {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(
            this.position.x * scale,
            this.position.y * scale,
            this.radius * scale, 0, Math.PI * 2);
        ctx.fill();
    }

    isIntersecting(c: Circle): boolean {
        return (this.position.scale(-1).add(c.position).r < c.radius + this.radius);
    }

    containsPoint(point: Vector2) {
        return this.isIntersecting(new Circle(point, 0));
    }

    toString(): string {
        return "Circle at " + this.position + " ,radius=" + this.radius;
    }
}

export class Tree implements Drawable {
    constructor(public position: Vector2, public angle: number = 0) {
        this._body = new Circle(position, Tree.radius, 0, "#00CC00");
    }
    _body: Circle;
    get body(): Circle {
        return this._body;
    }
    static readonly initialEnergy: number = 0.5;
    energy: number = Animal.initialEnergy;
    static readonly radius: number = 1;

    draw(ctx: CanvasRenderingContext2D, scale: number = 1): void {
        this._body.draw(ctx, scale);
    }
}

export class Animal implements Updatable, Drawable {
    private static readonly eyeRadius: number = 1/2;
    private static readonly bodyRadius: number = 3;
    private static readonly fieldOfViewAngle: number = Math.PI / 3;
    private static readonly fieldOfViewR: number = 80;
    private static readonly fieldOfViewSegments = 6;
    
    private static loopedNeuronsNumber: number = 2 + 2; // 2 for speed and angularSpeed
    private static mutationRate = 0.05;

    private static eye0Shift: Vector2 =
        Vector2.fromCartesian(Animal.bodyRadius * 0.9, 0).rotate(Math.PI / 3);
    private static eye1Shift: Vector2 =
        Vector2.fromCartesian(Animal.bodyRadius * 0.9, 0).rotate(- Math.PI / 3);
    private static eye0Rotate: number = Math.PI / 10;
    private static eye1Rotate: number = - Math.PI / 10;
    static readonly netLayersLength: number[] = [
        Animal.fieldOfViewSegments * 2 + Animal.loopedNeuronsNumber + 1 + 1, //1 for randomness, 1 for bias,
        Animal.fieldOfViewSegments * 2 + Animal.loopedNeuronsNumber + 1,
        Animal.loopedNeuronsNumber
    ];
    static drawFieldOfView: boolean = false;
    static readonly initialEnergy: number = 2;
    static readonly speedScale = 0.05;
    static readonly angleSpeedScale = 0.005;

    get position(): Vector2 {
        return this._position;
    }

    set position(p: Vector2) {
        this._position = p;
        this.updateElementsPosition();
    }

    get angle(): number {
        return this._angle;
    }

    set angle(p: number) {
        this._angle = p;
        this.updateElementsPosition();
    }

    get net(): Net {
        return this._net;
    }

    constructor(private _position: Vector2,
        private _net: Net, private _angle: number = 0) {
        this.eye0 = new Circle(_position.add(Animal.eye0Shift.rotate(_angle)), Animal.eyeRadius, Animal.eye0Rotate, "#000000");
        this.eye1 = new Circle(_position.add(Animal.eye1Shift.rotate(_angle)), Animal.eyeRadius, Animal.eye0Rotate, "#000000");
        this._body = new Circle(_position, Animal.bodyRadius, _angle, "#FF0000");

        this.updateElementsPosition();

        this.resetObservedTrees();
        for (let i = 0; i < Animal.loopedNeuronsNumber; i++)
            this.loopedValues[i] = 0;
    }

    // observedTrees[n * numberOfSegments + i] = how many treesin the ith segment of nth eye's fielf of view
    private observedTrees: number[] = new Array<number>(Animal.fieldOfViewSegments * 2);
    private loopedValues: number[] =
        new Array<number>(Animal.loopedNeuronsNumber);

    private eye0: Circle;
    private eye1: Circle;
    private _body: Circle;


    energy: number = Animal.initialEnergy;

    speed: number = 0;
    angularSpeed: number = 0;
    ableToGiveBirth: boolean = true;
    ableToDie: boolean = true;

    copy(): Animal {
        let a: Animal = new Animal(this._position, this._net.copy(), this._angle);
        a.energy = this.energy;
        return a;
    }

    get body(): Circle {
        return this._body;
    }

    step(t: number) {
        this.ajustVelocity();
        this.adjustPosition(t);
        this.adjustEnergy(t);   
        this.updateElementsPosition();
        this.resetObservedTrees();
    }

    private ajustVelocity(): void {
        let input: number[] =
            this.observedTrees.concat(this.loopedValues).concat([Math.random() * 2 - 1]);
        let out: number[] = this._net.compute(input);
        this.speed = out[0] * Animal.speedScale;
        this.angularSpeed = out[1] * Animal.angleSpeedScale;
        for (let i = 0; i < this.loopedValues.length; i++) {
            this.loopedValues[i] = out[i];
        }
    }

    private resetObservedTrees(): void {
        let i: number = 0;
        let len: number = this.observedTrees.length;
        while (i < this.observedTrees.length) this.observedTrees[i++] = 0;
    }

    private adjustPosition(t: number): void {
        this._position = this._position.add(
            Vector2.fromPolar(this.speed, this._angle).scale(t));
        this._angle = (this._angle + this.angularSpeed * t) % (Math.PI * 2);
    }

    private static readonly energyLossPerUnitTime: number = 0.05 / 1000;
    private adjustEnergy(t: number): void {
        let spentOnRotation = Math.abs(this.angularSpeed) * 0.01 * t;
        let spentOnSpeed = Math.abs(this.speed) * (this.speed > 0? 0.02 : 0.1) * t; //discourage negative speed
        this.energy -= (spentOnSpeed + spentOnRotation + Animal.energyLossPerUnitTime * t) ;
    }

    private updateElementsPosition(): void {
        this._body.position = this._position;
        this._body.angle = this._angle;
        this.eye0.position = this._position.add(Animal.eye0Shift.rotate(this._angle));
        this.eye0.angle = this._angle + Animal.eye0Rotate;
        this.eye1.position = this._position.add(Animal.eye1Shift.rotate(this._angle));
        this.eye1.angle = this._angle + Animal.eye1Rotate;;
    }

    draw(ctx: CanvasRenderingContext2D, scale: number = 1): void {
        this._body.draw(ctx, scale);
        this.eye0.draw(ctx, scale);
        this.eye1.draw(ctx, scale);
        if (Animal.drawFieldOfView) {
            ctx.strokeStyle = "#C00000"
            this.drawFieldOfVied(ctx, this.eye0, scale);
            ctx.strokeStyle = "#0000C0"
            this.drawFieldOfVied(ctx, this.eye1, scale);
        }
    }

    private drawFieldOfVied(ctx: CanvasRenderingContext2D, eye: Circle, scale: number = 1) {
        ctx.beginPath();
        ctx.arc(
            eye.position.x * scale,
            eye.position.y * scale,
            Animal.fieldOfViewR * scale,
            eye.angle - Animal.fieldOfViewAngle / 2,
            eye.angle + Animal.fieldOfViewAngle / 2);
        for (let i = 0; i <= Animal.fieldOfViewSegments; i++) {
            ctx.moveTo(eye.position.x * scale, eye.position.y * scale);
            let d: Vector2 = Vector2.fromPolar(
                Animal.fieldOfViewR,
                eye.angle - Animal.fieldOfViewAngle / 2 +
                Animal.fieldOfViewAngle / Animal.fieldOfViewSegments * i)
                    .add(eye.position)
                    .scale(scale);
            ctx.lineTo(d.x, d.y);
        }
        ctx.stroke();
    }

    tryToObserveTree(tree: Tree) {
        let where: number[] = this.inWhichSectors(tree.position);
        if (!isNaN(where[0])) {
            this.observedTrees[where[0]] += 1;
        }
        if (!isNaN(where[1])) {
            this.observedTrees[Animal.fieldOfViewSegments + where[1]] += 1;
        }
    }

    private inWhichSectors(point: Vector2): number[] {
        return [
            this.inWhichSector(this.eye0, point),
            this.inWhichSector(this.eye1, point)
        ]; 
    }

    private inWhichSector(eye: Circle, point: Vector2): number {
        let relPos: Vector2 = point.add(eye.position.scale(-1)).rotate(
            - eye.angle + Animal.fieldOfViewAngle / 2);
        if (relPos.r < Animal.fieldOfViewR &&
            0 < relPos.theta &&
            relPos.theta < Animal.fieldOfViewAngle) {
            let segmentAngle: number = Animal.fieldOfViewAngle / Animal.fieldOfViewSegments;
            return Math.floor((relPos.theta) / segmentAngle);
        }
        return NaN;
    }

    giveAncestor(mutationRate: number = Animal.mutationRate): Animal {
        if (!this.ableToGiveBirth) {
            return null;
        }
        let angle: number = 2 * Math.PI * Math.random();
        let p: Vector2 = this._position.add(Vector2.unitVector.scale(3 * Animal.bodyRadius).rotate(angle));
        let ancestor: Animal = new Animal(p, this._net.produceNetWithRandomChanges(mutationRate), angle);
        this.energy = this.energy - ancestor.energy;
        return ancestor;
    }
}

export class World {
    private drawables: ListNode<Drawable> =  null;
    private updatables: ListNode<Updatable> = null;
    private animals: ListNode<Animal> = null;
    private trees: ListNode<Tree> = null;

    private updateListeners: ((w: World) => (void))[] = [];
    addUpdateListener(listener: ((w: World) => (void))) {
        this.updateListeners.push(listener);
    }

    shouldDraw: boolean = true;
    speed: number = 1;

    private _numberOfAnimals: number = 0;
    private _numberOfTrees: number = 0;

    get numberOfTrees(): number {
        return this._numberOfTrees;
    }

    get numberOfAnimals(): number {
        return this._numberOfAnimals;
    }

    addObject(object: any): void {
        if (object == null) {
            return;
        }
        if (object instanceof Animal) {
            this._numberOfAnimals++;
            if (this.animals == null) {
                this.animals = new ListNode(<Animal>object);
            } else {
                let t: ListNode<Animal> = new ListNode(<Animal>object);
                this.animals.addBefore(t);
                this.animals = t;
            }
        } else if (object instanceof Tree) {
            this._numberOfTrees++;
            if (this.trees == null) {
                this.trees = new ListNode(<Tree>object);
            } else {
                let t: ListNode<Tree> = new ListNode(<Tree>object);
                this.trees.addBefore(t);
                this.trees = t;
            }
        } else {
            if ("draw" in object) {
                if (this.drawables == null) {
                    this.drawables = new ListNode(<Drawable>object);
                } else {
                    let t: ListNode<Drawable> = new ListNode(<Drawable>object);
                    this.drawables.addBefore(t);
                    this.drawables = t;
                }
            }
            if ("step" in object) {
                if (this.updatables == null) {
                    this.updatables = new ListNode(<Updatable>object);
                } else {
                    let t: ListNode<Updatable> = new ListNode(<Updatable>object);
                    this.updatables.addBefore(t);
                    this.updatables = t;
                }
            }
        }

        if ("draw" in object) {
            this.draw();
        }
    }

    minNimberOfTrees: number = 1;
    constructor(
        public context: CanvasRenderingContext2D,
        public readonly width: number,
        public readonly height: number,
        public maxNumberOfTrees: number,
        public initialNumberOfAnimals: number,
        public scale: number = 1) {

        this.spawnAnimals();
        this.spawnTrees();
        this.minNimberOfTrees = maxNumberOfTrees / 6;
    }

    public drawNthAnimalNet(n: number, ctx: CanvasRenderingContext2D): void {
        for (let a: ListNode<Animal> = this.animals; a != null; a = a.next) {
            if (n == 0) {
                a.data.net.drawLastInput(ctx, [` speed /${Animal.speedScale}`, ` angular speed /${Animal.angleSpeedScale}`, " looped value", " looped value"]);
            }
            n--;
        }
    }

    private _running: boolean = false;

    get running() {
        return this._running;
    }

    private spawnAnimals(): void {
        for (let i = this.numberOfAnimals; i < this.initialNumberOfAnimals; i++) {
            this.addNewRandomAnimal();
        }
    }

    private spawnAnimalsFromParent(parent: Animal): void {
        let numberToSpawn: number = this.initialNumberOfAnimals - this.numberOfAnimals;
        for (let i = 0; i < numberToSpawn / 2; i++) {
            let a: Animal = parent.giveAncestor(0.25);
            a.position = Vector2.fromCartesian(this.width * Math.random(), this.height * Math.random());
            this.addObject(a);
        }
        this.spawnAnimals();
    }

    private spawnTrees(): void {
        for (let i = this.numberOfTrees; i < this.maxNumberOfTrees / 4; i++) {
            this.addNewRandomTree();
        }
    }

    private lastTimeReturned: number;

    private timePassed(): number {
        if (this.lastTimeReturned == null) {
            this.lastTimeReturned = performance.now();
        }
        let passed: number = performance.now() - this.lastTimeReturned;
        this.lastTimeReturned = performance.now();
        return passed * this.speed;    
    }

    start(): void {
        this.lastTimeReturned = null;
        window.requestAnimationFrame(() => { this.update() });
        this._running = true;
    }

    private stopFlag = false;
    stop(): void {
        this.stopFlag = true;
        this._running = false;
    }

    private update(): void{
        let t: number = this.timePassed();
        this.updateGivenTimePassed(t);
        for (let listener of this.updateListeners) {
            listener(this);
        }
        if (!this.stopFlag) {
            window.requestAnimationFrame(() => { this.update() });
        } else {
            this.stopFlag = false;
        }
    }

    private updateGivenTimePassed(time: number): void {
        this.updateNatire(time);
        this.updateUpdatables(time);
        this.draw();

    }

    private draw(): void {
        this.clearCanvas();
        if(! this.shouldDraw) {
            return;
        }
        for (let a: ListNode<Animal> = this.animals; a != null; a = a.next) {
            a.data.draw(this.context, this.scale);
        }

        for (let t: ListNode<Tree> = this.trees; t != null; t = t.next) {
            t.data.draw(this.context, this.scale);
        }
        for (let d: ListNode<Drawable> = this.drawables; d != null; d = d.next) {
            d.data.draw(this.context, this.scale);
        }
    
    }

    private updateUpdatables(time: number) {
        for (let u: ListNode<Updatable> = this.updatables; u != null; u = u.next) {
            this.updateUpdatable(u.data, time);
        }
    }

    private updateUpdatable(u: Updatable, time: number) {
        u.step(time);
        this.adjustPosition(u);
    }

    private adjustPosition(p: Positionable) {
        if (p.position.x < 0) {
            p.position = Vector2.fromCartesian(0, p.position.y);
        } else if (p.position.x > this.width) {
            p.position = Vector2.fromCartesian(this.width, p.position.y);
        }

        if (p.position.y < 0) {
            p.position = Vector2.fromCartesian(p.position.x, 0);
        } else if (p.position.y > this.height) {
            p.position = Vector2.fromCartesian(p.position.x, this.height);
        }
    }

    private updateNatire(time: number): void {
        this.updateAnimals(time);
        this.updateOnCollisions();
        
        this.spawnAdditionalEntities(time);
    }

    private updateAnimals(time: number) {
        for (let a: ListNode<Animal> = this.animals; a != null; a = a.next) {
            this.updateUpdatable(a.data, time);
        }
    }

    private updateOnCollisions() {
        for (let a: ListNode<Animal> = this.animals; a != null; a = a.next) {
            for (let t: ListNode<Tree> = this.trees; t != null; t = t.next) {
                a.data.tryToObserveTree(t.data);

                if (a.data.body.isIntersecting(t.data.body)) {
                    a.data.energy += t.data.energy;
                    this.removeTreeNode(t);
                }
            }
            if (a.data.energy < 0 && a.data.ableToDie) {
                this.removeAnimalNode(a);
            }
            if (a.data.energy > 4 * Animal.initialEnergy) {
                this.addObject(a.data.giveAncestor());
            }
        }
    }

    private static treesGrowthRate: number = 0.02;

    private spawnAdditionalEntities(timePassed: number) {
        if (this.initialNumberOfAnimals > 0) {
            if(this.initialNumberOfAnimals > 1 && this.numberOfAnimals == 1) {
                this.spawnAnimalsFromParent(this.animals.data);
            } else if (this.numberOfAnimals == 0) {
                this.spawnAnimals();
            }
        }
        if (this.numberOfTrees < this.minNimberOfTrees) {
            this.addNewRandomTree();
        }
        let probOfNewTree = Math.min(0.1, timePassed / 1000 * World.treesGrowthRate);
        for (let t: ListNode<Tree> = this.trees; t != null; t = t.next) { //more trees - more iterations - higher chance of a new tree
            if (this.numberOfTrees >= this.maxNumberOfTrees) {
                break;
            }
            if (Math.random() < probOfNewTree) {
                this.addNewRandomTree();
            }
        }
    }

    addNewRandomTree(): void {
        this.addObject(new Tree(Vector2.fromCartesian(Math.random() * this.width, Math.random() * this.height)));
    }

    addNewRandomAnimal(): void {
        this.addObject(new Animal(
            Vector2.fromCartesian(Math.random() * this.width, Math.random() * this.height),
            Net.randomNet(Animal.netLayersLength),
            2 * Math.PI * Math.random()));
    }

    private removeAnimalNode(n: ListNode<Animal>): void {
        if (n === this.animals) {
            this.animals = n.remove();
        } else {
            n.remove();
        }
        this._numberOfAnimals--;
    }

    private removeTreeNode(n: ListNode<Tree>): void {
        if (n === this.trees) {
            this.trees = n.remove();
        } else {
            n.remove();
        }
        this._numberOfTrees--;
    }

    clearCanvas(): void {
        this.context.fillStyle = "#fceecf";
        this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    }

    clearFromEntities(): void {
        this.drawables = null;
        this.updatables = null;
        this.draw();
    }

    clearFromAnimals(): void {
        this.animals = null;
        this.draw();
    }

    clearFromTrees(): void {
        this.trees = null;
        this.draw();
    }

    getCopyOfAnimalAt(positon: Vector2): Animal {
        for (let a: ListNode<Animal> = this.animals; a != null; a = a.next) {
            if (a.data.body.containsPoint(positon)) {
                return a.data.copy();
            }
        }
        return null;
    }
}