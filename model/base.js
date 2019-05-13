"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modelHelper_1 = require("../helper/modelHelper");
const PrimaryKeyId = Symbol("$primaryKeys");
const TableNameId = Symbol("$tableName");
const TableFieldMapId = Symbol("$tableFieldMap");
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
        this.$dbData = {};
        //所有model采用代理方法，从DB中取值
        let obj = modelHelper_1.default.createModelProxy(this);
        if (data) {
            if (typeof data == 'string') {
                data = JSON.parse(data);
                Object.assign(this, data); //浅拷贝
            }
            //DB原数据
            else if (typeof data == 'object' && data.constructor && data.constructor.name == 'RowDataPacket') {
                this.$dbData = data;
            }
            else if (typeof data == 'object') {
                Object.assign(obj, data); //浅拷贝
            }
        }
        this._fieldMap = Object.assign(this._fieldMap || {}, map);
        return obj;
    }
    /**
     * 当前对应表的唯一健
     * @property _primaryKeys
     * @type Array<string>
     */
    get _primaryKeys() {
        let proto = Object.getPrototypeOf(this);
        return proto[PrimaryKeyId];
    }
    set _primaryKeys(value) {
        let proto = Object.getPrototypeOf(this);
        proto[PrimaryKeyId] = value;
    }
    /**
     * 当前对应表的唯一健
     * @static
     * @property _primaryKeys
     * @type Array<string>
     */
    static get _primaryKeys() {
        return this.prototype[PrimaryKeyId];
    }
    static set _primaryKeys(value) {
        this.prototype[PrimaryKeyId] = value;
    }
    /**
     * 对应的表名
     * @property _tableName
     * @type string
     */
    get _tableName() {
        let proto = Object.getPrototypeOf(this);
        return proto[TableNameId];
    }
    set _tableName(value) {
        let proto = Object.getPrototypeOf(this);
        proto[TableNameId] = value;
    }
    /**
     * 对应的表名
     * @static
     * @property tableName
     * @type string
     */
    static get _tableName() {
        return this.prototype[TableNameId];
    }
    static set _tableName(value) {
        this.prototype[TableNameId] = value;
    }
    /**
     * 表字段跟对象属性的映射
     * 格式：{property: field}
     * @property _fieldMap
     * @type Map
     */
    get _fieldMap() {
        let proto = Object.getPrototypeOf(this);
        return proto[TableFieldMapId];
    }
    set _fieldMap(value) {
        let proto = Object.getPrototypeOf(this);
        proto[TableFieldMapId] = value;
    }
    /**
     * 表字段跟对象属性的映射
     * 格式：{property: field}
     * @property _fieldMap
     * @type Map
     */
    static get _fieldMap() {
        return this.prototype[TableFieldMapId];
    }
    static set _fieldMap(value) {
        this.prototype[TableFieldMapId] = value;
    }
    /**
     * 从DB数据源中读取属性值
     * @method getValue
     * @param {string} name 属性名，也可以是在DB中的字段名
     */
    getValue(name, receiver) {
        if (!this.$dbData)
            return null;
        let field = this.getFieldName(name);
        if (field)
            return this.$dbData[field];
        else {
            return Reflect.get(this, name, receiver);
        }
    }
    /**
     * 把数据写到DB原对象中
     * @method getValue
     * @param {string} name 属性名
     * @param {any} value 设置值
     */
    setValue(name, value, receiver) {
        if (this.$dbData) {
            let field = this.getFieldName(name);
            this.$dbData[field] = value;
        }
        else {
            Reflect.set(this, name, value, receiver);
        }
    }
    /**
     * 根据属性名得到对应的表字段名，这里规定死为属性名前加一个F为字段名
     * 并把大写字母转为_小写
     * 如果传入了_或$开头的名称，则返回空
     * @method getFieldName
     * @param {String} name 属性名
     */
    getFieldName(name) {
        return modelHelper_1.default.getFieldName(name, this);
    }
    static getFieldName(name) {
        return modelHelper_1.default.getFieldName(name, this);
    }
    /**
     * 转为json
     * @method toJSON
     * @returns object
     */
    toJSON() {
        let jsonObj = modelHelper_1.default.toJSON(this, (k) => !k.startsWith('$'));
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
     * 把原始数据组转为当前model数组
     * @param {Array} data 原始数据数组
     * @static
     * @returns {Array<any>}
     */
    static toArray(data) {
        return modelHelper_1.default.toArray(data, this);
    }
    /**
     * 表名装饰器
     * @param {String} name 表名
     * @param {Array<string>}[optional] 要吧指定表的唯一健,可以是属性名或字段名
     */
    static Table(name, primaryKeys) {
        return (constructor) => {
            constructor.prototype[TableNameId] = name;
            if (primaryKeys && primaryKeys.length) {
                this.TablePrimaryKey()(constructor.prototype, primaryKeys);
            }
        };
    }
    /**
     * 表字段装饰器
     * @param {String} field 字段名
     * @param {Boolean}[optional] isPrimary 是否为主健，不设置则不处理
     */
    static TableField(field, isPrimary) {
        return (target, name) => {
            if (!target[TableFieldMapId]) {
                target[TableFieldMapId] = {};
            }
            target[TableFieldMapId][name] = field;
            //设定为主健
            if (isPrimary === true) {
                this.TablePrimaryKey()(target, name);
            }
        };
    }
    /**
     * 表唯一健装饰器
     * 可以用到属性上
     * "experimentalDecorators": true,
     */
    static TablePrimaryKey() {
        return (target, name) => {
            if (!target[PrimaryKeyId]) {
                target[PrimaryKeyId] = [];
            }
            if (Array.isArray(name)) {
                target[PrimaryKeyId] = target[PrimaryKeyId].concat(name);
            }
            else {
                let v = target[PrimaryKeyId];
                if (!v.includes(name))
                    v.push(name);
            }
        };
    }
}
exports.BaseModel = BaseModel;
exports.default = BaseModel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSx1REFBZ0Q7QUFFaEQsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQzVDLE1BQU0sV0FBVyxHQUFHLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUN6QyxNQUFNLGVBQWUsR0FBRyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUVqRDs7Ozs7OztHQU9HO0FBQ0gsTUFBTSxTQUFTO0lBQ1g7Ozs7UUFJSTtJQUNILFlBQVksT0FBWSxFQUFFLEVBQUUsR0FBRyxHQUFHLEVBQUU7UUFFakMsSUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFFbEIsc0JBQXNCO1FBQ3RCLElBQUksR0FBRyxHQUFHLHFCQUFXLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFN0MsSUFBRyxJQUFJLEVBQUU7WUFDTCxJQUFHLE9BQU8sSUFBSSxJQUFJLFFBQVEsRUFBRTtnQkFDeEIsSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3hCLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUEsS0FBSzthQUNsQztZQUNELE9BQU87aUJBQ0YsSUFBRyxPQUFPLElBQUksSUFBSSxRQUFRLElBQUksSUFBSSxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksSUFBSSxlQUFlLEVBQUU7Z0JBQzdGLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO2FBQ3ZCO2lCQUNJLElBQUcsT0FBTyxJQUFJLElBQUksUUFBUSxFQUFFO2dCQUM3QixNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFBLEtBQUs7YUFDakM7U0FDSjtRQUNELElBQUksQ0FBQyxTQUFTLEdBQUcsTUFB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