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
        //映射是 property:field
        //如果从映射中找到，则直接返回即可         
        if (type && type.$fieldMap && type.$fieldMap[name])
            return type.$fieldMap[name];
        let field = name;
        //当不是以F开头时，认为属性名，则需要转为字段名
        if (!/^F/.test(name)) {
            //把类似于 firstName 这种命名转为 Ffirst_name
            field = name.replace(/([A-Z])/g, p => '_' + p.toLowerCase());
            field = 'F' + field;
            type && type.$fieldMap && (type.$fieldMap[name] = field); //缓存映射
        }
        return field;
    }
    /**
     * 通过表字段名，找到对应的model属性名
     * @param name 字段名
     * @param type model的class类
     */
    static getPropertyName(name, type) {
        if (name.startsWith('$'))
            return "";
        //映射是 property:field
        //如果从映射中找到，则直接返回即可         
        if (type && type.$fieldMap) {
            for (let k in type.$fieldMap) {
                if (type.$fieldMap[k] === name)
                    return k;
            }
        }
        //当不是以F开头时，认为属性名，则需要转为字段名
        if (/^F/.test(name)) {
            //把类似于 Ffirst_name 这种命名转为 firstName
            let pro = name.replace(/^F/, '').replace(/_([A-z])/g, (_p, c) => c.toUpperCase());
            type && type.$fieldMap && (type.$fieldMap[pro] = name); //缓存映射
            return pro;
        }
        return name;
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
        let keys = target.$primaryKeys;
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
    /**
     * 复制属性到model实例
     * @param target 需要修改属性的model实例
     * @param source 用来修改model的object
     */
    static copyProperty(target, source) {
        if (!source || typeof source != 'object')
            return target;
        for (let k in source) {
            target.setValue(k, source[k], target);
        }
        return target;
    }
}
exports.default = ModelHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZWxIZWxwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJtb2RlbEhlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBOztHQUVHO0FBRUgsTUFBTSxXQUFXO0lBQ2I7Ozs7OztPQU1HO0lBQ0gsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE1BQVc7UUFDL0IsSUFBSSxLQUFLLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUMxQyxJQUFJLEtBQUssR0FBRyxNQUFNLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDL0MsT0FBTSxLQUFLLEVBQUU7WUFDVCxvQkFBb0I7WUFDcEIsSUFBRyxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksS0FBSyxRQUFRO2dCQUFFLE1BQU07WUFDOUMsSUFBSSxHQUFHLEdBQUcsTUFBTSxDQUFDLG1CQUFtQixDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzVDLGFBQWE7WUFDYixHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUNaLElBQUcsQ0FBQyxLQUFLLFdBQVc7b0JBQUUsT0FBTztnQkFDN0IsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLHdCQUF3QixDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDckQsSUFBSSxTQUFTLEdBQUcsSUFBSSxJQUFJLE9BQU8sSUFBSSxDQUFDLEdBQUcsS0FBSyxVQUFVLENBQUM7Z0JBQ3ZELElBQUcsU0FBUyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7b0JBQ3JDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ2pCO1lBQ0wsQ0FBQyxDQUFDLENBQUM7WUFDSCxLQUFLLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQztTQUMzQjtRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFRDs7Ozs7UUFLSTtJQUNILE1B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