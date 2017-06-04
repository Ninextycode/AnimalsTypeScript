var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
console.log('Hello world');
define("List", ["require", "exports"], function (require, exports) {
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
});
define("Entities", ["require", "exports", "List"], function (require, exports, List_1) {
    "use strict";
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
define("Main", ["require", "exports", "Entities"], function (require, exports, Entities_1) {
    "use strict";
    window.onload = function () {
        var canvas = document.getElementById("canvas");
        var world = new Entities_1.World(canvas.getContext("2d"));
        world.add(new Entities_1.Tree(new Entities_1.Vector2(40, 40)));
        world.add(new Entities_1.Tree(new Entities_1.Vector2(40, 30)));
        world.add(new Entities_1.Tree(new Entities_1.Vector2(30, 40)));
        world.add(new Entities_1.Tree(new Entities_1.Vector2(30, 30)));
        world.add(new Entities_1.Animal(new Entities_1.Vector2(31, 31), Math.PI / 3));
        console.log("a");
        world.start();
    };
});
define("Net", ["require", "exports"], function (require, exports) {
    "use strict";
    var Matrix = (function () {
        function Matrix(data) {
            this.data = data;
        }
        ;
        Matrix.prototype.multiply = function (m2) {
            if (this.cols != m2.rows) {
                throw new Error("this.cols!=m2.rows  " + this.cols + "!=" + m2.rows);
            }
            var newData = new Array(m2.cols);
            for (var col = 0; col < m2.cols; col++) {
                newData[col] = new Array(this.rows);
                for (var row = 0; row < this.rows; row++) {
                    newData[col][row] = this.singleElementInProduct(this.data, m2.data, col, row);
                }
            }
            return new Matrix(newData);
        };
        Matrix.prototype.singleElementInProduct = function (m1data, m2data, col, row) {
            var t = 0;
            for (var k = 0; k < m1data.length; k++) {
                t += (m1data[k][row] * m2data[col][k]);
            }
            return t;
        };
        Matrix.prototype.apply = function (map) {
            for (var row = 0; row < this.rows; row++) {
                for (var col = 0; col < this.cols; col++) {
                    this.data[col][row] = map(this.data[col][row]);
                }
            }
            return this;
        };
        Object.defineProperty(Matrix.prototype, "rows", {
            get: function () {
                return this.cols > 0 ? this.data[0].length : 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Matrix.prototype, "cols", {
            get: function () {
                return this.data.length;
            },
            enumerable: true,
            configurable: true
        });
        Matrix.prototype.toString = function () {
            var s = "";
            for (var row = 0; row < this.rows; row++) {
                s += (this.data[0][row]);
                for (var col = 1; col < this.cols; col++) {
                    s += (", " + this.data[col][row]);
                }
                s += "\n";
            }
            return s;
        };
        Matrix.fromArray = function (a, rows, cols) {
            if (a.length != rows * cols) {
                throw new Error("Iinconsistent dimentions, input length=" + a.length + ", rows=" + rows + ", cols=" + cols);
            }
            var data = new Array(cols);
            for (var i = 0; i < cols; i++) {
                data[i] = a.slice(i * rows, (i + 1) * rows);
            }
            return new Matrix(data);
        };
        Matrix.prototype.toArray = function () {
            var i = 0;
            var a = Array(this.rows * this.cols);
            for (var col = 0; col < this.cols; col++) {
                for (var row = 0; row < this.rows; row++) {
                    a[i++] = this.data[col][row];
                }
            }
            return a;
        };
        return Matrix;
    }());
    exports.Matrix = Matrix;
    var Net = (function () {
        function Net(layersSizes, parameters, //length of laters including bias(lasd layer has no bais unit)
            sigmoid) {
            if (sigmoid === void 0) { sigmoid = function (x) {
                return x / (1 + Math.abs(x));
            }; }
            this.sigmoid = sigmoid;
            this.layersSizes = layersSizes.slice();
            this.transforms = new Array(layersSizes.length - 1);
            var start = 0;
            for (var i = 0; i < layersSizes.length - 2; i++) {
                var length_1 = (layersSizes[i + 1] - 1) * (layersSizes[i]);
                this.transforms[i] = Matrix.fromArray(parameters.slice(start, start + length_1), layersSizes[i + 1] - 1, layersSizes[i]); // -1 to exclude bias unit
                start += length_1;
            }
            var length = layersSizes[layersSizes.length - 2] * layersSizes[layersSizes.length - 1];
            this.transforms[layersSizes.length - 2] =
                Matrix.fromArray(parameters.slice(start, start + length), layersSizes[layersSizes.length - 1], // no bias in output, so no -1
                layersSizes[layersSizes.length - 2]);
        }
        ;
        Net.prototype.compute = function (input) {
            if (input.length + 1 != this.layersSizes[0]) {
                throw new Error("Invalid inpud, length recieved, expected");
            }
            var temp = new Matrix([input]);
            temp.apply(this.sigmoid);
            for (var _i = 0, _a = this.transforms; _i < _a.length; _i++) {
                var m = _a[_i];
                temp.data[0].push(1); //bias
                console.log(m);
                console.log(temp);
                temp = m.multiply(temp);
                temp.apply(this.sigmoid);
            }
            return temp.toArray();
        };
        return Net;
    }());
    exports.Net = Net;
});
define("UnitTests", ["require", "exports", "assert"], function (require, exports, assert) {
    "use strict";
    function Test1() {
        assert.ok(true, "This shouldn't fail");
    }
    exports.Test1 = Test1;
    function Test2() {
        assert.ok(1 === 1, "This shouldn't fail");
        assert.ok(false, "This should fail");
    }
    exports.Test2 = Test2;
});
//# sourceMappingURL=compiled.js.map