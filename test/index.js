"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_1 = require("../model/base");
class MyModel extends base_1.default {
    constructor() {
        super(...arguments);
        this.id = "";
    }
}
let m = new MyModel();
m.id = "my id";
console.log(JSON.stringify(m));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHdDQUFzQztBQUV0QyxNQUFNLE9BQVEsU0FBUSxjQUFTO0lBQS9COztRQUNJLE9BQUUsR0FBVyxFQUFFLENBQUM7SUFDcEIsQ0FBQztDQUFBO0FBRUQsSUFBSSxDQUFDLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztBQUN0QixDQUFDLENBQUMsRUFBRSxHQUFHLE9BQU8sQ0FBQztBQUNmLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDIn0=