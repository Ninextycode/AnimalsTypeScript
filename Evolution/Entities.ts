import { ListNode } from "./List"

export class Vector2 {
    constructor(public x: number, public y: number) { };
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
}

interface Drawable {
    draw(ctx: CanvasRenderingContext2D): void;
}

interface Updatable {
    step(t: number): void;
}

class Circle implements Drawable {
    angle: number = 0;
    constructor(public position: Vector2 = new Vector2(0, 0), public radius?: number, public color?: string) { };
    draw(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

export class Tree extends Circle {
    color = "#00CC00"
    energy: number = 1;
    radius: number = 3;
}

export class Animal implements Updatable, Drawable {
    constructor(public position: Vector2, public angle: number = 0) {
        this.eyel = new Circle(position.add(this.eyeShift1.rotate(angle)), 2, "#000000");
        this.eye2 = new Circle(position.add(this.eyeShift2.rotate(angle)), 2, "#000000");
        this.body = new Circle(position, 10, "#FF0000");
    }

    private eyeShift1: Vector2 = new Vector2(8, 0).rotate(Math.PI / 5);
    private eyeShift2: Vector2 = new Vector2(8, 0).rotate(-Math.PI / 5);

    eyel: Circle;
    eye2: Circle;
    body: Circle;

    speed: number = 0;
    angleSpeed: number = 1/10;

    private energy: number = 1;

    step(t: number) {
        this.position = this.position.add(new Vector2(this.speed * Math.cos(this.angle), this.speed * Math.sin(this.angle)));
        this.angle = (this.angle + this.angleSpeed * t) % (Math.PI * 2);
        this.energy -= (this.angleSpeed + this.speed) * t;

        this.updateElements();
    }

    private updateElements(): void {
        this.body.position = this.position;
        this.eyel.position = this.position.add(this.eyeShift1.rotate(this.angle));
        this.eye2.position = this.position.add(this.eyeShift2.rotate(this.angle));
    }

    draw(ctx: CanvasRenderingContext2D): void {
        this.body.draw(ctx);
        this.eyel.draw(ctx);
        this.eye2.draw(ctx);
    }
}

export class World {
    private drawables: ListNode<Drawable> =  null;
    private updatables: ListNode<Updatable> = null;

    add(object: any): void {
        if ("draw" in object) {
            if (this.drawables != null) {
                this.drawables = new ListNode(<Drawable>object);
            } else {
                this.drawables.addBefore(new ListNode(<Drawable>object));
            }
        }
        if ("step" in object) {
            if (this.drawables != null) {
                this.updatables = new ListNode(<Updatable>object);
            } else {
                this.updatables.addBefore(new ListNode(<Updatable>object));
            }
        }
    }

    constructor(public context: CanvasRenderingContext2D) {
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
            d.data.draw(this.context);
        }
    }

    private clear(): void {
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    }
}