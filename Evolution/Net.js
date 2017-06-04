(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
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
//# sourceMappingURL=Net.js.map