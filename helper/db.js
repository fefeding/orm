"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
        return await pars.db.get(pars.table, pars.where);
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
    static async insert(pars) {
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
}
exports.default = DBHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkYi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhDQUE4QztBQUM5Qzs7O0dBR0c7QUFDSCxNQUFNLFFBQVE7SUFDVjs7Ozs7Ozs7T0FRRztJQUNILE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQW1CO1FBQ2xDLElBQUksTUFBTSxHQUFHO1lBQ1QsSUFBSSxFQUFFLEVBQUU7U0FDWCxDQUFDO1FBQ0YsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxJQUFJLEdBQUcsQ0FBQztRQUNuQyxJQUFHLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDVCxNQUFNLENBQUMsSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDNUQ7UUFDRCx1QkFBdUI7YUFDbEIsSUFBRyxJQUFJLENBQUMsS0FBSyxJQUFJLE9BQU8sSUFBSSxDQUFDLEtBQUssSUFBSSxRQUFRLEVBQUU7WUFDakQsTUFBTSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDN0M7UUFDRCwwQkFBMEI7YUFDckIsSUFBRyxJQUFJLENBQUMsS0FBSyxJQUFJLE9BQU8sSUFBSSxDQUFDLEtBQUssSUFBSSxRQUFRLEVBQUU7WUFDakQsTUFBTSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ25DO1FBQ0QsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFpQjtRQUNsQyxJQUFJLEdBQUcsR0FBRyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLE1B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