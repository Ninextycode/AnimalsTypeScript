import assert = require('assert');
import { Matrix, Net } from "./Net";
import { ListNode } from "./List";

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
    let actual: number = net.compute([1, -1])[0]
    let expected: number = 2 / 9;
    assert.ok(Math.abs(actual - expected) < 10 ** -6, `\n actual:\n${actual}\n expected: \n${expected}\n`);
}

export function ListTest() {
    let l: ListNode<number> = new ListNode(1);
    for (let i = 0; i < 4; i++) {
        l.addAfter(new ListNode(i));
    }
    assert.equal(l.toStringBackwatds(),
        "<-(1)");
    assert.equal(l.toStringForwards(),
        "(1)->(3)->(2)->(1)->(0)->");

    for (let i = 4; i < 8; i++) {
        l.addBefore(new ListNode(i));
    }

    l = l.next;

    assert.equal(l.toStringBackwatds(),
        "<-(4)<-(5)<-(6)<-(7)<-(1)<-(3)");
    assert.equal(l.toStringForwards(),
        "(3)->(2)->(1)->(0)->");
    l = l.remove();
    assert.equal(l.toStringBackwatds(),
        "<-(4)<-(5)<-(6)<-(7)<-(1)<-(2)");
    assert.equal(l.toStringForwards(),
        "(2)->(1)->(0)->");
    l = l.remove(true);
    assert.equal(l.toStringBackwatds(),
        "<-(4)<-(5)<-(6)<-(7)<-(1)");
    assert.equal(l.toStringForwards(),
        "(1)->(1)->(0)->");
}
