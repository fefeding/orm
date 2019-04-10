"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
        return 1;
    }
}
exports.default = DBHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkYi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBOzs7R0FHRztBQUNILE1BQU0sUUFBUTtJQUNWOzs7OztPQUtHO0lBQ0gsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBaUI7UUFDaEMsSUFBSSxNQUFNLEdBQUc7WUFDVCxJQUFJLEVBQUUsSUFBSTtTQUNiLENBQUM7UUFDRixNQUFNLENBQUMsSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDekQsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUVELE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQWlCO1FBQ2pDLE9BQU8sQ0FBQyxDQUFDO0lBQ2IsQ0FBQztDQUNKO0FBRUQsa0JBQWUsUUFBUSxDQUFDIn0=