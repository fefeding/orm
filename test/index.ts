
import * as mysql from "mysql";

import { BaseModel, DBHelper } from "../index";

import * as assert from "assert";

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

@BaseModel.Table('t_user2', primarykeys) //关联表t_user, 且主健为id,  非必须，各接口可以手动传入
class MyModel2 extends BaseModel {  
    @BaseModel.TableField('Fid2') //映射属性跟字段, 非必须。如果不指定，则默认会在前加上F，并把大写字母转为_加小写来映射
    id: number = 0;
    name: string = "";
    nickName: string = "";
    createTime: string = "";
}
console.log(MyModel.prototype);
console.log(MyModel2.prototype);

let user = new MyModel2();
console.log(Object.getPrototypeOf(user));

//本地测试数据库
const connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '1234',
    database : 'test',
    charset  : 'utf8'
  });


describe('测试DBHelper', ()=>{
    before(()=>{
        connection.connect();
        // 在执行所有的测试用例前 函数会被调用一次
    });

    after(function() {
        // 在执行完所有的测试用例后 函数会被调用一次        
        connection.end();
        console.log('测试结束');
    });
    
    beforeEach(function() {
        // 在执行每个测试用例前 函数会被调用一次
    });
    
    afterEach(function() {
        // 在执行每个测试用例后 函数会被调用一次
    });

    var newid = 0;
    it('新增一个user', async ()=>{
        let m = new MyModel();
        m.name = "my name";
        m.nickName = "my";
        console.log(m.toString());

        let ret1 = await DBHelper.insert(connection, m, tablename); 
        assert.ok(ret1.insertId > 0);

        newid = ret1.insertId;        
    });

    it('查询单个user', async ()=>{
        let result = await DBHelper.get({
            db: connection,
            table: tablename,
            where: {
                Fid: newid
            }
        });

        let m2 = new MyModel(result);
        //console.log('转为MyModel', m2.toJSON());

        assert.ok(!!result);
        assert.equal(m2.id, newid, m2.toString());
    });

    it('执行修改 execute', async ()=>{

        let sql = `update ${tablename} set Fname=? where Fid=?`;
        let ret1 = await DBHelper.execute({
            db: connection,
            sql: sql,
            params: ['new name', newid]
        });
        assert.equal(ret1.affectedRows, 1, 'execute');
        //测试executeSql
        let ret2 = await DBHelper.executeSql(connection, sql, ['new name2', newid]);
        assert.equal(ret2.affectedRows, 1, 'executeSql');
    });

    it('执行修改 executeSql', async ()=>{

        let sql = `update ${tablename} set Fname=? where Fid=?`;       
        //测试executeSql
        let ret2 = await DBHelper.executeSql(connection, sql, ['new name2', newid]);
        assert.equal(ret2.affectedRows, 1, 'executeSql');
    });

    it('sql查询', async ()=>{
        let data = await DBHelper.query({
            db: connection,
            sql: `select * from ${tablename} where Fname like ? limit 2`,
            params: ['%name%']
        }, MyModel);
        //console.log(JSON.stringify(data));
        assert.ok(data.data.length > 0);
    });

    it('单独where条件，并设定起始条数的 查询', async ()=>{
        //where 查询
        let data = await DBHelper.query({
            db: connection,
            columns: '*',
            table: tablename,
            where: `Fname like ?`,
            params: ['%name%'],
            orders: [['Fcreate_time', 'desc'], ['Fnick_name', 'desc']],
            index: 2, //起始
            limit: 3    //条数
        }, MyModel);
        assert.ok(data.data.length > 0);
    });
});
