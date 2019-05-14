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
        let m = new MyModel({
            name: "my name1",
            nickName: 'my'
        });
        console.log('insert', m.toJSON());
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
    it('查询符合条件的数，count', async () => {
        //where 查询
        let data = await db.count({
            columns: '*',
            table: tablename,
            where: {
                Fid: newid
            },
            orders: [['Fcreate_time', 'desc'], ['Fnick_name', 'desc']],
            offset: 0,
            limit: 3 //条数
        }, MyModel);
        assert.ok(data > 0);
    });
    it('分页查询，queryPage', async () => {
        //where 查询
        let data = await db.queryPage({
            columns: '*',
            table: tablename,
            where: `Fname like ?`,
            params: ['%m%'],
            orders: [['Fcreate_time', 'desc'], ['Fnick_name', 'desc']],
            page: 2,
            size: 3 //每页条数
        }, MyModel);
        console.log(data);
        assert.ok(data.total > 0 && data.count > 0);
    });
    it('删除', async () => {
        let ret = await db.delete(newmodel);
        console.log(ret);
        assert.equal(ret.affectedRows, 1, 'delete');
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSwrQkFBK0I7QUFFL0Isb0NBQStDO0FBRS9DLGlDQUFpQztBQUVqQyxJQUFJLFNBQVMsR0FBRyxRQUFRLENBQUM7QUFDekIsSUFBSSxXQUFXLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUl6QixJQUFNLE9BQU87QUFEYiw2REFBNkQ7QUFDN0QsTUFBTSxPQUFRLFNBQVEsaUJBQVM7SUFGL0I7O1FBS0ksT0FBRSxHQUFXLENBQUMsQ0FBQztRQUNmLFNBQUksR0FBVyxFQUFFLENBQUM7UUFDbEIsYUFBUSxHQUFXLEVBQUUsQ0FBQztRQUN0QixlQUFVLEdBQVcsRUFBRSxDQUFDO0lBQzVCLENBQUM7Q0FBQSxDQUFBO0FBSkc7SUFGQyxpQkFBUyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyw4Q0FBOEM7O0lBQzFFLGlCQUFTLENBQUMsZUFBZSxFQUFFLENBQUMsWUFBWTs7O21DQUMxQjtBQUhiLE9BQU87SUFGWixpQkFBUyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxtQ0FBbUM7SUFDL0QsNkRBQTZEO0dBQ3ZELE9BQU8sQ0FPWjtBQUdELElBQU0sUUFBUSxHQUFkLE1BQU0sUUFBUyxTQUFRLGlCQUFTO0lBRGhDOztRQUdJLE9BQUUsR0FBVyxDQUFDLENBQUM7UUFDZixTQUFJLEdBQVcsRUFBRSxDQUFDO1FBQ2xCLGFBQVEsR0FBVyxFQUFFLENBQUM7UUFDdEIsZUFBVSxHQUFXLEVBQUUsQ0FBQztJQUM1QixDQUFDO0NBQUEsQ0FBQTtBQUpHO0lBREMsaUJBQVMsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsOENBQThDOzs7b0NBQzdEO0FBRmIsUUFBUTtJQURiLGlCQUFTLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQyxtQ0FBbUM7R0FDdEUsUUFBUSxDQU1iO0FBQ0Qs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