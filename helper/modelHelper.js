"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * TS 反射的一些封装
 */
class ModelHelper {
    /**
     * 获取对象的属性名称集合
     * 如果继承自 BaseModel ，则到BaseModel后不会再往上查找
     *
     * @param target {class} 需要获取属性的实例
     * @returns {Array<string>} 属性名称数组
     */
    static getPropertyNames(target) {
        let proto = Object.getPrototypeOf(target);
        let names = Object.getOwnPropertyNames(target);
        while (proto) {
            //如果到了基类object，则不再查找
            if (proto.constructor.name === 'Object')
                break;
            let tmp = Object.getOwnPropertyNames(proto);
            //过滤掉不可读和函数属性
            tmp.forEach(k => {
                if (k === '__proto__')
                    return;
                let desc = Object.getOwnPropertyDescriptor(proto, k);
                let hasGetter = desc && typeof desc.get === 'function';
                if (hasGetter && names.indexOf(k) === -1) {
                    names.push(k);
                }
            });
            proto = proto.__proto__;
        }
        return names;
    }
    /**
      * 把原始数据组转为当前model数组
      * @param {Array} data 原始数据数组
      * @static
      * @returns {Array<Model>}
      */
    static toArray(data, type) {
        if (!data || !data.length)
            return [];
        return Array.from(data, (d) => {
            return new type(d);
        });
    }
    /**
     * 获取model类型中属性对应的表字段名
     * 根据属性名得到对应的表字段名，这里规定死为属性名前加一个F为字段名
     * 并把大写字母转为_小写
     * 如果传入了_或$开头的名称，则返回空
     * @param name model中的属性名
     * @param type model的class类
     */
    static getFieldName(name, type) {
        if (!type)
            return name;
        if (name.startsWith('_') || name.startsWith('$'))
            return "";
        //映射是 field: property
        //如果从映射中找到，则直接返回即可         
        if (type && type._fieldMap && type._fieldMap[name])
            return type._fieldMap[name];
        let field = name;
        //当不是以F开头时，认为属性名，则需要转为字段名
        if (!/^F/.test(name)) {
            //把类似于 firstName 这种命名转为 first_name
            field = name.replace(/([A-Z])/g, p => '_' + p.toLowerCase());
            field = 'F' + field;
            type && type._fieldMap && (type._fieldMap[name] = field); //缓存映射
        }
        return field;
    }
    /**
     * 把属性集合转为字段集合
     * @param columns 属性的集合
     */
    static convertFields(columns, type) {
        if (!type)
            return columns;
        let ret = new Array();
        for (let i = 0; i < columns.length; i++) {
            let c = this.getFieldName(columns[i], type) || columns[i];
            ret.push(c);
        }
        return ret;
    }
    /**
     * 获取model中的主健和其值
     * @param target model实例
     */
    static getPrimaryKeysWhere(target) {
        let obj = {};
        let keys = target._primaryKeys;
        if (keys && keys.length) {
            for (var i = 0; i < keys.length; i++) {
                let f = target.getFieldName(keys[i]) || keys[i];
                obj[f] = target[keys[i]] || target.$dbData[f];
            }
        }
        return obj;
    }
    /**
     * 生成SQL参数语句
     * 默认会返回
     * {
            where: "",
            params: new Array<any>()
        };
     * @param obj {object} sql条件参数
     * @param type {BaseModel|class} 指定类型，如果不指定则字段按属性名，指定了就会去取映射的字段名
     */
    static createSqlWhere(obj, type) {
        let result = {
            where: "",
            params: new Array()
        };
        if (!obj)
            return result;
        let ps = this.getPropertyNames(obj);
        //组合更新条件     
        for (let i = 0; i < ps.length; i++) {
            let c = type ? this.getFieldName(ps[i], type) : ps[i];
            result.where += `\`${c}\`=? and `;
            result.params.push(obj[ps[i]]);
        }
        if (result.where.endsWith(' and '))
            result.where = result.where.replace(/\s*and\s*$/, '');
        return result;
    }
    /**
     * 把原数据对象转为映射为表字段的对象
     * 例如: {id:1} 转为 {Fid:1}
     * @param obj {object} 原值对象
     * @param type {class|BaseModel} 对应的model类
     */
    static objectToFieldValues(obj, type) {
        let ret = {};
        for (var k in obj) {
            let f = this.getFieldName(k, type) || k;
            ret[f] = obj[k];
        }
        return ret;
    }
    /**
     * 转为json
     * @method toJSON
     * @param target {class} 需要转为json的实例
     * @param filter {Function} 需要对属性过滤的函数，返回false则不处理此属性
     * @returns object
     */
    static toJSON(target, filter = () => { }) {
        let jsonObj = {};
        let pros = this.getPropertyNames(target);
        for (let key of pros) {
            if (filter && filter(key) === false)
                continue;
            jsonObj[key] = target[key];
        }
        return jsonObj;
    }
    /**
     * 生成model的代理对象，拦截其属性的访问
     * @param target model实例
     */
    static createModelProxy(target) {
        //所有model采用代理方法，从DB中取值
        return new Proxy(target, {
            get: function (target, key, receiver) {
                if (typeof key == 'string' && !key.startsWith('_') && !key.startsWith('$')) {
                    let pros = ModelHelper.getPropertyNames(target);
                    if (pros.includes(key)) {
                        let v = target.getValue(key, receiver);
                        if (typeof v != 'undefined')
                            return v;
                    }
                }
                return Reflect.get(target, key, receiver);
            },
            set: function (target, key, value, receiver) {
                if (typeof key == 'string' && !key.startsWith('_') && !key.startsWith('$')) {
                    let pros = ModelHelper.getPropertyNames(target);
                    if (pros.includes(key)) {
                        target.setValue(key, value, receiver);
                        return true;
                    }
                }
                return Reflect.set(target, key, value, receiver);
            }
        });
    }
}
exports.default = ModelHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZWxIZWxwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJtb2RlbEhlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBOztHQUVHO0FBRUgsTUFBTSxXQUFXO0lBQ2I7Ozs7OztPQU1HO0lBQ0gsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE1BQVc7UUFDL0IsSUFBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMxQyxJQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDL0MsT0FBTSxLQUFLLEVBQUU7WUFDVCxvQkFBb0I7WUFDcEIsSUFBRyxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksS0FBSyxRQUFRO2dCQUFFLE1BQU07WUFDOUMsSUFBSSxHQUFHLEdBQUcsTUFBTSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzVDLGFBQWE7WUFDYixHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUNaLElBQUcsQ0FBQyxLQUFLLFdBQVc7b0JBQUUsT0FBTztnQkFDN0IsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLHdCQUF3QixDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDckQsSUFBSSxTQUFTLEdBQUcsSUFBSSxJQUFJLE9BQU8sSUFBSSxDQUFDLEdBQUcsS0FBSyxVQUFVLENBQUM7Z0JBQ3ZELElBQUcsU0FBUyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7b0JBQ3JDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ2pCO1lBQ0wsQ0FBQyxDQUFDLENBQUM7WUFDSCxLQUFLLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQztTQUMzQjtRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFRDs7Ozs7UUFLSTtJQUNILE1BQU0sQ0FBQyxPQUFPLENBQUksSUFBMEIsRUFBRSxJQUE0QjtRQUN2RSxJQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU07WUFBRSxPQUFPLEVBQUUsQ0FBQztRQUVwQyxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUU7WUFDMUIsT0FBTyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QixDQUFDLENBQUMsQ0FBQztJQUNOLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0gsTUFBTSxDQUFDLFlBQVksQ0FBc0IsSUFBWSxFQUFFLElBQStDO1FBQ25HLElBQUcsQ0FBQyxJQUFJO1lBQUUsT0FBTyxJQUFJLENBQUM7UUFDdEIsSUFBRyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDO1lBQUUsT0FBTyxFQUFFLENBQUM7UUFDMUQscUJBQXFCO1FBQ3JCLDJCQUEyQjtRQUMzQixJQUFHLElBQUksSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO1lBQUUsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQy9FLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQztRQUNqQix5QkFBeUI7UUFDekIsSUFBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDakIsa0NBQWtDO1lBQ25DLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztZQUM3RCxLQUFLLEdBQUcsR0FBRyxHQUFHLEtBQUssQ0FBQztZQUVwQixJQUFJLElBQUksSUFBSSxDQUFDLFNBQVMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNO1NBQ2xFO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVEOzs7T0FHRztJQUNILE1BQU0sQ0FBQyxhQUFhLENBQUMsT0FBc0IsRUFBRSxJQUF1RDtRQUNqRyxJQUFHLENBQUMsSUFBSTtZQUFFLE9BQU8sT0FBTyxDQUFDO1FBQ3pCLElBQUksR0FBRyxHQUFHLElBQUksS0FBSyxFQUFVLENBQUM7UUFDOUIsS0FBSSxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUMsQ0FBQyxFQUFFLEVBQUU7WUFDOUIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFELEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDZjtRQUNELE9BQU8sR0FBRyxDQUFDO0lBQ2QsQ0FBQztJQUVEOzs7T0FHRztJQUNILE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxNQUFpQjtRQUN6QyxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7UUFDYixJQUFJLElBQUksR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDO1FBQy9CLElBQUcsSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDcEIsS0FBSSxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxNQUFNLEVBQUMsQ0FBQyxFQUFFLEVBQUU7Z0JBQzNCLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNoRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7YUFDakQ7U0FDSjtRQUNELE9BQU8sR0FBRyxDQUFDO0lBQ2QsQ0FBQztJQUVEOzs7Ozs7Ozs7T0FTRztJQUNILE1BQU0sQ0FBQyxjQUFjLENBQUMsR0FBVyxFQUFFLElBQXdEO1FBQ3ZGLElBQUksTUFBTSxHQUFHO1lBQ1QsS0FBSyxFQUFFLEVBQUU7WUFDVCxNQUFNLEVBQUUsSUFBSSxLQUFLLEVBQU87U0FDM0IsQ0FBQztRQUNGLElBQUcsQ0FBQyxHQUFHO1lBQUUsT0FBTyxNQUFNLENBQUM7UUFDdkIsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3BDLGFBQWE7UUFDZCxLQUFJLElBQUksQ0FBQyxHQUFDLENBQUMsRUFBRSxDQUFDLEdBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUMzQixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUEsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFBLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEQsTUFBTSxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsV0FBVyxDQUFDO1lBQ2xDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2xDO1FBQ0QsSUFBRyxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUM7WUFBRSxNQUFNLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUMsQ0FBQztRQUN6RixPQUFPLE1BQU0sQ0FBQztJQUNqQixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxNQUFNLENBQUMsbUJBQW1CLENBQUMsR0FBVyxFQUFFLElBQXVEO1FBQzVGLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztRQUNiLEtBQUksSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFO1lBQ2QsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3hDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDbkI7UUFDRCxPQUFPLEdBQUcsQ0FBQztJQUNkLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSCxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQVcsRUFBRSxTQUFtQixHQUFFLEVBQUUsR0FBQyxDQUFDO1FBQ2pELElBQUksT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNqQixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDekMsS0FBSyxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUU7WUFDbEIsSUFBRyxNQUFNLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEtBQUs7Z0JBQUUsU0FBUztZQUM3QyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQzlCO1FBQ0QsT0FBTyxPQUFPLENBQUM7SUFDbEIsQ0FBQztJQUVEOzs7T0FHRztJQUNILE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFpQjtRQUNwQyxzQkFBc0I7UUFDeEIsT0FBTyxJQUFJLEtBQUssQ0FBWSxNQUFNLEVBQUU7WUFDaEMsR0FBRyxFQUFFLFVBQVUsTUFBTSxFQUFFLEdBQUcsRUFBRSxRQUFRO2dCQUNoQyxJQUFHLE9BQU8sR0FBRyxJQUFJLFFBQVEsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFO29CQUN2RSxJQUFJLElBQUksR0FBRyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQ2hELElBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTt3QkFDbkIsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7d0JBQ3ZDLElBQUcsT0FBTyxDQUFDLElBQUksV0FBVzs0QkFBRSxPQUFPLENBQUMsQ0FBQztxQkFDeEM7aUJBQ0o7Z0JBQ0QsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDOUMsQ0FBQztZQUNELEdBQUcsRUFBRSxVQUFVLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLFFBQVE7Z0JBQ3ZDLElBQUcsT0FBTyxHQUFHLElBQUksUUFBUSxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQ3ZFLElBQUksSUFBSSxHQUFHLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDaEQsSUFBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFO3dCQUNuQixNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7d0JBQ3RDLE9BQU8sSUFBSSxDQUFDO3FCQUNmO2lCQUNKO2dCQUNELE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNyRCxDQUFDO1NBQ0YsQ0FBQyxDQUFDO0lBQ1IsQ0FBQztDQUNMO0FBRUQsa0JBQWUsV0FBVyxDQUFDIn0=