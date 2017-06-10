import assert = require('assert');
import { Matrix, Net } from "./Net";
import { ListNode } from "./List";
import { Circle, Vector2 } from "./Entities"

export function MatixMultiplication() {
    let m1: Matrix = Matrix.fromArray([1, 4, 7, 2, 5, 8, 3, 6, 9], 3, 3);
    let m2: Matrix = Matrix.fromArray([1, 3, 5, 2, 4, 6], 3, 2);
    let r: Matrix = m1.multiply(m2);
    let actual = r.toArray();
    let expected: number[] = [22, 49, 76, 28, 64, 100];
    assert.deepEqual(actual, expected, `\n${m1}\n*\n${m2}\n!=\n${r}`);
}

export function NeuralNet() {
    let m1: Matrix = Matrix.fromArray([1, 2, -2, -1, 1, 2], 2, 3);
    let m2: Matrix = Matrix.fromArray([-1, 0, 1], 1, 3);
    let parameters = m1.toArray().concat(m2.toArray())
    let net: Net = new Net([3, 3, 1], parameters);
    let actual: number = net.compute([1/2, -1/2])[0]
    let expected: number = 2 / 9;
    assert.ok(Math.abs(actual - expected) < 10 ** -6, `\n actual:\n${actual}\n expected: \n${expected}\n`);
}

export function ListTest() {
    let l: ListNode<number> = new ListNode(1);
    for (let i = 0; i < 4; i++) {
        l.addAfter(new ListNode(i));
    }
    assert.equal(l.toStringBackward(),
        "<-(1)");
    assert.equal(l.toStringForward(),
        "(1)->(3)->(2)->(1)->(0)->");

    for (let i = 4; i < 8; i++) {
        l.addBefore(new ListNode(i));
    }

    l = l.next;

    assert.equal(l.toStringBackward(),
        "<-(4)<-(5)<-(6)<-(7)<-(1)<-(3)");
    assert.equal(l.toStringForward(),
        "(3)->(2)->(1)->(0)->");
    l = l.remove();
    assert.equal(l.toStringBackward(),
        "<-(4)<-(5)<-(6)<-(7)<-(1)<-(2)");
    assert.equal(l.toStringForward(),
        "(2)->(1)->(0)->");
    l = l.remove(true);
    assert.equal(l.toStringBackward(),
        "<-(4)<-(5)<-(6)<-(7)<-(1)");
    assert.equal(l.toStringForward(),
        "(1)->(1)->(0)->");
}

export function CircleTest() {
    let c1: Circle = new Circle(Vector2.fromCartesian(0, 0), 1)
    let c2: Circle = new Circle(Vector2.fromCartesian(1, 1), 1)
    let c3: Circle = new Circle(Vector2.fromCartesian(5, 5), 2)
    let c4: Circle = new Circle(Vector2.fromCartesian(0, 0), 3)
    assert.ok(c1.isIntersecting(c2), c1 + " should intersect with " + c2);
    assert.ok(!c1.isIntersecting(c3), c1 + " should not intersect with " + c3);
    assert.ok(!c2.isIntersecting(c3), c2 + " should intersect with " + c2);
    assert.ok(c4.isIntersecting(c1), c4 + " should intersect with " + c1);
    assert.ok(c1.isIntersecting(c2), c1 + " should intersect with " + c2);
}