import BaseModel from '../model/base';

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
    static getPropertyNames(target: any): Array<string> {
        let proto = Object.getPrototypeOf(target);
        let names = Object.getOwnPropertyNames(target);
        while(proto) {
            //如果到了基类object，则不再查找
            if(proto.constructor.name === 'Object') break;
            let tmp = Object.getOwnPropertyNames(proto);
            //过滤掉不可读和函数属性
            tmp.forEach(k => {
                if(k === '__proto__') return;
                let desc = Object.getOwnPropertyDescriptor(proto, k);
                let hasGetter = desc && typeof desc.get === 'function';
                if(hasGetter && names.indexOf(k) === -1) {                    
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
     static toArray<T>(data: Array<object|string>, type: { new(data: any): T ;}): Array<T> {
        if(!data || !data.length) return [];
        
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
     static getFieldName<T extends BaseModel>(name: string, type: { new(): T, $fieldMap: object;}|BaseModel): string {
        if(!type) return name;
        if(name.startsWith('_') || name.startsWith('$')) return "";
         //映射是 property:field
         //如果从映射中找到，则直接返回即可         
         if(type && type.$fieldMap && type.$fieldMap[name]) return type.$fieldMap[name];
         let field = name;
         //当不是以F开头时，认为属性名，则需要转为字段名
         if(!/^F/.test(name)) {
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
     static getPropertyName<T extends BaseModel>(name: string, type?: { new(): T, $fieldMap: object;}|BaseModel): string {
        
        if(name.startsWith('$')) return "";
         //映射是 property:field
         //如果从映射中找到，则直接返回即可         
         if(type && type.$fieldMap) {
             for(let k in type.$fieldMap) {
                 if(type.$fieldMap[k] === name) return k;
             }
         }
         
         //当不是以F开头时，认为属性名，则需要转为字段名
         if(/^F/.test(name)) {
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
     static convertFields(columns: Array<string>, type: { new(): BaseModel, $fieldMap: object;}|BaseModel): Array<string> {
        if(!type) return columns;
        let ret = new Array<string>();
        for(let i=0;i<columns.length;i++) {
            let c = this.getFieldName(columns[i], type) || columns[i];
            ret.push(c);
        }
        return ret;
     }

     /**
      * 获取model中的主健和其值
      * @param target model实例
      */
     static getPrimaryKeysWhere(target: BaseModel): object {
        let obj = {};
        let keys = target.$primaryKeys;
        if(keys && keys.length) {
            for(var i=0;i<keys.length;i++) {
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
     static createSqlWhere(obj: object, type?: { new(): BaseModel, $fieldMap: object;}|BaseModel): {where: string, params: Array<any>} {
         let result = {
             where: "",
             params: new Array<any>()
         };
         if(!obj) return result;
         let ps = this.getPropertyNames(obj);    
         //组合更新条件     
        for(let i=0; i<ps.length; i++) {
            let c = type? this.getFieldName(ps[i], type): ps[i];
            result.where += `\`${c}\`=? and `;
            result.params.push(obj[ps[i]]);
        }
        if(result.where.endsWith(' and ')) result.where = result.where.replace(/\s*and\s*$/, '');
        return result;
     }

     /**
      * 把原数据对象转为映射为表字段的对象
      * 例如: {id:1} 转为 {Fid:1}
      * @param obj {object} 原值对象
      * @param type {class|BaseModel} 对应的model类
      */
     static objectToFieldValues(obj: object, type: { new(): BaseModel, $fieldMap: object;}|BaseModel): object {
        let ret = {};
        for(var k in obj) {
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
     static toJSON(target: any, filter: Function = ()=>{}): object {
        let jsonObj = {};         
        let pros = this.getPropertyNames(target); 
        for (let key of pros) {
            if(filter && filter(key) === false) continue;
            jsonObj[key] = target[key];
        }
        return jsonObj;
     }

     /**
      * 生成model的代理对象，拦截其属性的访问
      * @param target model实例
      */
     static createModelProxy(target: BaseModel) {
          //所有model采用代理方法，从DB中取值
        return new Proxy<BaseModel>(target, {
            get: function (target, key, receiver) {                
                if(typeof key == 'string' && !key.startsWith('_') && !key.startsWith('$')) {
                    let pros = ModelHelper.getPropertyNames(target);
                    if(pros.includes(key)) {
                        let v = target.getValue(key, receiver);
                        if(typeof v != 'undefined') return v;
                    }
                }
                return Reflect.get(target, key, receiver);
            },
            set: function (target, key, value, receiver) {                
                if(typeof key == 'string' && !key.startsWith('_') && !key.startsWith('$')) {
                    let pros = ModelHelper.getPropertyNames(target);
                    if(pros.includes(key)) {
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
     static copyProperty(target: BaseModel, source: any): BaseModel {
        if(!source || typeof source != 'object') return target;
        for(let k in source) {            
            target.setValue(k, source[k], target);
        }
        
        return target;
     }
}

export default ModelHelper;