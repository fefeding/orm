"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var base_1 = require("../model/base");
var MyModel = /** @class */ (function (_super) {
    __extends(MyModel, _super);
    function MyModel() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.id = "";
        return _this;
    }
    return MyModel;
}(base_1["default"]));
var m = new MyModel();
m.id = "my id";
console.log(JSON.stringify(m));