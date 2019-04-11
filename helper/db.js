"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    static async query(pars) {
        let result = {
            data: null
        };
        result.data = await pars.db.query(pars.sql, pars.params);
        return result;
    }
    static async update(pars) {
        pars.sql += '1';
        return 1;
    }
}
exports.default = DBHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkYi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDhDQUE4QztBQUM5Qzs7O0dBR0c7QUFDSCxNQUFNLFFBQVE7SUFDVjs7Ozs7T0FLRztJQUNILE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQWlCO1FBQ2hDLElBQUksTUFBTSxHQUFHO1lBQ1QsSUFBSSxFQUFFLElBQUk7U0FDYixDQUFDO1FBQ0YsTUFBTSxDQUFDLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3pELE9BQU8sTUFBTSxDQUFDO0lBQ2xCLENBQUM7SUFFRCxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFpQjtRQUNqQyxJQUFJLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQztRQUNoQixPQUFPLENBQUMsQ0FBQztJQUNiLENBQUM7Q0FDSjtBQUVELGtCQUFlLFFBQVEsQ0FBQyJ9