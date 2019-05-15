
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

        this.$dbData = {};

        //所有model采用代理方法，从DB中取值
        let obj = modelHelper.createModelProxy(this);

        if(data) {
            if(typeof data == 'string') {
                data = JSON.parse(data);
            }
            //DB原数据
            if(typeof data == 'object' && data.constructor && data.constructor.name == 'RowDataPacket') {
                this.$dbData = data;
            }
            else if(typeof data == 'object') {
                modelHelper.copyProperty(obj, data);//浅拷贝
            }            
        }        
        this.$fieldMap = Object.assign(this.$fieldMap||{}, map);       
        
        return obj;
     } 

    /**
     * DB原始数据对象
     * @property $dbData
     * @type Object
     */
    public $dbData: object; 

    /**
     * 当前对应表的唯一健
     * @property $primaryKeys
     * @type Array<string>
     */
    public get $primaryKeys(): Array<string> {
        let proto = Object.getPrototypeOf(this);
        return proto[PrimaryKeyId];
    }
    public set $primaryKeys(value: Array<string>) {
        let proto = Object.getPrototypeOf(this);
        proto[PrimaryKeyId] = value;
    }
    /**
     * 当前对应表的唯一健
     * @static
     * @property $primaryKeys
     * @type Array<string>
     */
    public static get $primaryKeys(): Array<string> {
        return this.prototype[PrimaryKeyId];
    }
    public static set $primaryKeys(value) {
        this.prototype[PrimaryKeyId] = value;
    }

    /**
     * 对应的表名
     * @property $tableName
     * @type string
     */
    public get $tableName(): string {
        let proto = Object.getPrototypeOf(this);
        return proto[TableNameId];
    }
    public set $tableName(value: string) {
        let proto = Object.getPrototypeOf(this);
        proto[TableNameId] = value;
    }
    /**
     * 对应的表名
     * @static
     * @property tableName
     * @type string
     */
    public static get $tableName(): string {
        return this.prototype[TableNameId];
    }
    public static set $tableName(value) {
        this.prototype[TableNameId] = value;
    }

    /**
     * 表字段跟对象属性的映射
     * 格式：{property: field}
     * @property $fieldMap
     * @type Map
     */
    public get $fieldMap(): object {
        let proto = Object.getPrototypeOf(this);
        return proto[TableFieldMapId];
    }
    public set $fieldMap(value: object) {
        let proto = Object.getPrototypeOf(this);
        proto[TableFieldMapId] = value;
    }
    /**
     * 表字段跟对象属性的映射
     * 格式：{property: field}
     * @property $fieldMap
     * @type Map
     */
    public static get $fieldMap(): object {
        return this.prototype[TableFieldMapId];
    }
    public static set $fieldMap(value: object) {
        this.prototype[TableFieldMapId] = value;
    }     

     /**
      * 从DB数据源中读取属性值
      * @method getValue
      * @param {string} name 属性名，也可以是在DB中的字段名
      */
     public getValue(name: string, receiver?: any): any {
        if(!this.$dbData) return null;
        let field = this.getFieldName(name);
        if(field) return this.$dbData[field];
        else {
            return receiver && Reflect.get(this, name, receiver||this);
        }
     }
     /**
      * 把数据写到DB原对象中
      * @method getValue
      * @param {string} name 属性名 
      * @param {any} value 设置值
      */
     public setValue(name: string, value: any, receiver?: any): boolean {
        if(this.$dbData) {
            let field = this.getFieldName(name);
            if(field) {
                this.$dbData[field] = value;
                return true;
            }
        }
        return Reflect.set(this, name, value, receiver||this);        
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
     public static getFieldName(name: string): string {
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
      * 把原始数据组转为当前model数组
      * @param {Array} data 原始数据数组
      * @static
      * @returns {Array<any>}
      */
     public static toArray(data: Array<any>): Array<any> {
        return modelHelper.toArray(data, this);
     }

     /**
      * 表名装饰器
      * @param {String} name 表名
      * @param {Array<string>}[optional] 要吧指定表的唯一健,可以是属性名或字段名
      */
     static Table(name: string, primaryKeys?: Array<string>) {
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
     * @param {Boolean}[optional] isPrimary 是否为主健，不设置则不处理
     */
    static TableField(field: string, isPrimary?: boolean) {
        return (target: any, name: string): any => {
            if(!target[TableFieldMapId]) {
                target[TableFieldMapId] = {};
            }
            target[TableFieldMapId][name] = field;
            //设定为主健
            if(isPrimary === true) {
                this.TablePrimaryKey()(target, name);
            }
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