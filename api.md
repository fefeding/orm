## Classes

<dl>
<dt><a href="#DBHelper">DBHelper</a></dt>
<dd><p>提供DB操作基础库
支持分页等功能</p>
</dd>
<dt><a href="#ModelHelper">ModelHelper</a></dt>
<dd><p>TS 反射的一些封装</p>
</dd>
<dt><a href="#BaseModel">BaseModel</a></dt>
<dd><p>数据model的基础类
构造函数可以接受DB查出的result
属性跟DB中的字段规定为  加前缀F
例如：属性名为firsName 会自动映射到_dbData中的Ffirst_name字段
以下划线为开头的属性名不会做映射
注： 所有需要支持json序列化的，请定义时指定默认值。如： firstName: string = &quot;&quot;;</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#toJSON">toJSON(target, filter)</a> ⇒</dt>
<dd><p>转为json</p>
</dd>
<dt><a href="#getValue">getValue(name)</a></dt>
<dd><p>从DB数据源中读取属性值</p>
</dd>
<dt><a href="#getValue">getValue(name, value)</a></dt>
<dd><p>把数据写到DB原对象中</p>
</dd>
<dt><a href="#getFieldName">getFieldName(name)</a></dt>
<dd><p>根据属性名得到对应的表字段名，这里规定死为属性名前加一个F为字段名
并把大写字母转为<em>小写
如果传入了</em>或$开头的名称，则返回空</p>
</dd>
<dt><a href="#toJSON">toJSON()</a> ⇒</dt>
<dd><p>转为json</p>
</dd>
<dt><a href="#toString">toString()</a> ⇒</dt>
<dd><p>转为json串</p>
</dd>
</dl>

<a name="DBHelper"></a>

## DBHelper
提供DB操作基础库支持分页等功能

**Kind**: global class  

