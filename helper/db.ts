/// <reference path="../typings/index.d.ts" />
/**
 * 提供DB操作基础库
 * 支持分页等功能
 */
class DBHelper {
    /**
     * 使用SQL执行
     * 例如 pars = {"sql": "select * from table where id=? and title like ?", params: [1, '%abc%']}
     * @param {IDBSqlParam} pars 执行sql参数
     * @returns {IDBResult}
     */
    static async query(pars: IDBSqlParam): Promise<IDBResult> {
        let result = {
            data: null
        };
        result.data = await pars.db.query(pars.sql, pars.params);
        return result;
    }

    static async update(pars: IDBSqlParam): Promise<number> {
        pars.sql += '1';
        return 1;
    }
}

export default DBHelper;