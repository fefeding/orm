/// <reference path="../typings/index.d.ts" />
import BaseModel from "../model/base";
import modelHelper from "./modelHelper";

/**
 * 提供DB操作基础库
 * 支持分页等功能
 */
class DBHelper {
    /**
     * 生成DB实例
     * @param db DB操作对象，mysql的connection或 eggjs的
     */
    constructor(db: any = null) {
        this.db = db;
    }

    /**
     * DB操作对象，
     * 可以是原生的mysql连接，或eggjs的
     */
    public db: any;

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
    async query(pars: IDBQueryParam, type?: { new(): BaseModel}|any): Promise<IDBResult> {
        let result = {
            data: new Array<any>()
        };
        pars.columns = pars.columns || '*';
        
        pars.db = pars.db || this.db;
        if(type && !pars.table) pars.table = type._tableName;
        if(pars.sql) {
            result.data = await this.execute(pars);
        }
        //where为字符串的情况，则拼sql来执行
        else if(pars.where && typeof pars.where == 'string') {            
            result.data = await this.queryStringWhere(pars);
        }
        //where为object情况，直接select
        else if(pars.where && typeof pars.where == 'object') {
            result.data = await this.select(pars, type);
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
    async execute(pars: IDBSqlParam): Promise<any> {
        return this.executeSql(pars.sql || '', pars.params, pars.db || this.db);
    }

    /**
     * 执行有where并且为字符串的情况
     * 此函数不支持属性名到字段的映射，调用前自已处理
     * @param pars 
     */
    async queryStringWhere(pars: IDBQueryParam): Promise<any> {
        //如果是数组，则做一次字段映射，并转为字符串
        let columns = pars.columns || '*';
        let sql = `select ${columns} from ${pars.table}`;
        if(pars.where) sql += ` where ${pars.where}`;
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
            if(pars.offset) {
                sql += ` limit ${pars.offset},${pars.limit}`;
            }
            else {
                sql += ` limit ${pars.limit}`;
            }
        }
        return this.executeSql(sql, pars.params, pars.db||this.db);
    }

    /**
     * 获取单个数据
     * @param pars 获取单条数据接口，{table:'table1', where: {id:1}}
     */
    async get(pars: IDBQueryParam, type?: { new(): BaseModel}|any): Promise<any> {
        if(type && !pars.table) pars.table = type._tableName;
        pars.db = pars.db || this.db;
        if(pars.db.get) {
            //如果有传类型，则会做一次属性到字段的映射
            let where = type? modelHelper.objectToFieldValues(pars.where, type): pars.where;
            let data = await pars.db.get(pars.table, where);
            if(type) data = new type(data);
            return data;
        }
        else {
            //如果是数组，则做一次字段映射，并转为字符串
            let columns = pars.columns || '*';
            if(Array.isArray(columns)) {
                columns = modelHelper.convertFields(columns, type).join(',');
            }
            let sql = `SELECT ${columns} FROM ${pars.table}`;
            let where = modelHelper.createSqlWhere(pars.where);
            if(where.where) {
                sql += ' WHERE ' + where.where;
            }                    
            let data = await this.executeSql(sql, where.params, pars.db);
            if(data && data.length) {
                data = type? new type(data[0]): data[0];
            }
            return data;
        }
    }

    /**
     * 当where为object时，采用select直接查
     * @param pars select参数，where为object情况
     */
    async select(pars: IDBQueryParam, type: {new():BaseModel, _fieldMap: object;}|BaseModel): Promise<any> {
        pars.db = pars.db || this.db;
        //如果是数组，则做一次字段映射，并转为字符串
        let columns = pars.columns || '*';
        if(Array.isArray(columns)) {
            columns = modelHelper.convertFields(columns, type).join(',');
        }
        //如果是eggjs这种提供了select的，则直接调用,否则调用mysql原接口
        if(pars.db.select) {
            let condition = {
                where: pars.where,
                orders: pars.orders || [],
                columns: columns,
                limit: pars.limit,
                offset: pars.offset
            };
            return await pars.db.select(pars.table, condition);
        }
        else {
            let where = modelHelper.createSqlWhere(pars.where);
            
            return await this.queryStringWhere({
                db: pars.db,
                table: pars.table,
                where: where.where,
                params: where.params,
                orders: pars.orders || [],
                columns: columns,
                limit: pars.limit,
                offset: pars.offset
            });
        }
    }

    /**
     * 更新数据
     * 指定table 和 where 即可。如：{table: 'table1', where: {id:1}}
     * @param pars {BaseModel|IDBOperationParam} 需要更新model对象，或操作指定
     */
    async update(pars: IDBOperationParam|BaseModel, table?: string, db?: any): Promise<IDBExecuteResult> {
        
        db = (pars instanceof BaseModel? db: pars.db) || this.db;
        table = table || (pars instanceof BaseModel? pars._tableName: pars.table);
        let data = pars instanceof BaseModel? pars._dbData: pars.data;
        //生成更新主健
        let primaryWhere = pars instanceof BaseModel? modelHelper.getPrimaryKeysWhere(pars): pars.where;
        
        if(db.update) {                
            return await db.update(table, data, primaryWhere);
        }
        else {
            let sql = `UPDATE ${table} SET `;                
            let params = new Array<any>();

            for(let c in data) {
                //如果是主健，则不参与更新
                if(primaryWhere[c] || typeof c != 'string') continue;
                sql += ` \`${c}\` = ?,`;
                params.push(data[c]);
            }
            if(sql.endsWith(',')) sql = sql.replace(/,$/, '');
            //组合更新条件
            let where = modelHelper.createSqlWhere(primaryWhere);
            if(where.where) {
                sql += ' WHERE ' + where.where;
                params = params.concat(where.params);
            }
            return await this.executeSql(sql, params, db);
        }
    }

    /**
     * 删除数据
     * 指定table 和 where 即可。如：{table: 'table1', where: {id:1}}
     * @param pars 
     */
    async delete(pars: IDBOperationParam): Promise<number> {
        pars.db = pars.db || this.db;
        return pars.db.delete(pars.table, pars.where);
    }

    /**
     * 往DB里插入一个model对象
     * @param data {BaseModel|IDBOperationParam} 新增的数据model或操作选项
     * @param table {string} 表名
     * @param db {MySql.Connection}[optional] DB连接
     * @returns {fieldCount: 0,affectedRows: 1,insertId: 6,serverStatus: 2,warningCount: 0,message: '',protocol41: true,changedRows: 0 }
     */
    async insert(data: IDBOperationParam|BaseModel, table: string = "", db: any = null): Promise<any> {          
        //如果是IDBOperationParam，则调用eggjs相关接口
        if(data && data instanceof BaseModel) {
            table = table || data._tableName;
            db = db || this.db; 
            let sql = `INSERT INTO ${table} SET ?`;
            return this.executeSql(sql, data._dbData, db);            
        }   
        else if(data.db) {
            return data.db.insert(table||data.table, data.data);
        }
    }

    /**
     * 执行sql
     * @param sql 要执行的SQL 例如sql="select * from id=?"
     * @param params SQL中的参数，例如[1]
     * @param db DB连接
     */
    async executeSql(sql: string, params: any=[], db: any=null): Promise<any> {
        db = db || this.db; 
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