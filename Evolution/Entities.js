var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./List"], factory);
    }
})(function (require, exports) {
    "use strict";
    var List_1 = require("./List");
    var Vector2 = (function () {
        function Vector2(x, y) {
            this.x = x;
            this.y = y;
        }
        ;
        Vector2.prototype.add = function (p) {
            return new Vector2(this.x + p.x, this.y + p.y);
        };
        Vector2.prototype.scale = function (a) {
            return new Vector2(this.x * a, this.y * 2);
        };
        Object.defineProperty(Vector2.prototype, "r", {
            get: function () {
                return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Vector2.prototype, "theta", {
            get: function () {
                return Math.atan2(this.y, this.x);
            },
            enumerable: true,
            configurable: true
        });
        Vector2.prototype.rotate = function (theta) {
            return new Vector2(this.r * Math.cos(this.theta + theta), this.r * Math.sin(this.theta + theta));
        };
        return Vector2;
    }());
    exports.Vector2 = Vector2;
    var Circle = (function () {
        function Circle(position, radius, color) {
            if (position === void 0) { position = new Vector2(0, 0); }
            this.position = position;
            this.radius = radius;
            this.color = color;
            this.angle = 0;
        }
        ;
        Circle.prototype.draw = function (ctx) {
            ctx.beginPath();
            ctx.fillStyle = this.color;
            ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        };
        return Circle;
    }());
    var Tree = (function (_super) {
        __extends(Tree, _super);
        function Tree() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.color = "#00CC00";
            _this.energy = 1;
            _this.radius = 3;
            return _this;
        }
        return Tree;
    }(Circle));
    exports.Tree = Tree;
    var Animal = (function () {
        function Animal(position, angle) {
            if (angle === void 0) { angle = 0; }
            this.position = position;
            this.angle = angle;
            this.eyeShift1 = new Vector2(8, 0).rotate(Math.PI / 5);
            this.eyeShift2 = new Vector2(8, 0).rotate(-Math.PI / 5);
            this.speed = 0;
            this.angleSpeed = 1 / 10;
            this.energy = 1;
            this.eyel = new Circle(position.add(this.eyeShift1.rotate(angle)), 2, "#000000");
            this.eye2 = new Circle(position.add(this.eyeShift2.rotate(angle)), 2, "#000000");
            this.body = new Circle(position, 10, "#FF0000");
        }
        Animal.prototype.step = function (t) {
            this.position = this.position.add(new Vector2(this.speed * Math.cos(this.angle), this.speed * Math.sin(this.angle)));
            this.angle = (this.angle + this.angleSpeed * t) % (Math.PI * 2);
            this.energy -= (this.angleSpeed + this.speed) * t;
            this.updateElements();
        };
        Animal.prototype.updateElements = function () {
            this.body.position = this.position;
            this.eyel.position = this.position.add(this.eyeShift1.rotate(this.angle));
            this.eye2.position = this.position.add(this.eyeShift2.rotate(this.angle));
        };
        Animal.prototype.draw = function (ctx) {
            this.body.draw(ctx);
            this.eyel.draw(ctx);
            this.eye2.draw(ctx);
        };
        return Animal;
    }());
    exports.Animal = Animal;
    var World = (function () {
        function World(context) {
            this.context = context;
            this.drawables = null;
            this.updatables = null;
        }
        World.prototype.add = function (object) {
            if ("draw" in object) {
                if (this.drawables != null) {
                    this.drawables = new List_1.ListNode(object);
                }
                else {
                    this.drawables.addBefore(new List_1.ListNode(object));
                }
            }
            if ("step" in object) {
                if (this.drawables != null) {
                    this.updatables = new List_1.ListNode(object);
                }
                else {
                    this.updatables.addBefore(new List_1.ListNode(object));
                }
            }
        };
        World.prototype.timePassed = function () {
            if (this.lastTimeReturned == null) {
                this.lastTimeReturned = performance.now();
            }
            var passed = performance.now() - this.lastTimeReturned;
            this.lastTimeReturned = performance.now();
            return passed;
        };
        World.prototype.start = function () {
            var _this = this;
            window.requestAnimationFrame(function () { _this.update(); });
        };
        World.prototype.update = function () {
            var _this = this;
            this.updateGivenStep(this.timePassed());
            window.requestAnimationFrame(function () { _this.update(); });
        };
        World.prototype.updateGivenStep = function (t) {
            this.clear();
            for (var u = this.updatables; u != null; u = u.next) {
                u.data.step(t / 100);
            }
            for (var d = this.drawables; d != null; d = d.next) {
                d.data.draw(this.context);
            }
        };
        World.prototype.clear = function () {
            this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
        };
        return World;
    }());
    exports.World = World;
});
//# sourceMappingURL=Entities.js.map