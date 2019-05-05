"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const mysql = require("mysql");
const base_1 = require("../model/base");
const db_1 = require("../helper/db");
let tablename = 't_user';
let primarykeys = ['id'];
let MyModel = class MyModel extends base_1.default {
    constructor() {
        super(...arguments);
        this.id = 0;
        this.name = "";
        this.nickName = "";
        this.createTime = "";
    }
};
tslib_1.__decorate([
    base_1.default.TableField('Fid') //映射属性跟字段, 非必须。如果不指定，则默认会在前加上F，并把大写字母转为_加小写来映射
    ,
    tslib_1.__metadata("design:type", Number)
], MyModel.prototype, "id", void 0);
MyModel = tslib_1.__decorate([
    base_1.default.Table(tablename, primarykeys) //关联表t_user, 且主健为id,  非必须，各接口可以手动传入
], MyModel);
console.log(MyModel);
let m = new MyModel();
m.name = "my name";
m.nickName = "my";
console.log(m.toString());
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'test',
    charset: 'utf8'
});
connection.connect();
// 新增一条记录
// 如果用装饰器 指定了tablename。则这里的tablename可以不传
db_1.default.insert(connection, m, tablename).then(result => {
    console.log(result);
    get(result.insertId).then(d => {
        console.log('查询单条记录');
        //console.log(d);
        connection.end();
        let m = new MyModel(d);
        console.dir(m.toJSON());
    });
}).catch(e => {
    console.log(e);
});
//查询单条记录
async function get(id) {
    let result = await db_1.default.get({
        db: connection,
        table: m._tableName,
        where: {
            Fid: id
        }
    });
    return result;
}
//connection.end();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSwrQkFBK0I7QUFDL0Isd0NBQXNDO0FBQ3RDLHFDQUFvQztBQUVwQyxJQUFJLFNBQVMsR0FBRyxRQUFRLENBQUM7QUFDekIsSUFBSSxXQUFXLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUd6QixJQUFNLE9BQU8sR0FBYixNQUFNLE9BQVEsU0FBUSxjQUFTO0lBRC9COztRQUdJLE9BQUUsR0FBVyxDQUFDLENBQUM7UUFDZixTQUFJLEdBQVcsRUFBRSxDQUFDO1FBQ2xCLGFBQVEsR0FBVyxFQUFFLENBQUM7UUFDdEIsZUFBVSxHQUFXLEVBQUUsQ0FBQztJQUM1QixDQUFDO0NBQUEsQ0FBQTtBQUpHO0lBREMsY0FBUyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyw4Q0FBOEM7OzttQ0FDNUQ7QUFGYixPQUFPO0lBRFosY0FBUyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUMsbUNBQW1DO0dBQ3RFLE9BQU8sQ0FNWjtBQUVELE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7QUFFckIsSUFBSSxDQUFDLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztBQUN0QixDQUFDLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQztBQUNuQixDQUFDLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztBQUNsQixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO0FBRTFCLE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQztJQUN0QyxJQUFJLEVBQU8sV0FBVztJQUN0QixJQUFJLEVBQU8sTUFBTTtJQUNqQixRQUFRLEVBQUcsTUFBTTtJQUNqQixRQUFRLEVBQUcsTUFBTTtJQUNqQixPQUFPLEVBQUksTUFBTTtDQUNsQixDQUFDLENBQUM7QUFFSCxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7QUFFdkIsU0FBUztBQUNULHdDQUF3QztBQUN4QyxZQUFRLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQSxFQUFFO0lBQ25ELE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDcEIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBLEVBQUU7UUFDekIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN0QixpQkFBaUI7UUFDakIsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBRWpCLElBQUksQ0FBQyxHQUFHLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3ZCLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7SUFDNUIsQ0FBQyxDQUFDLENBQUE7QUFDTixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFBLEVBQUU7SUFDUixPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25CLENBQUMsQ0FBQyxDQUFDO0FBRUgsUUFBUTtBQUNSLEtBQUssVUFBVSxHQUFHLENBQUMsRUFBVTtJQUN6QixJQUFJLE1BQU0sR0FBRyxNQUFNLFlBQVEsQ0FBQyxHQUFHLENBQUM7UUFDNUIsRUFBRSxFQUFFLFVBQVU7UUFDZCxLQUFLLEVBQUUsQ0FBQyxDQUFDLFVBQVU7UUFDbkIsS0FBSyxFQUFFO1lBQ0gsR0FBRyxFQUFFLEVBQUU7U0FDVjtLQUNKLENBQUMsQ0FBQztJQUNILE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUM7QUFFRCxtQkFBbUIifQ==