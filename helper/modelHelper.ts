/**
 * TS 反射的一些封装
 */

class modelHelper {
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
      * @param name model中的属性名
      * @param type model的class类
      */
     static getFieldName(name: string, type: { new();}): string {
        let instance = new type();
        return instance.getFieldName(name);
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
}

export default modelHelper;