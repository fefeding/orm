"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="../typings/index.d.ts" />
const base_1 = require("../model/base");
const modelHelper_1 = require("./modelHelper");
/**
 * 提供DB操作基础库
 * 支持分页等功能
 */
class DBHelper {
    /**
     * 生成DB实例
     * @param {Mysql} db DB操作对象，mysql的connection或 eggjs的
     */
    constructor(db) {
        if (db && db instanceof DBHelper)
            db = db.db;
        this.db = db;
    }
    /**
     * 给对象混入db操作实例接口
     * @param {class|object} target 需要混入DBHelper的实例
     */
    static apply(target) {
        Object.getOwnPropertyNames(this.prototype).forEach(name => {
            if (target.prototype)
                target.prototype[name] = this.prototype[name];
            else
                target[name] = this.prototype[name];
        });
    }
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
    async query(pars, type) {
        let result = {
            data: new Array()
        };
        pars.columns = pars.columns || '*';
        pars.db = pars.db || this.db;
        if (type && !pars.table)
            pars.table = type._tableName;
        if (pars.sql) {
            result.data = await this.execute(pars);
        }
        //where为字符串的情况，则拼sql来执行
        else if (pars.where && typeof pars.where == 'string') {
            result.data = await this.queryStringWhere(pars);
        }
        //where为object情况，直接select
        else if (pars.where && typeof pars.where == 'object') {
            result.data = await this.select(pars, type);
        }
        //如果指定了需要的类型，则先转换
        if (result.data && result.data.length && type) {
            result.data = modelHelper_1.default.toArray(result.data, type);
        }
        return result;
    }
    /**
     * 执行SQL
     * @param pars {IDBSqlParam} SQL和执行参数。如：{sql: 'update table set title=? where id=?', params: ['title1', 1]}
     * @returns {any} 受影响的行数
     */
    async execute(pars) {
        return this.executeSql(pars.sql || '', pars.params, pars.db || this.db);
    }
    /**
     * 执行有where并且为字符串的情况
     * 此函数不支持属性名到字段的映射，调用前自已处理
     * @param pars {IDBQueryParam}
     */
    async queryStringWhere(pars) {
        //如果是数组，则做一次字段映射，并转为字符串
        let columns = pars.columns || '*';
        let sql = `select ${columns} from ${pars.table}`;
        if (pars.where)
            sql += ` where ${pars.where}`;
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
        //如果有条数限制
        if (pars.limit) {
            if (pars.offset) {
                sql += ` limit ${pars.offset},${pars.limit}`;
            }
            else {
                sql += ` limit ${pars.limit}`;
            }
        }
        return this.executeSql(sql, pars.params, pars.db || this.db);
    }
    /**
     * 获取单个数据
     * @param pars {IDBQueryParam} 获取单条数据接口，{table:'table1', where: {id:1}}
     */
    async get(pars, type) {
        if (type && !pars.table)
            pars.table = type._tableName;
        pars.db = pars.db || this.db;
        if (pars.db.get) {
            //如果有传类型，则会做一次属性到字段的映射
            let where = type ? modelHelper_1.default.objectToFieldValues(pars.where, type) : pars.where;
            let data = await pars.db.get(pars.table, where);
            if (type)
                data = new type(data);
            return data;
        }
        else {
            //如果是数组，则做一次字段映射，并转为字符串
            let columns = pars.columns || '*';
            if (Array.isArray(columns)) {
                columns = modelHelper_1.default.convertFields(columns, type).join(',');
            }
            let sql = `SELECT ${columns} FROM ${pars.table}`;
            let where = modelHelper_1.default.createSqlWhere(pars.where);
            if (where.where) {
                sql += ' WHERE ' + where.where;
            }
            let data = await this.executeSql(sql, where.params, pars.db);
            if (data && data.length) {
                data = type ? new type(data[0]) : data[0];
            }
            return data;
        }
    }
    /**
     * 当where为object时，采用select直接查
     * @param pars {IDBQueryParam} select参数，where为object情况
     * @param type {BaseModel|type} 指定model类或实例
     */
    async select(pars, type) {
        pars.db = pars.db || this.db;
        //如果是数组，则做一次字段映射，并转为字符串
        let columns = pars.columns || '*';
        if (Array.isArray(columns)) {
            columns = modelHelper_1.default.convertFields(columns, type).join(',');
        }
        //如果是eggjs这种提供了select的，则直接调用,否则调用mysql原接口
        if (pars.db.select) {
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
            let where = modelHelper_1.default.createSqlWhere(pars.where);
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
     * 查询符合条件的数据条数
     * @param pars 参数参照query方法
     * @param type[optional] 类型
     */
    async count(pars, type) {
        let newpars = {};
        Object.assign(newpars, pars);
        newpars.columns = 'count(*) as count';
        delete newpars.limit; //去除限制
        delete newpars.orders;
        newpars.db = pars.db || this.db;
        if (type && !pars.table)
            newpars.table = type._tableName;
        let data;
        //where为字符串的情况，则拼sql来执行
        if (newpars.where && typeof newpars.where == 'string') {
            data = await this.queryStringWhere(newpars);
        }
        //where为object情况，直接select
        else if (newpars.where && typeof newpars.where == 'object') {
            data = await this.select(newpars, type);
        }
        if (data && data.length)
            return data[0]['count'];
        return 0;
    }
    /**
     * 分页查询
     * @param pars {IDBPagingQueryParam} 分页查询条件和参数，
     * @param type 数据对应的model
     */
    async queryPage(pars, type) {
        let result = {
            count: 0,
            total: 0,
            page: pars.page || 0,
            size: pars.size || 0,
            data: Array()
        };
        //总数据条数
        result.count = await this.count(pars, type);
        if (result.count <= 0) {
            return result;
        }
        if (pars.size > 0) {
            pars.limit = pars.size;
            pars.offset = pars.limit * pars.page;
            result.total = Math.ceil(result.count / pars.size);
        }
        result.data = (await this.query(pars, type)).data;
        return result;
    }
    /**
     * 更新数据
     * 指定table 和 where 即可。如：{table: 'table1', where: {id:1}}
     * @param pars {BaseModel|IDBOperationParam} 需要更新model对象，或操作指定
     * @param table {String}[optinal] 表名，如果不指定则从pars中读
     * @param db {any}[optional] 当前DB连接，不指定则用当前实例DB
     */
    async update(pars, table, db) {
        db = (pars instanceof base_1.default ? db : pars.db) || this.db;
        table = table || (pars instanceof base_1.default ? pars._tableName : pars.table);
        let data = pars instanceof base_1.default ? pars.$dbData : pars.data;
        //生成更新主健
        let primaryWhere = pars instanceof base_1.default ? modelHelper_1.default.getPrimaryKeysWhere(pars) : pars.where;
        if (db.update) {
            //去掉查询条件的值
            for (let k in data) {
                if (k in primaryWhere)
                    delete data[k];
            }
            return await db.update(table, data, {
                where: primaryWhere
            });
        }
        else {
            let sql = `UPDATE ${table} SET `;
            let params = new Array();
            for (let c in data) {
                //如果是主健，则不参与更新
                if (primaryWhere[c] || typeof c != 'string')
                    continue;
                sql += ` \`${c}\` = ?,`;
                params.push(data[c]);
            }
            if (sql.endsWith(','))
                sql = sql.replace(/,$/, '');
            //组合更新条件
            let where = modelHelper_1.default.createSqlWhere(primaryWhere, pars instanceof base_1.default ? pars : undefined);
            if (where.where) {
                sql += ' WHERE ' + where.where;
                params = params.concat(where.params);
            }
            return await this.executeSql(sql, params, db);
        }
    }
    /**
     * 删除数据
     * 指定table 和 where 即可。如：{table: 'table1', where: {id:1}}
     * @param pars {BaseModel|IDBOperationParam} 需要更新model对象，或操作指定
     * @param table {String}[optinal] 表名，如果不指定则从pars中读
     * @param db {any}[optional] 当前DB连接，不指定则用当前实例DB
     */
    async delete(pars, table, db) {
        db = (pars instanceof base_1.default ? db : pars.db) || this.db;
        table = table || (pars instanceof base_1.default ? pars._tableName : pars.table);
        //生成删除主健
        let primaryWhere = pars instanceof base_1.default ? modelHelper_1.default.getPrimaryKeysWhere(pars) : pars.where;
        if (db.delete) {
            return db.delete(table, primaryWhere);
        }
        else {
            let sql = `DELETE FROM ${table}`;
            let params = new Array();
            //组合更新条件
            let where = modelHelper_1.default.createSqlWhere(primaryWhere, pars instanceof base_1.default ? pars : undefined);
            if (where.where) {
                sql += ' WHERE ' + where.where;
                params = params.concat(where.params);
            }
            else {
                throw "未指定删除条件";
            }
            return await this.executeSql(sql, params, db);
        }
    }
    /**
     * 往DB里插入一个model对象
     * @param data {BaseModel|IDBOperationParam} 新增的数据model或操作选项
     * @param table {string} 表名
     * @param db {MySql.Connection}[optional] DB连接
     * @returns {IDBExecuteResult} 格式{fieldCount: 0,affectedRows: 1,insertId: 6,serverStatus: 2,warningCount: 0,message: '',protocol41: true,changedRows: 0 }
     */
    async insert(data, table = "", db = null) {
        //如果是IDBOperationParam，则调用eggjs相关接口
        if (data && data instanceof base_1.default) {
            table = table || data._tableName;
            db = db || this.db;
            let sql = `INSERT INTO ${table} SET ?`;
            return this.executeSql(sql, data.$dbData, db);
        }
        else if (data.db && data.db.insert) {
            return data.db.insert(table || data.table, data.data);
        }
    }
    /**
     * 执行sql
     * @param sql 要执行的SQL 例如sql="select * from id=?"
     * @param params SQL中的参数，例如[1]
     * @param db DB连接
     */
    async executeSql(sql, params = [], db = null) {
        db = db || this.db;
        //如果是eggjs-mysql，则直接调用await返回
        if (db.constructor && db.constructor.name == 'RDSClient') {
            return await db.query(sql, params);
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGJIZWxwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkYkhlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhDQUE4QztBQUM5Qyx3Q0FBc0M7QUFDdEMsK0NBQXdDO0FBRXhDOzs7R0FHRztBQUNILE1BQU0sUUFBUTtJQUNWOzs7T0FHRztJQUNILFlBQVksRUFBUTtRQUNoQixJQUFHLEVBQUUsSUFBSSxFQUFFLFlBQVksUUFBUTtZQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQzVDLElBQUksQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDO0lBQ2pCLENBQUM7SUFRRDs7O09BR0c7SUFDSSxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQVc7UUFDM0IsTUFBTSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDdEQsSUFBRyxNQUFNLENBQUMsU0FBUztnQkFBRSxNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7O2dCQUM5RCxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM3QyxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRDs7Ozs7Ozs7O09BU0c7SUFDSCxLQUFLLENBQUMsS0FBSyxDQUFDLElBQW1CLEVBQUUsSUFBOEI7UUFDM0QsSUFBSSxNQUFNLEdBQUc7WUFDVCxJQUFJLEVBQUUsSUFBSSxLQUFLLEVBQU87U0FDekIsQ0FBQztRQUNGLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxHQUFHLENBQUM7UUFFbkMsSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsRUFBRSxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDN0IsSUFBRyxJQUFJLElBQUksQ0FB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