
/**
 * 数据model的基础类
 * 构造函数可以接受DB查出的result
 * 属性跟DB中的字段规定为  加前缀F
 * 例如：属性名为firsName 会自动映射到_dbData中的Ffirst_name字段
 * 以下划线为开头的属性名不会做映射
 */
class BaseModel {
    /**
     * 表字段跟对象属性的映射
     * 格式：{property: field}
     * @property _fieldMap
     * @type Map
     */
    public _fieldMap: object = {};

    /**
     * DB原始数据对象
     * @property _dbData
     * @type Object
     */
    public _dbData: object; 

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
        this._fieldMap = Object.assign({}, map);

        //所有model采用代理方法，从DB中取值
        return new Proxy(this, {
            get: function (target, key, receiver) {                
                if(typeof key == 'string' && !key.startsWith('_')) {
                    let pros = target.getPropertyNames();
                    if(pros.includes(key)) return target.getValue(key);
                }
                return Reflect.get(target, key, receiver);
            },
            set: function (target, key, value, receiver) {                
                if(typeof key == 'string' && !key.startsWith('_')) {
                    let pros = target.getPropertyNames();
                    if(pros.includes(key)) {
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
     public getValue(name: string): string {
        let field = this.getFieldName(name);
        return this._dbData[field];
     }
     /**
      * 把数据写到DB原对象中
      * @method getValue
      * @param {string} name 属性名 
      * @param {any} value 设置值
      */
     public setValue(name: string, value: any): void {
        let field = this.getFieldName(name);
        this._dbData[field] = value;
     }

     /**
      * 根据属性名得到对应的表字段名，这里规定死为属性名前加一个F为字段名
      * 并把大写字母转为_小写
      * @method getFieldName
      * @param {String} name 属性名
      */
     public getFieldName(name: string): string {
         
         //映射是 field: property
         //如果从映射中找到，则直接返回即可         
         if(this._fieldMap[name]) return this._fieldMap[name];
         let field = '';
         //当不是以F开头时，认为属性名，则需要转为字段名
         if(!/^F/.test(name)) {
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
     static toArray(data: Array<object|string|BaseModel>): Array<any> {
        if(!data || !data.length) return [];
        
        return Array.from(data, d => new this(d));
     }

     /**
      * 表名修饰符
      * @param {String} name 表名
      */
     static Table(name: string) {
         return (target: any) => {
            target.TableName = name;
             return target;
         }
     }
     /**
      * 表字段修饰符
      * @param {String} field 字段名
      */
     static TableField(field: string) {
         return (target: any, name: string, descriptor: object) => {
            
            Object.assign(target, {
                field: field
            })
             target.fieldMap = target.fieldMap || new Map<string, string>();
             target.fieldMap.set(name, field);
             return descriptor;
         }
     } 
     
     /**
      * 获取所有属性名，包括子和父类
      */
     getPropertyNames(): Array<string> {
        let proto = Object.getPrototypeOf(this);
        let names = Object.getOwnPropertyNames(this);
        while(proto) {
            let tmp = Object.getOwnPropertyNames(proto);
            //过滤掉不可读和函数属性
            tmp.forEach(k => {
                let desc = Object.getOwnPropertyDescriptor(proto, k);
                let hasGetter = desc && typeof desc.get === 'function';
                if(hasGetter && names.indexOf(k) === -1) {                    
                    names.push(k);
                }
            });
            //如果已到基类 BaseModel 则不再往上找
            if(proto.constructor == BaseModel) break;
            proto = proto.__proto__;            
        }

        return names;
     }

     /**
      * 转为json
      * @method toJSON
      * @returns object
      */
     public toJSON(): object {
        let jsonObj = {}; 
        
        let pros = this.getPropertyNames();
        for (let key of pros) {
            jsonObj[key] = this[key];
        }
        return jsonObj;
     }
 }

export default BaseModel;