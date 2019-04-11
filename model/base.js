"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 数据model的基础类
 * 构造函数可以接受DB查出的result
 * 属性跟DB中的字段规定为  加前缀F
 * 例如：属性名为firsName 会自动映射到_dbData中的Ffirst_name字段
 * 以下划线为开头的属性名不会做映射
 */
class BaseModel {
    /**
     * 根据参数实例化当前类
     * @param {Object/String} data 如果传入object会当做DB表数据来映射，如果是model对象，则进行浅拷贝。如果是字符串只进行json转换
     * @param {Object} map 字段跟属性的映射，一般不需要指定，除非需要特殊  格式：{property: field}
     */
    constructor(data = "", map = {}) {
        /**
         * 表字段跟对象属性的映射
         * 格式：{property: field}
         * @property _fieldMap
         * @type Map
         */
        this._fieldMap = {};
        this._dbData = {};
        if (data) {
            if (typeof data == 'string') {
                data = JSON.parse(data);
                Object.assign(this, data); //浅拷贝
            }
            //DB原数据
            else if (typeof data == 'object' && data.constructor && data.constructor.name == 'RowDataPacket') {
                this._dbData = data;
            }
            else if (typeof data == 'object') {
                Object.assign(this, data); //浅拷贝
            }
        }
        this._fieldMap = Object.assign({}, map);
        //所有model采用代理方法，从DB中取值
        return new Proxy(this, {
            get: function (target, key, receiver) {
                if (typeof key == 'string' && !key.startsWith('_')) {
                    let pros = target.getPropertyNames();
                    if (pros.includes(key))
                        return target.getValue(key);
                }
                return Reflect.get(target, key, receiver);
            },
            set: function (target, key, value, receiver) {
                if (typeof key == 'string' && !key.startsWith('_')) {
                    let pros = target.getPropertyNames();
                    if (pros.includes(key)) {
                        target.setValue(key, value);
                        return true;
                    }
                }
                return Reflect.set(target, key, value, receiver);
            }
        });
    }
    /**
     * 从DB数据源中读取属性值
     * @method getValue
     * @param {string} name 属性名，也可以是在DB中的字段名
     */
    getValue(name) {
        let field = this.getFieldName(name);
        return this._dbData[field];
    }
    /**
     * 把数据写到DB原对象中
     * @method getValue
     * @param {string} name 属性名
     * @param {any} value 设置值
     */
    setValue(name, value) {
        let field = this.getFieldName(name);
        this._dbData[field] = value;
    }
    /**
     * 根据属性名得到对应的表字段名，这里规定死为属性名前加一个F为字段名
     * 并把大写字母转为_小写
     * @method getFieldName
     * @param {String} name 属性名
     */
    getFieldName(name) {
        //映射是 field: property
        //如果从映射中找到，则直接返回即可         
        if (this._fieldMap[name])
            return this._fieldMap[name];
        let field = '';
        //当不是以F开头时，认为属性名，则需要转为字段名
        if (!/^F/.test(name)) {
            //把类似于 firstName 这种命名转为 first_name
            field = name.replace(/([A-Z])/g, p => '_' + p.toLowerCase());
            field = 'F' + field;
            this._fieldMap[name] = field; //缓存映射
        }
        return field;
    }
    /**
     * 把原始数据组转为当前model数组
     * @param {Array} data 原始数据数组
     * @static
     * @returns {Array<Model>}
     */
    static toArray(data) {
        if (!data || !data.length)
            return [];
        return Array.from(data, d => new this(d));
    }
    /**
     * 表名修饰符
     * @param {String} name 表名
     */
    static Table(name) {
        return (target) => {
            target.TableName = name;
            return target;
        };
    }
    /**
     * 表字段修饰符
     * @param {String} field 字段名
     */
    static TableField(field) {
        return (target, name, descriptor) => {
            Object.assign(target, {
                field: field
            });
            target.fieldMap = target.fieldMap || new Map();
            target.fieldMap.set(name, field);
            return descriptor;
        };
    }
    /**
     * 获取所有属性名，包括子和父类
     */
    getPropertyNames() {
        let proto = Object.getPrototypeOf(this);
        let names = Object.getOwnPropertyNames(this);
        while (proto) {
            let tmp = Object.getOwnPropertyNames(proto);
            //过滤掉不可读和函数属性
            tmp.forEach(k => {
                let desc = Object.getOwnPropertyDescriptor(proto, k);
                let hasGetter = desc && typeof desc.get === 'function';
                if (hasGetter && names.indexOf(k) === -1) {
                    names.push(k);
                }
            });
            //如果已到基类 BaseModel 则不再往上找
            if (proto.constructor == BaseModel)
                break;
            proto = proto.__proto__;
        }
        return names;
    }
    /**
     * 转为json
     * @method toJSON
     * @returns object
     */
    toJSON() {
        let jsonObj = {};
        let pros = this.getPropertyNames();
        for (let key of pros) {
            jsonObj[key] = this[key];
        }
        return jsonObj;
    }
}
exports.default = BaseModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQTs7Ozs7O0dBTUc7QUFDSCxNQUFNLFNBQVM7SUFnQlY7Ozs7T0FJRztJQUNILFlBQVksT0FBWSxFQUFFLEVBQUUsR0FBRyxHQUFHLEVBQUU7UUFwQnJDOzs7OztXQUtHO1FBQ0ksY0FBUyxHQUFXLEVBQUUsQ0FBQztRQWdCMUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFFbEIsSUFBRyxJQUFJLEVBQUU7WUFDTCxJQUFHLE9BQU8sSUFBSSxJQUFJLFFBQVEsRUFBRTtnQkFDeEIsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3hCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUEsS0FBSzthQUNsQztZQUNELE9BQU87aUJBQ0YsSUFBRyxPQUFPLElBQUksSUFBSSxRQUFRLElBQUksSUFBSSxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksSUFBSSxlQUFlLEVBQUU7Z0JBQzdGLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO2FBQ3ZCO2lCQUNJLElBQUcsT0FBTyxJQUFJLElBQUksUUFBUSxFQUFFO2dCQUM3QixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFBLEtBQUs7YUFDbEM7U0FDSjtRQUNELElBQUksQ0FBQyxTQUFTLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFFeEMsc0JBQXNCO1FBQ3RCLE9BQU8sSUFBSSxLQUFLLENBQUMsSUFBSSxFQUFFO1lBQ25CLEdBQUcsRUFBRSxVQUFVLE1BQU0sRUFBRSxHQUFHLEVBQUUsUUFBUTtnQkFDaEMsSUFBRyxPQUFPLEdBQUcsSUFBSSxRQUFRLElBQUksQ0FBQyxHQUFH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