
import modelHelper from "../helper/modelHelper";

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
class BaseModel implements IBaseModel {    
    /**
      * 根据参数实例化当前类
      * @param {Object/String} data 如果传入object会当做DB表数据来映射，如果是model对象，则进行浅拷贝。如果是字符串只进行json转换
      * @param {Object} map 字段跟属性的映射，一般不需要指定，除非需要特殊  格式：{property: field}
      */
     constructor(data: any = "", map = {}) {

        this._dbData = {};

        if(data) {
            if(typeof data == 'string') {
                data = JSON.parse(data);
                Object.assign(this, data);//浅拷贝
            }
            //DB原数据
            else if(typeof data == 'object' && data.constructor && data.constructor.name == 'RowDataPacket') {
                this._dbData = data;
            }
            else if(typeof data == 'object') {
                Object.assign(this, data);//浅拷贝
            }            
        }        
        this._fieldMap = Object.assign(this._fieldMap||{}, map);
        
        //所有model采用代理方法，从DB中取值
        return new Proxy<BaseModel>(this, {
            get: function (target, key, receiver) {                
                if(typeof key == 'string' && !key.startsWith('_') && !key.startsWith('$')) {
                    let pros = modelHelper.getPropertyNames(target);
                    if(pros.includes(key)) {
                        let v = target.getValue(key, receiver);
                        if(typeof v != 'undefined') return v;
                    }
                }
                return Reflect.get(target, key, receiver);
            },
            set: function (target, key, value, receiver) {                
                if(typeof key == 'string' && !key.startsWith('_') && !key.startsWith('$')) {
                    let pros = modelHelper.getPropertyNames(target);
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
     * DB原始数据对象
     * @property _dbData
     * @type Object
     */
    public _dbData: object; 

    /**
     * 当前对应表的唯一健
     * @property _primaryKeys
     * @type Array<string>
     */
    public get _primaryKeys(): Array<string> {
        let proto = Object.getPrototypeOf(this);
        return proto[PrimaryKeyId];
    }
    public set _primaryKeys(value: Array<string>) {
        let proto = Object.getPrototypeOf(this);
        proto[PrimaryKeyId] = value;
    }
    /**
     * 当前对应表的唯一健
     * @static
     * @property _primaryKeys
     * @type Array<string>
     */
    public static get _primaryKeys(): Array<string> {
        return this.prototype[PrimaryKeyId];
    }
    public static set _primaryKeys(value) {
        this.prototype[PrimaryKeyId] = value;
    }

    /**
     * 对应的表名
     * @property _tableName
     * @type string
     */
    public get _tableName(): string {
        let proto = Object.getPrototypeOf(this);
        return proto[TableNameId];
    }
    public set _tableName(value: string) {
        let proto = Object.getPrototypeOf(this);
        proto[TableNameId] = value;
    }
    /**
     * 对应的表名
     * @static
     * @property tableName
     * @type string
     */
    public static get _tableName(): string {
        return this.prototype[TableNameId];
    }
    public static set _tableName(value) {
        this.prototype[TableNameId] = value;
    }

    /**
     * 表字段跟对象属性的映射
     * 格式：{property: field}
     * @property _fieldMap
     * @type Map
     */
    public get _fieldMap(): object {
        let proto = Object.getPrototypeOf(this);
        return proto[TableFieldMapId];
    }
    public set _fieldMap(value: object) {
        let proto = Object.getPrototypeOf(this);
        proto[TableFieldMapId] = value;
    }
    /**
     * 表字段跟对象属性的映射
     * 格式：{property: field}
     * @property _fieldMap
     * @type Map
     */
    public static get _fieldMap(): object {
        return this.prototype[TableFieldMapId];
    }
    public static set _fieldMap(value: object) {
        this.prototype[TableFieldMapId] = value;
    }     

     /**
      * 从DB数据源中读取属性值
      * @method getValue
      * @param {string} name 属性名，也可以是在DB中的字段名
      */
     public getValue(name: string, receiver?: any): any {
        if(!this._dbData) return null;
        let field = this.getFieldName(name);
        if(field) return this._dbData[field];
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
     public setValue(name: string, value: any, receiver?: any): void {
        if(this._dbData) {
            let field = this.getFieldName(name);
            this._dbData[field] = value;
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
     public getFieldName(name: string): string {
        return modelHelper.getFieldName(name, this);
     }    

     /**
      * 转为json
      * @method toJSON
      * @returns object
      */
     public toJSON(): object {
        let jsonObj = modelHelper.toJSON(this, (k: string) => !k.startsWith('$')); 
        return jsonObj;
     }

     /**
      * 转为json串
      * @method toString
      * @returns string
      */
     public toString(): string {
        let obj = this.toJSON();
        return JSON.stringify(obj);
     }     

     /**
      * 表名装饰器
      * @param {String} name 表名
      * @param {Array<string>}[optional] 要吧指定表的唯一健,可以是属性名或字段名
      */
     static Table(name: string, primaryKeys: Array<string> = []) {
        return (constructor: Function) => {            
            constructor.prototype[TableNameId] = name;   
            if(primaryKeys && primaryKeys.length) {
                this.TablePrimaryKey()(constructor.prototype, primaryKeys);
            }         
        };  
    }
    /**
     * 表字段装饰器
     * @param {String} field 字段名
     */
    static TableField(field: string) {
        return (target: any, name: string): any => {
            if(!target[TableFieldMapId]) {
                target[TableFieldMapId] = {};
            }
            target[TableFieldMapId][name] = field;
        }
    } 

    /**
     * 表唯一健装饰器
     * 可以用到属性上
     * "experimentalDecorators": true,
     */
    static TablePrimaryKey() {
        return (target: any, name: string|Array<string>): any => {
            if(!target[PrimaryKeyId]) {
                target[PrimaryKeyId] = [];
            }
            if(Array.isArray(name)) {
                target[PrimaryKeyId] = target[PrimaryKeyId].concat(name);
            }
            else {
                let v = target[PrimaryKeyId];
                if(!v.includes(name)) v.push(name);
            }
        }        
    }
 }

export default BaseModel;
export {
    BaseModel
}