
import * as mysql from "mysql";
import BaseModel from "../model/base";
import dbHelper from "../helper/db";

let tablename = 't_user';
let primarykeys = ['id'];

@BaseModel.Table(tablename, primarykeys) //关联表t_user, 且主健为id,  非必须，各接口可以手动传入
class MyModel extends BaseModel {  
    @BaseModel.TableField('Fid') //映射属性跟字段, 非必须。如果不指定，则默认会在前加上F，并把大写字母转为_加小写来映射
    id: number = 0;
    name: string = "";
    nickName: string = "";
    createTime: string = "";
}

console.log(MyModel);

let m = new MyModel();
m.name = "my name";
m.nickName = "my";
console.log(m.toString());

const connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '1234',
    database : 'test',
    charset  : 'utf8'
  });

  connection.connect();

// 新增一条记录
// 如果用装饰器 指定了tablename。则这里的tablename可以不传
dbHelper.insert(connection, m, tablename).then(result=>{
    console.log(result);
    get(result.insertId).then(d=>{
        console.log('查询单条记录');
        //console.log(d);
        connection.end();

        let m = new MyModel(d);
        console.dir(m.toJSON());
    })
}).catch(e=>{
    console.log(e);
});

//查询单条记录
async function get(id: number) {
    let result = await dbHelper.get({
        db: connection,
        table: tablename,
        where: {
            Fid: id
        }
    });
    return result;
}

//connection.end();

