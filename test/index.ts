
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
  startTest();

  //开始测试
  async function startTest() {
    try {
        let ret1 = await dbHelper.insert(connection, m, tablename); 
        console.log('新增一条记录', ret1);

        let data = await get(ret1.insertId);
        console.log('查询当前新增的记录', data);

        let m2 = new MyModel(data);
        console.log('转为MyModel', m2.toJSON());

        let ret2 = await execute(m2.id);
        console.log('执行修改', ret2);

        //查询
        //sql查询
        let data1 = await dbHelper.query({
            db: connection,
            sql: `select * from ${tablename} where Fname like ? limit 2`,
            params: ['%name%']
        });
        console.log('sql查询', data1);

        //where 查询
        let data2 = await dbHelper.query({
            db: connection,
            columns: '*',
            table: tablename,
            where: `Fname like ?`,
            params: ['%name%'],
            orders: [['Fcreate_time', 'desc'], ['Fnick_name', 'desc']],
            index: 2, //起始
            limit: 3    //条数
        });
        console.log('where 查询', data2);
    }
    catch(e) {
        console.log(e);
    }

    connection.end();

    console.log('测试结束');

}

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
//执行sql测试, execute/executeSql 
//把指定的id修改新名称
async function execute(id: number) {
    return new Promise(resolve => {
        let sql = `update ${tablename} set Fname=? where Fid=?`;

        dbHelper.execute({
            db: connection,
            sql: sql,
            params: ['new name', id]
        }).then(ret1=>{
            console.log(ret1);
            //测试executeSql
            dbHelper.executeSql(connection, sql, ['new name2', id]).then(ret2 => {
                resolve && resolve(ret2);
            });
        });
    });
    
}

//connection.end();

