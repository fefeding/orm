"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 提供DB操作基础库
 * 支持分页等功能
 */
class DBHelper {
    /**
     * 使用query，可用来查询或SQL执行
     * @param {IDBQueryParam} pars 执行参数，
     * 1. 如果有sql属性，则只有sql和params有效。params为sql中的?参数, 例如  `{"sql": "select * from table where id=? and title like ?", params: [1, '%abc%']}`
     * 2. 如果有where且为string， 则会拼接sql执行 where 会拼到sql的where关健词后面。如：`{table: 'table1', where: 'id=? or title=?', columns: 'id,title',orders: [['time', 'desc']]}`
     *      结果会拼成: `select id, title from table1 where id=? or title=? order by time desc`
     * 3. 如果where为object， 则会直接调用db的select
     * @returns {IDBResult}
     */
    static async query(pars) {
        let result = {
            data: {}
        };
        pars.columns = pars.columns || '*';
        if (pars.sql) {
            result.data = await pars.db.query(pars.sql, pars.params);
        }
        //where为字符串的情况，则拼sql来执行
        else if (pars.where && typeof pars.where == 'string') {
            result.data = this.queryStringWhere(pars);
        }
        //where为ob ject情况，直接select
        else if (pars.where && typeof pars.where == 'object') {
            result.data = this.select(pars);
        }
        return result;
    }
    /**
     * 执行SQL
     * @param pars SQL和执行参数。如：{sql: 'update table set title=? where id=?', params: ['title1', 1]}
     * @returns {IDBExecuteResult} 受影响的行数
     */
    static async execute(pars) {
        let ret = await pars.db.query(pars.sql, pars.params);
        return ret;
    }
    /**
     * 执行有where并且为字符串的情况
     * @param pars
     */
    static async queryStringWhere(pars) {
        let sql = `select ${pars.columns} from ${pars.table} where ${pars.where}`;
        //拼接排序字段
        if (pars.orders && pars.orders.length) {
            let ordersql = '';
            pars.orders.forEach((p) => {
                if (ordersql)
                    ordersql += ',';
                ordersql += p.join(' ');
            });
            sql += ' order by ' + ordersql;
        }
        return await pars.db.query(sql, pars.params);
    }
    /**
     * 获取单个数据
     * @param pars 获取单条数据接口，{table:'table1', where: {id:1}}
     */
    static async get(pars) {
        if (pars.db.get) {
            return await pars.db.get(pars.table, pars.where);
        }
        else {
            let columns = pars.columns || '*';
            let sql = `SELECT ${columns} FROM ${pars.table} WHERE 1=1`;
            let params = new Array();
            let ps = Object.getOwnPropertyNames(pars.where);
            let obj = pars.where;
            for (let c of ps.values()) {
                sql += ` and \`${c}\`=?`;
                params.push(obj[c.toString()]);
            }
            return new Promise((resolve, reject) => {
                this.executeSql(pars.db, sql, params).then(result => {
                    resolve && resolve(result[0]);
                }).catch(e => reject && reject(e));
            });
        }
    }
    /**
     * 当where为object时，采用select直接查
     * @param pars select参数，where为object情况
     */
    static async select(pars) {
        let condition = {
            where: pars.where,
            orders: pars.orders || [],
            columns: pars.columns || '*'
        };
        return await pars.db.select(pars.table, condition);
    }
    /**
     * 新增
     * @param pars
     */
    static async insertOperation(pars) {
        return pars.db.insert(pars.table, pars.data);
    }
    /**
     * 更新数据
     * 指定table 和 where 即可。如：{table: 'table1', where: {id:1}}
     * @param pars
     */
    static async update(pars) {
        return pars.db.update(pars.table, pars.data, pars.where);
    }
    /**
     * 删除数据
     * 指定table 和 where 即可。如：{table: 'table1', where: {id:1}}
     * @param pars
     */
    static async delete(pars) {
        return pars.db.delete(pars.table, pars.where);
    }
    /**
     * 往DB里插入一个model对象
     * @param db {MySql.Connection} DB连接
     * @param table {string} 表名
     * @param data {BaseModel} 新增的数据model
     * @returns {fieldCount: 0,affectedRows: 1,insertId: 6,serverStatus: 2,warningCount: 0,message: '',protocol41: true,changedRows: 0 }
     */
    static async insert(db, data, table = "") {
        //如果是IDBOperationParam，则调用eggjs相关接口
        if (db && db.db) {
            return this.insertOperation(db);
        }
        table = table || data._tableName;
        let sql = `INSERT INTO ${table} SET ?`;
        return this.executeSql(db, sql, data._dbData);
    }
    /**
     *
     * @param db DB连接
     * @param sql 要执行的SQL 例如sql="select * from id=?"
     * @param params SQL中的参数，例如[1]
     */
    static async executeSql(db, sql, params = []) {
        return new Promise((resolve, reject) => {
            let qry = db.query(sql, params, (err, results) => {
                if (err) {
                    if (reject)
                        reject(err);
                    else
                        throw err;
                }
                else {
                    resolve && resolve(results);
                }
            });
            qry && qry.sql && console.log(qry.sql);
        });
    }
}
exports.default = DBHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkYi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUdBOzs7R0FHRztBQUNILE1BQU0sUUFBUTtJQUNWOzs7Ozs7OztPQVFHO0lBQ0gsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBbUI7UUFDbEMsSUFBSSxNQUFNLEdBQUc7WUFDVCxJQUFJLEVBQUUsRUFBRTtTQUNYLENBQUM7UUFDRixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLElBQUksR0FBRyxDQUFDO1FBQ25DLElBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUNULE1BQU0sQ0FBQyxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUM1RDtRQUNELHVCQUF1QjthQUNsQixJQUFHLElBQUksQ0FBQyxLQUFLLElBQUksT0FBTyxJQUFJLENBQUMsS0FBSyxJQUFJLFFBQVEsRUFBRTtZQUNqRCxNQUFNLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUM3QztRQUNELDBCQUEwQjthQUNyQixJQUFHLElBQUksQ0FBQyxLQUFLLElBQUksT0FBTyxJQUFJLENBQUMsS0FBSyxJQUFJLFFBQVEsRUFBRTtZQUNqRCxNQUFNLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDbkM7UUFDRCxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQWlCO1FBQ2xDLElBQUksR0FBRyxHQUFHLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7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