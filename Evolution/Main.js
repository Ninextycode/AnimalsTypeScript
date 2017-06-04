(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Entities"], factory);
    }
})(function (require, exports) {
    "use strict";
    var Entities_1 = require("./Entities");
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
//# sourceMappingURL=Main.js.map