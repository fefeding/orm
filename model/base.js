"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PrimaryKeyId = Symbol("model primary key id");
const TableNameId = Symbol("model table name key id");
const TableFieldMapId = Symbol("model table field map id");
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
     * 当前对应表的唯一健
     * @property _primaryKeys
     * @type Array<string>
     */
    get _primaryKeys() {
        return this[PrimaryKeyId];
    }
    set _primaryKeys(value) {
        this[PrimaryKeyId] = value;
    }
    /**
     * 对应的表名
     * @property _tableName
     * @type string
     */
    get _tableName() {
        return this[TableNameId];
    }
    set _tableName(value) {
        this[TableNameId] = value;
    }
    /**
     * 表字段跟对象属性的映射
     * 格式：{property: field}
     * @property _fieldMap
     * @type Map
     */
    get _fieldMap() {
        return this[TableFieldMapId];
    }
    set _fieldMap(value) {
        this[TableFieldMapId] = value;
    }
    /**
     * 根据参数实例化当前类
     * @param {Object/String} data 如果传入object会当做DB表数据来映射，如果是model对象，则进行浅拷贝。如果是字符串只进行json转换
     * @param {Object} map 字段跟属性的映射，一般不需要指定，除非需要特殊  格式：{property: field}
     */
    constructor(data = "", map = {}) {
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
        this._fieldMap = Object.assign(this._fieldMap || {}, map);
        //所有model采用代理方法，从DB中取值
        return new Proxy(this, {
            get: function (target, key, receiver) {
                if (typeof key == 'string' && !key.startsWith('_')) {
                    let pros = target.getPropertyNames();
                    if (pros.includes(key)) {
                        let v = target.getValue(key);
                        if (typeof v != 'undefined')
                            return v;
                    }
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
    /**
     * 转为json串
     * @method toString
     * @returns string
     */
    toString() {
        let obj = this.toJSON();
        return JSON.stringify(obj);
    }
    /**
     * 表名装饰器
     * @param {String} name 表名
     */
    static Table(name, primaryKeys = []) {
        return (constructor) => {
            constructor.prototype[TableNameId] = name;
            if (primaryKeys && primaryKeys.length) {
                this.TablePrimaryKey(primaryKeys)(constructor);
            }
        };
    }
    /**
     * 表字段装饰器
     * @param {String} field 字段名
     */
    static TableField(field) {
        return (target, name) => {
            if (!target[TableFieldMapId]) {
                target[TableFieldMapId] = {};
            }
            target[TableFieldMapId][name] = field;
        };
    }
    /**
     * 表唯一健装饰器
     * "experimentalDecorators": true,
     */
    static TablePrimaryKey(name) {
        return (constructor) => {
            if (!constructor.prototype[PrimaryKeyId]) {
                constructor.prototype[PrimaryKeyId] = [];
            }
            if (Array.isArray(name)) {
                constructor.prototype[PrimaryKeyId] = name;
            }
            else {
                let v = constructor.prototype[PrimaryKeyId];
                if (!v.includes(name))
                    v.push(name);
            }
        };
    }
}
exports.BaseModel = BaseModel;
exports.default = BaseModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsc0JBQXNCLENBQUMsQ0FBQztBQUNwRCxNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMseUJBQXlCLENBQUMsQ0FBQztBQUN0RCxNQUFNLGVBQWUsR0FBRyxNQUFNLENBQUMsMEJBQTBCLENBQUMsQ0FBQztBQUUzRDs7Ozs7OztHQU9HO0FBQ0gsTUFBTSxTQUFTO0lBU1g7Ozs7T0FJRztJQUNILElBQVcsWUFBWTtRQUNuQixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBQ0QsSUFBVyxZQUFZLENBQUMsS0FBb0I7UUFDeEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLEtBQUssQ0FBQztJQUMvQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNILElBQVcsVUFBVTtRQUNqQixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUM3QixDQUFDO0lBQ0QsSUFBVyxVQUFVLENBQUMsS0FBYTtRQUMvQixJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsS0FBSyxDQUFDO0lBQzlCLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILElBQVcsU0FBUztRQUNoQixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUNqQyxDQUFDO0lBQ0QsSUFBVyxTQUFTLENBQUMsS0FBYTtRQUM5QixJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsS0FBSyxDQUFDO0lBQ2xDLENBQUM7SUFFQTs7OztPQUlHO0lBQ0gsWUFBWSxPQUFZLEVBQUUsRUFBRSxHQUFHLEdBQUcsRUFBRTtRQUVqQyxJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUVsQixJQUFHLElBQUksRUFBRTtZQUNMLElBQUcsT0FBTyxJQUFJLElBQUksUUFBUSxFQUFFO2dCQUN4QixJQUFJLEdBQUcsSUFBSSxDQUFDLEtB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