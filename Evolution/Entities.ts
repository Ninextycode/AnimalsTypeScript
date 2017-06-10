import { ListNode } from "./List"
import { Net } from "./Net"

export class Vector2 {
    private constructor(public x: number, public y: number) { };
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

interface Drawable {
    draw(ctx: CanvasRenderingContext2D, scale: number): void;
}

interface Updatable {
    position: Vector2;
    step(t: number): void;
}

export class Circle implements Drawable {
    angle: number = 0;
    constructor(public position: Vector2 = Vector2.fromCartesian(0, 0),
        public radius?: number, public color?: string) { };

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

    toString(): string {
        return "Circle at " + this.position + " ,radius=" + this.radius;
    }
}

export class Tree implements Drawable {
    constructor(public position: Vector2, public angle: number = 0) {
        this._body = new Circle(position, Tree.radius, "#00CC00");
    }
    _body: Circle;
    get body(): Circle {
        return this._body;
    }
    static readonly initialEnergy: number = 0.3;
    energy: number = Animal.initialEnergy;
    static readonly radius: number = 1;

    draw(ctx: CanvasRenderingContext2D, scale: number = 1): void {
        this._body.draw(ctx, scale);
    }
}

export class Animal implements Updatable, Drawable {
    constructor(public position: Vector2,
        private net: Net, public angle: number = 0) {
        this.eye0 = new Circle(position.add(this.eyeShift1.rotate(angle)), Animal.eyeRadius, "#000000");
        this.eye1 = new Circle(position.add(this.eyeShift2.rotate(angle)), Animal.eyeRadius, "#000000");
        this._body = new Circle(position, Animal.bodyRadius, "#FF0000");

        this.resetObservedTrees();
        for (let i = 0; i < Animal.loopedNeuronsNumber; i++)
            this.loopedValues[i] = 0;
    }
    private static readonly eyeRadius: number = 1/2;
    private static readonly bodyRadius: number = 3;
    private static readonly fieldOfViewAngle: number = Math.PI/4;
    private static readonly fieldOfViewR: number = 70;
    private static readonly fieldOfViewSegments = 4;
    private static readonly shouldDrawFieldOfView: boolean = true;
    private static loopedNeuronsNumber: number = 3;

    static readonly netLayersLength: number[] = [
        Animal.fieldOfViewSegments * 2 + Animal.loopedNeuronsNumber + 1 + 1, //1 for randomness, 1 for bias 
        Animal.fieldOfViewSegments * 2 + Animal.loopedNeuronsNumber + 1,
        2 + Animal.loopedNeuronsNumber
    ];

    // observedTrees[n * numberOfSegments + i] = how many treesin the ith segment of nth eye's fielf of view
    private observedTrees: number[] = new Array<number>(Animal.fieldOfViewSegments * 2);
    private loopedValues: number[] =
        new Array<number>(Animal.loopedNeuronsNumber);
    private eyeShift1: Vector2 =
        Vector2.fromCartesian(Animal.bodyRadius * 0.9, 0).rotate( Math.PI / 3);
    private eyeShift2: Vector2 =
        Vector2.fromCartesian(Animal.bodyRadius * 0.9, 0).rotate(- Math.PI / 3);
    private eye0: Circle;
    private eye1: Circle;
    private _body: Circle;

    static readonly initialEnergy: number = 2;
    energy: number = Animal.initialEnergy;

    speed: number = 0;
    angularSpeed: number = 0;

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
        let out: number[] = this.net.compute(input);
        this.speed = out[0];
        this.angularSpeed = out[1];
        for (let i = 0; i < this.loopedValues.length; i++) {
            this.loopedValues[i] = out[i + 2];
        }
    }

    private resetObservedTrees(): void {
        let i: number = 0;
        let len: number = this.observedTrees.length;
        while (i < this.observedTrees.length) this.observedTrees[i++] = 0;
    }

    private adjustPosition(t: number): void {
        this.position = this.position.add(
            Vector2.fromCartesian(
                this.speed * Math.cos(this.angle),
                this.speed * Math.sin(this.angle)));
        this.angle = (this.angle + this.angularSpeed * t) % (Math.PI * 2);
    }

    private static readonly energyLossPerUnitTime: number = 0.1;
    private adjustEnergy(t: number): void {
        this.energy -= ((Math.abs(this.angularSpeed) + Math.abs(this.speed))*0.04 + Animal.energyLossPerUnitTime) * t;
    }

    private updateElementsPosition(): void {
        this._body.position = this.position;
        this._body.angle = this.angle;
        this.eye0.position = this.position.add(this.eyeShift1.rotate(this.angle));
        this.eye0.angle = this.angle;
        this.eye1.position = this.position.add(this.eyeShift2.rotate(this.angle));
        this.eye1.angle = this.angle;
    }

