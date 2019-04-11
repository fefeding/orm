/// <reference path="../typings/index.d.ts" />
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
    static async query(pars: IDBQueryParam): Promise<IDBResult> {
        let result = {
            data: {}
        };
        pars.columns = pars.columns || '*';
        if(pars.sql) {
            result.data = await pars.db.query(pars.sql, pars.params);
        }
        //where为字符串的情况，则拼sql来执行
        else if(pars.where && typeof pars.where == 'string') {            
            result.data = this.queryStringWhere(pars);
        }
        //where为ob ject情况，直接select
        else if(pars.where && typeof pars.where == 'object') {
            result.data = this.select(pars);
        }
        return result;
    }

    /**
     * 执行SQL
     * @param pars SQL和执行参数。如：{sql: 'update table set title=? where id=?', params: ['title1', 1]}
     * @returns {IDBExecuteResult} 受影响的行数
     */
    static async execute(pars: IDBSqlParam): Promise<IDBExecuteResult> {
        let ret = await pars.db.query(pars.sql, pars.params);
        return ret;
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
        return await pars.db.query(sql, pars.params);
    }

    /**
     * 获取单个数据
     * @param pars 获取单条数据接口，{table:'table1', where: {id:1}}
     */
    static async get(pars: IDBQueryParam): Promise<any> {
        return await pars.db.get(pars.table, pars.where);
    }

    /**
     * 当where为object时，采用select直接查
     * @param pars select参数，where为object情况
     */
    static async select(pars: IDBQueryParam): Promise<any> {
        let condition = {
            where: pars.where,
            orders: pars.orders || [],
            columns: pars.columns || '*'
        };
        return await pars.db.select(condition);
    }

    /**
     * 新增
     * @param pars 
     */
    static async insert(pars: IDBOperationParam) {
        return pars.db.insert(pars.table, pars.data);
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
}

export default DBHelper;