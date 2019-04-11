"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 数据model的基础类
 * 构造函数可以接受DB查出的result
 * 属性跟DB中的字段规定为  加前缀F
 * 例如：属性名为firsName 会自动映射到_dbData中的Ffirst_name字段
 * 以下划线为开头的属性名不会做映射
 * 注： 所有需要支持json序列化的，请定义时指定默认值。如： firstName: string = "";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQTs7Ozs7OztHQU9HO0FBQ0gsTUFBTSxTQUFTO0lBZ0JWOzs7O09BSUc7SUFDSCxZQUFZLE9BQVksRUFBRSxFQUFFLEdBQUcsR0FBRyxFQUFFO1FBcEJyQzs7Ozs7V0FLRztRQUNJLGNBQVMsR0FBVyxFQUFFLENBQUM7UUFnQjFCLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBRWxCLElBQUcsSUFBSSxFQUFFO1lBQ0wsSUFBRyxPQUFPLElBQUksSUFBSSxRQUFRLEVBQUU7Z0JBQ3hCLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN4QixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFBLEtBQUs7YUFDbEM7WUFDRCxPQUFPO2lCQUNGLElBQUcsT0FBTyxJQUFJLElBQUksUUFBUSxJQUFJLElBQUksQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLElBQUksZUFBZSxFQUFFO2dCQUM3RixJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQzthQUN2QjtpQkFDSSxJQUFHLE9BQU8sSUFBSSxJQUFJLFFBQVEsRUFBRTtnQkFDN0IsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQSxLQUFLO2FBQ2xDO1NBQ0o7UUFDRCxJQUFJLENBQUMsU0FBUyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBRXhDLHNCQUFzQjtRQUN0QixPQUFPLElBQUksS0FBSyxDQUFDLElBQUksRUFBRTtZQUNuQixHQUFHLEVBQUUsVUFBVSxNQUFNLEVBQUUsR0FBRyxFQUFFLFFBQVE7Z0JBQ2hDLElBQUcsT0FBTyxHQUFHLElBQUksUUFBUSxJQUFJLENBQUMsR0FB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