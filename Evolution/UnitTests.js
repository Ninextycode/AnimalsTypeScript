"use strict";
var assert = require("assert");
var Net_1 = require("./Net");
var List_1 = require("./List");
function MatixMultiplication() {
    var m1 = Net_1.Matrix.fromArray([1, 4, 7, 2, 5, 8, 3, 6, 9], 3, 3);
    var m2 = Net_1.Matrix.fromArray([1, 3, 5, 2, 4, 6], 3, 2);
    var r = m1.multiply(m2);
    var actual = r.toArray();
    var expected = [22, 49, 76, 28, 64, 100];
    assert.deepEqual(actual, expected, "\n" + m1 + "\n*\n" + m2 + "\n!=\n" + r);
}
exports.MatixMultiplication = MatixMultiplication;
function NeuralNet() {
    var m1 = Net_1.Matrix.fromArray([1, 2, -2, -1, 1, 2], 2, 3);
    var m2 = Net_1.Matrix.fromArray([-1, 0, 1], 1, 3);
    var parameters = m1.toArray().concat(m2.toArray());
    var net = new Net_1.Net([3, 3, 1], parameters);
    var actual = net.compute([1, -1])[0];
    var expected = 2 / 9;
    assert.ok(Math.abs(actual - expected) < Math.pow(10, -6), "\n actual:\n" + actual + "\n expected: \n" + expected + "\n");
}
exports.NeuralNet = NeuralNet;
function ListTest() {
    var l = new List_1.ListNode(1);
    for (var i = 0; i < 4; i++) {
        l.addAfter(new List_1.ListNode(i));
    }
    assert.equal(l.toStringBackwatds(), "<-(1)");
    assert.equal(l.toStringForwards(), "(1)->(3)->(2)->(1)->(0)->");
    for (var i = 4; i < 8; i++) {
        l.addBefore(new List_1.ListNode(i));
    }
    l = l.next;
    assert.equal(l.toStringBackwatds(), "<-(4)<-(5)<-(6)<-(7)<-(1)<-(3)");
    assert.equal(l.toStringForwards(), "(3)->(2)->(1)->(0)->");
    l = l.remove();
    assert.equal(l.toStringBackwatds(), "<-(4)<-(5)<-(6)<-(7)<-(1)<-(2)");
    assert.equal(l.toStringForwards(), "(2)->(1)->(0)->");
    l = l.remove(true);
    assert.equal(l.toStringBackwatds(), "<-(4)<-(5)<-(6)<-(7)<-(1)");
    assert.equal(l.toStringForwards(), "(1)->(1)->(0)->");
}
exports.ListTest = ListTest;
//# sourceMappingURL=UnitTests.js.map