"use strict";
var ListNode = (function () {
    function ListNode(data) {
        this.data = data;
        this.previous = null;
        this.next = null;
    }
    ListNode.prototype.addBefore = function (n) {
        n.previous = this.previous;
        n.next = this;
        if (this.previous != null) {
            this.previous.next = n;
        }
        this.previous = n;
    };
    ListNode.prototype.addAfter = function (n) {
        n.next = this.next;
        n.previous = this;
        if (this.next != null) {
            this.next.previous = n;
        }
        this.next = n;
    };
    ListNode.prototype.remove = function (returnPrevious) {
        if (returnPrevious === void 0) { returnPrevious = false; }
        if (this.next != null) {
            this.next.previous = this.previous;
        }
        if (this.previous != null) {
            this.previous.next = this.next;
        }
        var n = returnPrevious ? this.previous : this.next;
        this.next = null;
        this.previous = null;
        return n;
    };
    ListNode.prototype.toStringForwards = function () {
        var node = this;
        var s = "";
        while (node != null) {
            s += "(" + node.data + ")";
            s += "->";
            node = node.next;
        }
        return s;
    };
    ListNode.prototype.toStringBackwatds = function () {
        var node = this;
        var s = "";
        while (node != null) {
            s = "(" + node.data + ")" + s;
            s = "<-" + s;
            node = node.previous;
        }
        return s;
    };
    return ListNode;
}());
exports.ListNode = ListNode;
//# sourceMappingURL=List.js.map