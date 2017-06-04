import { ListNode } from "./List"

export class Vector2 {
    private constructor(public x: number, public y: number) { };
    add(p: Vector2): Vector2 {
        return new Vector2(this.x + p.x, this.y + p.y);
    }
    scale(a: number): Vector2 {
        return new Vector2(this.x * a, this.y * 2);
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
}

interface Drawable {
    draw(ctx: CanvasRenderingContext2D, scale: number): void;
}

interface Updatable {
    step(t: number): void;
}

class Circle implements Drawable {
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
}

export class Tree implements Drawable {
    constructor(public position: Vector2, public angle: number = 0) {
        this.body = new Circle(position, Tree.radius, "#00CC00");
    }
    body: Circle;
    energy: number = 1;
    static readonly radius: number = 1;

    draw(ctx: CanvasRenderingContext2D, scale: number = 1): void {
        this.body.draw(ctx, scale);
    }
}

export class Animal implements Updatable, Drawable {
    constructor(public position: Vector2, public angle: number = 0) {
        this.eye1 = new Circle(position.add(this.eyeShift1.rotate(angle)), Animal.eyeRadius, "#000000");
        this.eye2 = new Circle(position.add(this.eyeShift2.rotate(angle)), Animal.eyeRadius, "#000000");
        this.body = new Circle(position, Animal.bodyRadius, "#FF0000");
    }
    private static readonly eyeRadius: number = 1;
    private static readonly bodyRadius: number = 4;
    private static readonly fieldOfViewAngle: number = Math.PI / 2;
    private static readonly fieldOfViewR: number = 30;
    private static readonly fieldOfViewSegments = 12;
    private static readonly shouldDrawFieldOfView: boolean = true;

    private eyeShift1: Vector2 =
        Vector2.fromCartesian(Animal.bodyRadius * 0.8, 0).rotate(Math.PI / 5);
    private eyeShift2: Vector2 =
        Vector2.fromCartesian(Animal.bodyRadius * 0.8, 0).rotate(- Math.PI / 5);

    private eye1: Circle;
    private eye2: Circle;
    private body: Circle;

    speed: number = 0;
    angleSpeed: number = 0;

    private energy: number = 1;

    step(t: number) {
        this.position = this.position.add(
            Vector2.fromCartesian(
                this.speed * Math.cos(this.angle),
                this.speed * Math.sin(this.angle)));
        this.angle = (this.angle + this.angleSpeed * t) % (Math.PI * 2);
        this.energy -= (this.angleSpeed + this.speed) * t;

        this.updateElements();
    }

    private updateElements(): void {
        this.body.position = this.position;
        this.eye1.position = this.position.add(this.eyeShift1.rotate(this.angle));
        this.eye2.position = this.position.add(this.eyeShift2.rotate(this.angle));
    }

    draw(ctx: CanvasRenderingContext2D, scale: number = 1): void {
        this.body.draw(ctx, scale);
        this.eye1.draw(ctx, scale);
        this.eye2.draw(ctx, scale);
        if (Animal.shouldDrawFieldOfView) {
            this.drawFieldOfVied(ctx, this.eye1.position, scale);
            this.drawFieldOfVied(ctx, this.eye2.position, scale);
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
                    Animal.fieldOfViewAngle / Animal.fieldOfViewSegments * i).add(position);
            ctx.lineTo(d.x * scale, d.y * scale);
        }
        ctx.stroke();
    }
}

export class World {
    private drawables: ListNode<Drawable> =  null;
    private updatables: ListNode<Updatable> = null;

    add(object: any): void {
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

    constructor(public context: CanvasRenderingContext2D, public scale: number = 1) {
    }

    private lastTimeReturned: number;

    timePassed(): number {
        if (this.lastTimeReturned == null) {
            this.lastTimeReturned = performance.now();
        }
        let passed: number = performance.now() - this.lastTimeReturned;
        this.lastTimeReturned = performance.now();
        return passed;
    }

    start(): void {
        window.requestAnimationFrame(() => { this.update() });
    }

    update(): void{
        this.updateGivenStep(this.timePassed());
        window.requestAnimationFrame(() => { this.update() });
    }

    updateGivenStep(t: number): void {
        this.clear()
        for (let u: ListNode<Updatable> = this.updatables; u != null; u = u.next) {
            u.data.step(t/100);
        }
        for (let d: ListNode<Drawable> = this.drawables; d != null; d = d.next) {
            d.data.draw(this.context, this.scale);
        }
    }

    private clear(): void {
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    }
}