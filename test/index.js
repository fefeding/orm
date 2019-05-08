"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const mysql = require("mysql");
const index_1 = require("../index");
const assert = require("assert");
let tablename = 't_user';
let primarykeys = ['id'];
let MyModel = 
//@BaseModel.Table(tablename, ['id'])//可以从这里指定多个主健，也可以在属性中去指定
class MyModel extends index_1.BaseModel {
    constructor() {
        super(...arguments);
        this.id = 0;
        this.name = "";
        this.nickName = "";
        this.createTime = "";
    }
};
tslib_1.__decorate([
    index_1.BaseModel.TableField('Fid') //映射属性跟字段, 非必须。如果不指定，则默认会在前加上F，并把大写字母转为_加小写来映射
    ,
    index_1.BaseModel.TablePrimaryKey() //指定当前属性为唯一健
    ,
    tslib_1.__metadata("design:type", Number)
], MyModel.prototype, "id", void 0);
MyModel = tslib_1.__decorate([
    index_1.BaseModel.Table(tablename) //关联表t_user, 且主健为id,  非必须，各接口可以手动传入
    //@BaseModel.Table(tablename, ['id'])//可以从这里指定多个主健，也可以在属性中去指定
], MyModel);
let MyModel2 = class MyModel2 extends index_1.BaseModel {
    constructor() {
        super(...arguments);
        this.id = 0;
        this.name = "";
        this.nickName = "";
        this.createTime = "";
    }
};
tslib_1.__decorate([
    index_1.BaseModel.TableField('Fid2') //映射属性跟字段, 非必须。如果不指定，则默认会在前加上F，并把大写字母转为_加小写来映射
    ,
    tslib_1.__metadata("design:type", Number)
], MyModel2.prototype, "id", void 0);
MyModel2 = tslib_1.__decorate([
    index_1.BaseModel.Table('t_user2', primarykeys) //关联表t_user, 且主健为id,  非必须，各接口可以手动传入
], MyModel2);
console.log(MyModel.prototype);
console.log(MyModel2.prototype);
let user = new MyModel2();
console.log(Object.getPrototypeOf(user));
//本地测试数据库
//先准备好测试DB
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'jiamao',
    password: '123456',
    database: 'test',
    charset: 'utf8'
});
//实例化DB操作
const db = new index_1.DBHelper(connection);
describe('测试DBHelper', () => {
    before(() => {
        connection.connect();
        // 在执行所有的测试用例前 函数会被调用一次
    });
    after(function () {
        // 在执行完所有的测试用例后 函数会被调用一次        
        connection.end();
        console.log('测试结束');
    });
    beforeEach(function () {
        // 在执行每个测试用例前 函数会被调用一次
    });
    afterEach(function () {
        // 在执行每个测试用例后 函数会被调用一次
    });
    var newid = 0;
    var newmodel;
    it('新增一个user', async () => {
        let m = new MyModel();
        m.name = "my name";
        m.nickName = "my";
        console.log(m.toString());
        let ret1 = await db.insert(m);
        assert.ok(ret1.insertId > 0);
        newid = ret1.insertId;
    });
    it('查询单个user', async () => {
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
    it('执行修改 execute', async () => {
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
    it('执行修改 executeSql', async () => {
        let sql = `update ${tablename} set Fname=? where Fid=?`;
        //测试executeSql
        let ret2 = await db.executeSql(sql, ['new name2', newid]);
        assert.equal(ret2.affectedRows, 1, 'executeSql');
    });
    it('执行修改 update', async () => {
        let m = new MyModel();
        m.id = newid;
        m.nickName = "update name";
        let ret = await db.update(m);
        assert.equal(ret.affectedRows, 1, 'executeSql');
    });
    it('sql查询[query]', async () => {
        //sql带参数的直接执行方式
        let data = await db.query({
            sql: `select * from ${tablename} where Fname like ? limit 2`,
            params: ['%name%']
        }, MyModel);
        //console.log(JSON.stringify(data));
        assert.ok(data.data.length > 0, 'sql查询');
    });
    it('where为字符串，并设定起始条数的 查询', async () => {
        //where 查询
        let data = await db.query({
            columns: '*',
            table: tablename,
            where: `Fname like ?`,
            params: ['%name%'],
            orders: [['Fcreate_time', 'desc'], ['Fnick_name', 'desc']],
            offset: 2,
            limit: 3 //条数
        }, MyModel);
        assert.ok(data.data.length > 0);
    });
    it('where为object，并设定起始条数的 查询', async () => {
        //where 查询
        let data = await db.query({
            columns: '*',
            table: tablename,
            where: {
                Fid: newid
            },
            orders: [['Fcreate_time', 'desc'], ['Fnick_name', 'desc']],
            offset: 0,
            limit: 3 //条数
        }, MyModel);
        assert.ok(data.data.length > 0);
    });
    it('删除', async () => {
        let ret = await db.delete(newmodel);
        console.log(ret);
        assert.equal(ret.affectedRows, 1, 'delete');
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSwrQkFBK0I7QUFFL0Isb0NBQStDO0FBRS9DLGlDQUFpQztBQUVqQyxJQUFJLFNBQVMsR0FBRyxRQUFRLENBQUM7QUFDekIsSUFBSSxXQUFXLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUl6QixJQUFNLE9BQU87QUFEYiw2REFBNkQ7QUFDN0QsTUFBTSxPQUFRLFNBQVEsaUJBQVM7SUFGL0I7O1FBS0ksT0FBRSxHQUFXLENBQUMsQ0FBQztRQUNmLFNBQUksR0FBVyxFQUFFLENBQUM7UUFDbEIsYUFBUSxHQUFXLEVBQUUsQ0FBQztRQUN0QixlQUFVLEdBQVcsRUFBRSxDQUFDO0lBQzVCLENBQUM7Q0FBQSxDQUFBO0FBSkc7SUFGQyxpQkFBUyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyw4Q0FBOEM7O0lBQzFFLGlCQUFTLENBQUMsZUFBZSxFQUFFLENBQUMsWUFBWTs7O21DQUMxQjtBQUhiLE9BQU87SUFGWixpQkFBUyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxtQ0FBbUM7SUFDL0QsNkRBQTZEO0dBQ3ZELE9BQU8sQ0FPWjtBQUdELElBQU0sUUFBUSxHQUFkLE1BQU0sUUFBUyxTQUFRLGlCQUFTO0lBRGhDOztRQUdJLE9BQUUsR0FBVyxDQUFDLENBQUM7UUFDZixTQUFJLEdBQVcsRUFBRSxDQUFDO1FBQ2xCLGFBQVEsR0FBVyxFQUFFLENBQUM7UUFDdEIsZUFBVSxHQUFXLEVBQUUsQ0FBQztJQUM1QixDQUFDO0NBQUEsQ0FBQTtBQUpHO0lBREMsaUJBQVMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsOENBQThDOzs7b0NBQzdEO0FBRmIsUUFBUTtJQURiLGlCQUFTLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQyxtQ0FBbUM7R0FDdEUsUUFBUSxDQU1iO0FBQ0Qs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