/// <reference path="../typings/index.d.ts" />
import BaseModel from "../model/base";
import modelHelper from "./modelHelper";

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
     * @param {BaseModel} [optional] 可选参数，如果指定了具体的model类，则会实例化成model的数组对象返回
     * @returns {IDBResult}
     */
    static async query(pars: IDBQueryParam, type: { new(): BaseModel}|any = undefined): Promise<IDBResult> {
        let result = {
            data: new Array<any>()
        };
        pars.columns = pars.columns || '*';
        if(pars.sql) {
            result.data = await this.execute(pars);
        }
        //where为字符串的情况，则拼sql来执行
        else if(pars.where && typeof pars.where == 'string') {            
            result.data = await this.queryStringWhere(pars);
        }
        //where为object情况，直接select
        else if(pars.where && typeof pars.where == 'object') {
            result.data = await this.select(pars);
        }

        //如果指定了需要的类型，则先转换
        if(result.data && result.data.length && type) {
            result.data = modelHelper.toArray(result.data, type);
        }
        return result;
    }

    /**
     * 执行SQL
     * @param pars SQL和执行参数。如：{sql: 'update table set title=? where id=?', params: ['title1', 1]}
     * @returns {any} 受影响的行数
     */
    static async execute(pars: IDBSqlParam): Promise<any> {
        return this.executeSql(pars.db, pars.sql || '', pars.params);
    }

    /**
     * 执行有where并且为字符串的情况
     * @param pars 
     */
    static async queryStringWhere(pars: IDBQueryParam): Promise<any> {
        let sql = `select ${pars.columns} from ${pars.table} where ${pars.where}`;
        //拼接排序字段
        if(pars.orders && pars.orders.length) {
            let ordersql = '';
            pars.orders.forEach((p)=> {
                if(ordersql) ordersql += ',';
                ordersql += p.join(' ');
            });
            sql += ' order by ' + ordersql;
        }
        //如果有条数限制
        if(pars.limit) {
            if(pars.index) {
                sql += ` limit ${pars.index},${pars.limit}`;
            }
            else {
                sql += ` limit ${pars.limit}`;
            }
        }
        return this.executeSql(pars.db, sql, pars.params);
    }

    /**
     * 获取单个数据
     * @param pars 获取单条数据接口，{table:'table1', where: {id:1}}
     */
    static async get(pars: IDBQueryParam, type: { new(): BaseModel}|any = undefined): Promise<any> {
        if(pars.db.get) {
            return await pars.db.get(pars.table, pars.where);
        }
        else {
            let columns = pars.columns || '*';
            let sql = `SELECT ${columns} FROM ${pars.table} WHERE 1=1`;
            let params = new Array<any>();
            let ps = Object.getOwnPropertyNames(pars.where);
            let obj = pars.where as Map<string, any>;
            
            for(let c of ps.values()) {
                sql += ` and \`${c}\`=?`;
                params.push(obj[c.toString()]);
            }
            return new Promise((resolve, reject) => {            
                this.executeSql(pars.db, sql, params).then(result=>{
                    resolve && resolve(result[0]);
                }).catch(e=>reject && reject(e));
            });
        }
    }

    /**
     * 当where为object时，采用select直接查
     * 不支持limit查询
     * @param pars select参数，where为object情况
     */
    static async select(pars: IDBQueryParam): Promise<any> {
        //如果是eggjs这种提供了select的，则直接调用,否则调用mysql原接口
        if(pars.db.select) {
            let condition = {
                where: pars.where,
                orders: pars.orders || [],
                columns: pars.columns || '*'
            };
            return await pars.db.select(pars.table, condition);
        }
        else {
            let strWhere = '1=1';
            let params = new Array<any>();
            if(pars.where) {
                let ps = Object.getOwnPropertyNames(pars.where);
                let obj = pars.where as Map<string, any>;
                
                for(let c of ps.values()) {
                    strWhere += ` and \`${c}\`=?`;
                    params.push(obj[c.toString()]);
                }
            }
            return await this.queryStringWhere({
                db: pars.db,
                where: strWhere,
                orders: pars.orders || [],
                columns: pars.columns || '*'
            });
        }
    }

    /**
     * 更新数据
     * 指定table 和 where 即可。如：{table: 'table1', where: {id:1}}
     * @param pars 
     */
    static async update(pars: IDBOperationParam): Promise<number> {
        return pars.db.update(pars.table, pars.data, pars.where);
    }

    /**
     * 删除数据
     * 指定table 和 where 即可。如：{table: 'table1', where: {id:1}}
     * @param pars 
     */
    static async delete(pars: IDBOperationParam): Promise<number> {
        return pars.db.delete(pars.table, pars.where);
    }

    /**
     * 往DB里插入一个model对象
     * @param db {MySql.Connection} DB连接
     * @param table {string} 表名
     * @param data {BaseModel} 新增的数据model
     * @returns {fieldCount: 0,affectedRows: 1,insertId: 6,serverStatus: 2,warningCount: 0,message: '',protocol41: true,changedRows: 0 }
     */
    static async insert(db: any|IDBOperationParam, data: BaseModel, table: string = ""): Promise<any> {   
        //如果是IDBOperationParam，则调用eggjs相关接口
        if(db && db.db) {
            return db.db.insert(db.table, db.data);
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
    static async executeSql(db: any, sql: string, params: any=[]): Promise<any> {
        return new Promise((resolve, reject) => {
            
            let qry = db.query(sql, params, (err, results)=>{                
                if(err) {
                    if(reject) reject(err);
                    else throw err;
                }
                else {
                    resolve && resolve(results);
                }
            });
            qry && qry.sql && console.log(qry.sql);
        });
    }
}

export default DBHelper;