* [DBHelper](#DBHelper)
    * [new DBHelper(db)](#new_DBHelper_new)
    * _instance_
        * [.query(pars, [optional])](#DBHelper+query) ⇒ <code>IDBResult</code>
        * [.execute(pars)](#DBHelper+execute) ⇒ <code>any</code>
        * [.queryStringWhere(pars)](#DBHelper+queryStringWhere)
        * [.get(pars)](#DBHelper+get)
        * [.select(pars, type)](#DBHelper+select)
        * [.count(pars, type[optional)](#DBHelper+count)
        * [.queryPage(pars, type)](#DBHelper+queryPage)
        * [.update(pars, table, db)](#DBHelper+update)
        * [.delete(pars, table, db)](#DBHelper+delete)
        * [.insert(data, table, db)](#DBHelper+insert) ⇒ <code>IDBExecuteResult</code>
        * [.executeSql(sql, params, db)](#DBHelper+executeSql)
    * _static_
        * [.apply(target)](#DBHelper.apply)

<a name="new_DBHelper_new"></a>

### new DBHelper(db)
生成DB实例


| Param | Type | Description |
| --- | --- | --- |
| db | <code>Mysql</code> | DB操作对象，mysql的connection或 eggjs的 |

<a name="DBHelper+query"></a>

### dbHelper.query(pars, [optional]) ⇒ <code>IDBResult</code>
使用query，可用来查询或SQL执行

**Kind**: instance method of [<code>DBHelper</code>](#DBHelper)  

| Param | Type | Description |
| --- | --- | --- |
| pars | <code>IDBQueryParam</code> | 执行参数， 1. 如果有sql属性，则只有sql和params有效。params为sql中的?参数, 例如  `{"sql": "select * from table where id=? and title like ?", params: [1, '%abc%']}` 2. 如果有where且为string， 则会拼接sql执行 where 会拼到sql的where关健词后面。如：`{table: 'table1', where: 'id=? or title=?', columns: 'id,title',orders: [['time', 'desc']]}`      结果会拼成: `select id, title from table1 where id=? or title=? order by time desc` 3. 如果where为object， 则会直接调用db的select |
| [optional] | [<code>BaseModel</code>](#BaseModel) | 可选参数，如果指定了具体的model类，则会实例化成model的数组对象返回 |

<a name="DBHelper+execute"></a>

### dbHelper.execute(pars) ⇒ <code>any</code>
执行SQL

**Kind**: instance method of [<code>DBHelper</code>](#DBHelper)  
**Returns**: <code>any</code> - 受影响的行数  

| Param | Type | Description |
| --- | --- | --- |
| pars | <code>IDBSqlParam</code> | SQL和执行参数。如：{sql: 'update table set title=? where id=?', params: ['title1', 1]} |

<a name="DBHelper+queryStringWhere"></a>

### dbHelper.queryStringWhere(pars)
执行有where并且为字符串的情况此函数不支持属性名到字段的映射，调用前自已处理

**Kind**: instance method of [<code>DBHelper</code>](#DBHelper)  

| Param | Type |
| --- | --- |
| pars | <code>IDBQueryParam</code> | 

<a name="DBHelper+get"></a>

### dbHelper.get(pars)
获取单个数据

**Kind**: instance method of [<code>DBHelper</code>](#DBHelper)  

| Param | Type | Description |
| --- | --- | --- |
| pars | <code>IDBQueryParam</code> | 获取单条数据接口，{table:'table1', where: {id:1}} |

<a name="DBHelper+select"></a>

### dbHelper.select(pars, type)
当where为object时，采用select直接查

**Kind**: instance method of [<code>DBHelper</code>](#DBHelper)  

| Param | Type | Description |
| --- | --- | --- |
| pars | <code>IDBQueryParam</code> | select参数，where为object情况 |
| type | [<code>BaseModel</code>](#BaseModel) \| <code>type</code> | 指定model类或实例 |

<a name="DBHelper+count"></a>

### dbHelper.count(pars, type[optional)
查询符合条件的数据条数

**Kind**: instance method of [<code>DBHelper</code>](#DBHelper)  

| Param | Description |
| --- | --- |
| pars | 参数参照query方法 |
| type[optional | 类型 |

<a name="DBHelper+queryPage"></a>

### dbHelper.queryPage(pars, type)
分页查询

**Kind**: instance method of [<code>DBHelper</code>](#DBHelper)  

| Param | Type | Description |
| --- | --- | --- |
| pars | <code>IDBPagingQueryParam</code> | 分页查询条件和参数， |
| type |  | 数据对应的model |

<a name="DBHelper+update"></a>

### dbHelper.update(pars, table, db)
更新数据指定table 和 where 即可。如：{table: 'table1', where: {id:1}}

**Kind**: instance method of [<code>DBHelper</code>](#DBHelper)  

| Param | Type | Description |
| --- | --- | --- |
| pars | [<code>BaseModel</code>](#BaseModel) \| <code>IDBOperationParam</code> | 需要更新model对象，或操作指定 |
| table | <code>String</code> | [optinal] 表名，如果不指定则从pars中读 |
| db | <code>any</code> | [optional] 当前DB连接，不指定则用当前实例DB |

<a name="DBHelper+delete"></a>

### dbHelper.delete(pars, table, db)
删除数据指定table 和 where 即可。如：{table: 'table1', where: {id:1}}

**Kind**: instance method of [<code>DBHelper</code>](#DBHelper)  

| Param | Type | Description |
| --- | --- | --- |
| pars | [<code>BaseModel</code>](#BaseModel) \| <code>IDBOperationParam</code> | 需要更新model对象，或操作指定 |
| table | <code>String</code> | [optinal] 表名，如果不指定则从pars中读 |
| db | <code>any</code> | [optional] 当前DB连接，不指定则用当前实例DB |

<a name="DBHelper+insert"></a>

### dbHelper.insert(data, table, db) ⇒ <code>IDBExecuteResult</code>
往DB里插入一个model对象

**Kind**: instance method of [<code>DBHelper</code>](#DBHelper)  
**Returns**: <code>IDBExecuteResult</code> - 格式{fieldCount: 0,affectedRows: 1,insertId: 6,serverStatus: 2,warningCount: 0,message: '',protocol41: true,changedRows: 0 }  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| data | [<code>BaseModel</code>](#BaseModel) \| <code>IDBOperationParam</code> |  | 新增的数据model或操作选项 |
| table | <code>string</code> |  | 表名 |
| db | <code>MySql.Connection</code> | <code></code> | [optional] DB连接 |

<a name="DBHelper+executeSql"></a>

### dbHelper.executeSql(sql, params, db)
执行sql

**Kind**: instance method of [<code>DBHelper</code>](#DBHelper)  

| Param | Default | Description |
| --- | --- | --- |
| sql |  | 要执行的SQL 例如sql="select * from id=?" |
| params |  | SQL中的参数，例如[1] |
| db | <code></code> | DB连接 |

<a name="DBHelper.apply"></a>

### DBHelper.apply(target)
给对象混入db操作实例接口

**Kind**: static method of [<code>DBHelper</code>](#DBHelper)  

| Param | Type | Description |
| --- | --- | --- |
| target | <code>class</code> \| <code>object</code> | 需要混入DBHelper的实例 |

<a name="ModelHelper"></a>

## ModelHelper
TS 反射的一些封装

**Kind**: global class  

* [ModelHelper](#ModelHelper)
    * [.getPropertyNames(target)](#ModelHelper.getPropertyNames) ⇒ <code>Array.&lt;string&gt;</code>
    * [.toArray(data)](#ModelHelper.toArray) ⇒ <code>Array.&lt;Model&gt;</code>
    * [.getFieldName(name, type)](#ModelHelper.getFieldName)
    * [.convertFields(columns)](#ModelHelper.convertFields)
    * [.getPrimaryKeysWhere(target)](#ModelHelper.getPrimaryKeysWhere)
    * [.createSqlWhere(obj, type)](#ModelHelper.createSqlWhere)
    * [.objectToFieldValues(obj, type)](#ModelHelper.objectToFieldValues)
    * [.createModelProxy(target)](#ModelHelper.createModelProxy)
    * [.copyProperty(target, source)](#ModelHelper.copyProperty)

<a name="ModelHelper.getPropertyNames"></a>

### ModelHelper.getPropertyNames(target) ⇒ <code>Array.&lt;string&gt;</code>
获取对象的属性名称集合如果继承自 BaseModel ，则到BaseModel后不会再往上查找

**Kind**: static method of [<code>ModelHelper</code>](#ModelHelper)  
**Returns**: <code>Array.&lt;string&gt;</code> - 属性名称数组  

| Param | Type | Description |
| --- | --- | --- |
| target | <code>class</code> | 需要获取属性的实例 |

<a name="ModelHelper.toArray"></a>

### ModelHelper.toArray(data) ⇒ <code>Array.&lt;Model&gt;</code>
把原始数据组转为当前model数组

**Kind**: static method of [<code>ModelHelper</code>](#ModelHelper)  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Array</code> | 原始数据数组 |

<a name="ModelHelper.getFieldName"></a>

### ModelHelper.getFieldName(name, type)
获取model类型中属性对应的表字段名根据属性名得到对应的表字段名，这里规定死为属性名前加一个F为字段名并把大写字母转为_小写如果传入了_或$开头的名称，则返回空

**Kind**: static method of [<code>ModelHelper</code>](#ModelHelper)  

| Param | Description |
| --- | --- |
| name | model中的属性名 |
| type | model的class类 |

<a name="ModelHelper.convertFields"></a>

### ModelHelper.convertFields(columns)
把属性集合转为字段集合

**Kind**: static method of [<code>ModelHelper</code>](#ModelHelper)  

| Param | Description |
| --- | --- |
| columns | 属性的集合 |

<a name="ModelHelper.getPrimaryKeysWhere"></a>

### ModelHelper.getPrimaryKeysWhere(target)
获取model中的主健和其值

**Kind**: static method of [<code>ModelHelper</code>](#ModelHelper)  

| Param | Description |
| --- | --- |
| target | model实例 |

<a name="ModelHelper.createSqlWhere"></a>

### ModelHelper.createSqlWhere(obj, type)
生成SQL参数语句默认会返回{
            where: "",
            params: new Array<any>()
        };

**Kind**: static method of [<code>ModelHelper</code>](#ModelHelper)  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>object</code> | sql条件参数 |
| type | [<code>BaseModel</code>](#BaseModel) \| <code>class</code> | 指定类型，如果不指定则字段按属性名，指定了就会去取映射的字段名 |

<a name="ModelHelper.objectToFieldValues"></a>

### ModelHelper.objectToFieldValues(obj, type)
把原数据对象转为映射为表字段的对象例如: {id:1} 转为 {Fid:1}

**Kind**: static method of [<code>ModelHelper</code>](#ModelHelper)  

| Param | Type | Description |
| --- | --- | --- |
| obj | <code>object</code> | 原值对象 |
| type | <code>class</code> \| [<code>BaseModel</code>](#BaseModel) | 对应的model类 |

<a name="ModelHelper.createModelProxy"></a>

### ModelHelper.createModelProxy(target)
生成model的代理对象，拦截其属性的访问

**Kind**: static method of [<code>ModelHelper</code>](#ModelHelper)  

| Param | Description |
| --- | --- |
| target | model实例 |

<a name="ModelHelper.copyProperty"></a>

### ModelHelper.copyProperty(target, source)
复制属性到model实例

**Kind**: static method of [<code>ModelHelper</code>](#ModelHelper)  

| Param | Description |
| --- | --- |
| target | 需要修改属性的model实例 |
| source | 用来修改model的object |

<a name="BaseModel"></a>

## BaseModel
数据model的基础类构造函数可以接受DB查出的result属性跟DB中的字段规定为  加前缀F例如：属性名为firsName 会自动映射到_dbData中的Ffirst_name字段以下划线为开头的属性名不会做映射注： 所有需要支持json序列化的，请定义时指定默认值。如： firstName: string = "";

**Kind**: global class  

* [BaseModel](#BaseModel)
    * [new BaseModel(data, map)](#new_BaseModel_new)
    * _instance_
        * [.$primaryKeys](#BaseModel+$primaryKeys) : <code>Array.&lt;string&gt;</code>
        * [.$tableName](#BaseModel+$tableName) : <code>string</code>
        * [.$fieldMap](#BaseModel+$fieldMap) : <code>Map</code>
    * _static_
        * [.$primaryKeys](#BaseModel.$primaryKeys) : <code>Array.&lt;string&gt;</code>
        * [.$tableName](#BaseModel.$tableName) : <code>string</code>
        * [.$fieldMap](#BaseModel.$fieldMap) : <code>Map</code>
        * [.toArray(data)](#BaseModel.toArray) ⇒ <code>Array.&lt;any&gt;</code>
        * [.Table(name, [optional])](#BaseModel.Table)
        * [.TableField(field, [optional])](#BaseModel.TableField)
        * [.TablePrimaryKey()](#BaseModel.TablePrimaryKey)

<a name="new_BaseModel_new"></a>

### new BaseModel(data, map)
根据参数实例化当前类


| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object/String</code> | 如果传入object会当做DB表数据来映射，如果是model对象，则进行浅拷贝。如果是字符串只进行json转换 |
| map | <code>Object</code> | 字段跟属性的映射，一般不需要指定，除非需要特殊  格式：{property: field} |

<a name="BaseModel+$primaryKeys"></a>

### baseModel.$primaryKeys : <code>Array.&lt;string&gt;</code>
当前对应表的唯一健

**Kind**: instance property of [<code>BaseModel</code>](#BaseModel)  
**Properties**

| Name |
| --- |
| $primaryKeys | 

<a name="BaseModel+$tableName"></a>

### baseModel.$tableName : <code>string</code>
对应的表名

**Kind**: instance property of [<code>BaseModel</code>](#BaseModel)  
**Properties**

| Name |
| --- |
| $tableName | 

<a name="BaseModel+$fieldMap"></a>

### baseModel.$fieldMap : <code>Map</code>
表字段跟对象属性的映射格式：{property: field}

**Kind**: instance property of [<code>BaseModel</code>](#BaseModel)  
**Properties**

| Name |
| --- |
| $fieldMap | 

<a name="BaseModel.$primaryKeys"></a>

### BaseModel.$primaryKeys : <code>Array.&lt;string&gt;</code>
当前对应表的唯一健

**Kind**: static property of [<code>BaseModel</code>](#BaseModel)  
**Properties**

| Name |
| --- |
| $primaryKeys | 

<a name="BaseModel.$tableName"></a>

### BaseModel.$tableName : <code>string</code>
对应的表名

**Kind**: static property of [<code>BaseModel</code>](#BaseModel)  
**Properties**

| Name |
| --- |
| tableName | 

<a name="BaseModel.$fieldMap"></a>

### BaseModel.$fieldMap : <code>Map</code>
表字段跟对象属性的映射格式：{property: field}

**Kind**: static property of [<code>BaseModel</code>](#BaseModel)  
**Properties**

| Name |
| --- |
| $fieldMap | 

<a name="BaseModel.toArray"></a>

### BaseModel.toArray(data) ⇒ <code>Array.&lt;any&gt;</code>
把原始数据组转为当前model数组

**Kind**: static method of [<code>BaseModel</code>](#BaseModel)  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Array</code> | 原始数据数组 |

<a name="BaseModel.Table"></a>

### BaseModel.Table(name, [optional])
表名装饰器

**Kind**: static method of [<code>BaseModel</code>](#BaseModel)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | 表名 |
| [optional] | <code>Array.&lt;string&gt;</code> | 要吧指定表的唯一健,可以是属性名或字段名 |

<a name="BaseModel.TableField"></a>

### BaseModel.TableField(field, [optional])
表字段装饰器

**Kind**: static method of [<code>BaseModel</code>](#BaseModel)  

| Param | Type | Description |
| --- | --- | --- |
| field | <code>String</code> | 字段名 |
| [optional] | <code>Boolean</code> | isPrimary 是否为主健，不设置则不处理 |

<a name="BaseModel.TablePrimaryKey"></a>

### BaseModel.TablePrimaryKey()
表唯一健装饰器可以用到属性上"experimentalDecorators": true,

**Kind**: static method of [<code>BaseModel</code>](#BaseModel)  
<a name="toJSON"></a>

## toJSON(target, filter) ⇒
转为json

**Kind**: global function  
**Returns**: object  

| Param | Type | Description |
| --- | --- | --- |
| target | <code>class</code> | 需要转为json的实例 |
| filter | <code>function</code> | 需要对属性过滤的函数，返回false则不处理此属性 |

<a name="getValue"></a>

## getValue(name)
从DB数据源中读取属性值

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | 属性名，也可以是在DB中的字段名 |

<a name="getValue"></a>

## getValue(name, value)
把数据写到DB原对象中

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | 属性名 |
| value | <code>any</code> | 设置值 |

<a name="getFieldName"></a>

## getFieldName(name)
根据属性名得到对应的表字段名，这里规定死为属性名前加一个F为字段名并把大写字母转为_小写如果传入了_或$开头的名称，则返回空

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | 属性名 |

<a name="toJSON"></a>

## toJSON() ⇒
转为json

**Kind**: global function  
**Returns**: object  
<a name="toString"></a>

## toString() ⇒
转为json串

**Kind**: global function  
**Returns**: string  