    draw(ctx: CanvasRenderingContext2D, scale: number = 1): void {
        this._body.draw(ctx, scale);
        this.eye0.draw(ctx, scale);
        this.eye1.draw(ctx, scale);
        if (Animal.shouldDrawFieldOfView) {
            ctx.strokeStyle = "#C00000"
            this.drawFieldOfVied(ctx, this.eye0.position, scale);
            ctx.strokeStyle = "#0000C0"
            this.drawFieldOfVied(ctx, this.eye1.position, scale);
        }
    }

    private drawFieldOfVied(ctx: CanvasRenderingContext2D, position: Vector2, scale: number = 1) {
        ctx.beginPath();
        ctx.arc(
            position.x * scale,
            position.y * scale,
            Animal.fieldOfViewR * scale,
            this.angle - Animal.fieldOfViewAngle / 2,
            this.angle + Animal.fieldOfViewAngle / 2);
        for (let i = 0; i <= Animal.fieldOfViewSegments; i++) {
            ctx.moveTo(position.x * scale, position.y * scale);
            let d: Vector2 = Vector2.fromPolar(
                Animal.fieldOfViewR,
                this.angle - Animal.fieldOfViewAngle / 2 +
                Animal.fieldOfViewAngle / Animal.fieldOfViewSegments * i)
                    .add(position)
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

    private static mutationRate = 0.1; 
    giveAncestor(): Animal {
        let angle: number = 2 * Math.PI * Math.random();
        let p: Vector2 = this.position.add(Vector2.unitVector.scale(3 * Animal.bodyRadius).rotate(angle));
        let ancestor: Animal = new Animal(p, this.net.produceNetWithRandomCahanges(Animal.mutationRate), angle);
        this.energy = this.energy / 2;
        ancestor.energy = this.energy;
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

    private _numberOfAnimals: number = 0;
    private _numberOfTrees: number = 0;

    get numberOfTrees(): number {
        return this._numberOfTrees;
    }

    get numberOfAnimals(): number {
        return this._numberOfAnimals;
    }

    addObject(object: any): void {
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
    }

    constructor(
        public context: CanvasRenderingContext2D,
        private width: number,
        private height: number,
        public minimalNumberOfTrees: number,
        public initialNumberOfAnimals: number,
        public scale: number = 1) {
    }

    private lastTimeReturned: number;

    timePassed(): number {
        if (this.lastTimeReturned == null) {
            this.lastTimeReturned = performance.now();
        }
        let passed: number = performance.now() - this.lastTimeReturned;
        this.lastTimeReturned = performance.now();
        if (this.shouldDraw) {
            return passed;
        } else {
            return 100;
        }
    }

    start(): void {
        window.requestAnimationFrame(() => { this.update() });
    }

    update(): void{
        this.updateGivenTimePassed(this.timePassed());
        for (let listener of this.updateListeners) {
            listener(this);
        }

        window.requestAnimationFrame(() => { this.update() });
    }

    updateGivenTimePassed(time: number): void {
        this.clear()
        this.updateNatire();
        for (let a: ListNode<Animal> = this.animals; a != null; a = a.next) {
            this.updateUpdatable(a.data, time);
            if (this.shouldDraw) {
                a.data.draw(this.context, this.scale);
            }
        }

        if (this.shouldDraw) {
            for (let t: ListNode<Tree> = this.trees; t != null; t = t.next) {
                t.data.draw(this.context, this.scale);
            }
            for (let d: ListNode<Drawable> = this.drawables; d != null; d = d.next) {
                d.data.draw(this.context, this.scale);
            }
        }

        for (let u: ListNode<Updatable> = this.updatables; u != null; u = u.next) {
            this.updateUpdatable(u.data, time);
        }
        for (let d: ListNode<Drawable> = this.drawables; d != null; d = d.next) {
            d.data.draw(this.context, this.scale);
        }
    }

    private updateUpdatable(u: Updatable, time: number) {
        u.step(time / 1000);
        if (u.position.x < 0) {
            u.position.x = 0;
        } else if (u.position.x > this.width) {
            u.position.x = this.width;
        }

        if (u.position.y < 0) {
            u.position.y = 0;
        } else if (u.position.y > this.height) {
            u.position.y = this.height;
        }
    }

    private updateNatire(): void {
        for (let a: ListNode<Animal> = this.animals; a != null; a = a.next) {
            for (let t: ListNode<Tree> = this.trees; t != null; t = t.next) {
                a.data.tryToObserveTree(t.data);

                if (a.data.body.isIntersecting(t.data.body)) {
                    a.data.energy += t.data.energy;
                    this.removeTreeNode(t);
                }
            }
            if (a.data.energy < 0) {
                this.removeAnimalNode(a);
            }
            if (a.data.energy > 2 * Animal.initialEnergy) {
                this.addObject(a.data.giveAncestor());
            }
        }
        if (this._numberOfTrees < this.minimalNumberOfTrees) {
            this.addNewRandomTree();
        }
        if (this._numberOfAnimals == 0) {
            for (let i = 0; i < this.initialNumberOfAnimals; i++) {
                this.addNewRandomAnimal();
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

    private clear(): void {
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    }
}