
import BaseModel from "../model/base";

class MyModel extends BaseModel {    
    id: string = "";
}

let m = new MyModel();
m.id = "my id";
console.log(JSON.stringify(m));