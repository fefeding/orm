
import * as mysql from "mysql";

import { BaseModel, DBHelper } from "../index";

import * as assert from "assert";

let tablename = 't_user';
let primarykeys = ['id'];

@BaseModel.Table(tablename) //关联表t_user, 且主健为id,  非必须，各接口可以手动传入
//@BaseModel.Table(tablename, ['id'])//可以从这里指定多个主健，也可以在属性中去指定
class MyModel extends BaseModel {  
    @BaseModel.TableField('Fid') //映射属性跟字段, 非必须。如果不指定，则默认会在前加上F，并把大写字母转为_加小写来映射
    @BaseModel.TablePrimaryKey() //指定当前属性为唯一健
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
//先准备好测试DB
const connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'jiamao',
    password : '123456',
    database : 'test',
    charset  : 'utf8'
  });

  //实例化DB操作
const db = new DBHelper(connection);

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
    var newmodel: MyModel;
    it('新增一个user', async ()=>{
        let m = new MyModel({
            name: "my name1",
            nickName: 'my'
        });
        console.log('insert', m.toJSON());

        let ret1 = await db.insert(m); 
        assert.ok(ret1.insertId > 0);

        newid = ret1.insertId;        
    });

    it('查询单个user', async ()=>{
        
        let result = await db.get({
            db: connection,
            table: tablename,
            where: {
                Fid: newid
            }
        });
        
        newmodel = new MyModel(result);
        //console.log('转为MyModel', m2.toJSON());

        assert.ok(!!result);
        assert.equal(newmodel.id, newid, newmodel.toString());
    });

    it('执行修改 execute', async ()=>{
        //sql修改方式
        let sql = `update ${tablename} set Fname=? where Fid=?`;
        let ret1 = await db.execute({
            db: connection,
            sql: sql,
            params: ['new name', newid]
        });
        assert.equal(ret1.affectedRows, 1, 'execute');
        //测试executeSql
        let ret2 = await db.executeSql(sql, ['new name2', newid]);
        assert.equal(ret2.affectedRows, 1, 'executeSql');
    });

    it('执行修改 executeSql', async ()=>{

        let sql = `update ${tablename} set Fname=? where Fid=?`;       
        //测试executeSql
        let ret2 = await db.executeSql(sql, ['new name2', newid]);
        assert.equal(ret2.affectedRows, 1, 'executeSql');
    });

    it('执行修改 update', async ()=>{
        let m = new MyModel();
        m.id = newid;
        m.nickName = "update name";   
        let ret = await db.update(m);
        assert.equal(ret.affectedRows, 1, 'executeSql');
    });

    it('sql查询[query]', async ()=>{
        //sql带参数的直接执行方式
        let data = await db.query({
            sql: `select * from ${tablename} where Fname like ? limit 2`,
            params: ['%name%']
        }, MyModel);
        //console.log(JSON.stringify(data));
        assert.ok(data.data.length > 0, 'sql查询');
    });

    it('where为字符串，并设定起始条数的 查询', async ()=>{
        //where 查询
        let data = await db.query({
            columns: '*',
            table: tablename,
            where: `Fname like ?`,
            params: ['%name%'],
            orders: [['Fcreate_time', 'desc'], ['Fnick_name', 'desc']],
            offset: 2, //起始
            limit: 3    //条数
        }, MyModel);
        assert.ok(data.data.length > 0);
    });

    it('where为object，并设定起始条数的 查询', async ()=>{
        //where 查询
        let data = await db.query({
            columns: '*',
            table: tablename,
            where: {
                Fid: newid
            },
            orders: [['Fcreate_time', 'desc'], ['Fnick_name', 'desc']],
            offset: 0, //起始
            limit: 3    //条数
        }, MyModel);
        assert.ok(data.data.length > 0);
    });

    it('查询符合条件的数，count', async ()=>{
        //where 查询
        let data = await db.count({
            columns: '*',
            table: tablename,
            where: {
                Fid: newid
            },
            orders: [['Fcreate_time', 'desc'], ['Fnick_name', 'desc']],
            offset: 0, //起始
            limit: 3    //条数
        }, MyModel);
        assert.ok(data > 0);
    });

    it('分页查询，queryPage', async ()=>{
        //where 查询
        let data = await db.queryPage({
            columns: '*',
            table: tablename,
            where: `Fname like ?`,
            params: ['%m%'],
            orders: [['Fcreate_time', 'desc'], ['Fnick_name', 'desc']],
            page: 2, //页码
            size: 3    //每页条数
        }, MyModel);
        console.log(data);
        assert.ok(data.total > 0 && data.count > 0);
    });

    it('删除', async ()=>{        
        let ret = await db.delete(newmodel);
        console.log(ret);
        assert.equal(ret.affectedRows, 1, 'delete');
    });
});
