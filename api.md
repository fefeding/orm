## Classes

<dl>
<dt><a href="#DBHelper">DBHelper</a></dt>
<dd><p>提供DB操作基础库
支持分页等功能</p>
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
<dt><a href="#getValue">getValue(name)</a></dt>
<dd><p>从DB数据源中读取属性值</p>
</dd>
<dt><a href="#getValue">getValue(name, value)</a></dt>
<dd><p>把数据写到DB原对象中</p>
</dd>
<dt><a href="#getFieldName">getFieldName(name)</a></dt>
<dd><p>根据属性名得到对应的表字段名，这里规定死为属性名前加一个F为字段名
并把大写字母转为_小写</p>
</dd>
<dt><a href="#toJSON">toJSON()</a> ⇒</dt>
<dd><p>转为json</p>
</dd>
</dl>

<a name="DBHelper"></a>

## DBHelper
提供DB操作基础库支持分页等功能

**Kind**: global class  

* [DBHelper](#DBHelper)
    * [.query(pars)](#DBHelper.query) ⇒ <code>IDBResult</code>
    * [.queryStringWhere(pars)](#DBHelper.queryStringWhere)
    * [.select(pars)](#DBHelper.select)
    * [.insert(pars)](#DBHelper.insert)
    * [.update(pars)](#DBHelper.update)
    * [.delete(pars)](#DBHelper.delete)

<a name="DBHelper.query"></a>

### DBHelper.query(pars) ⇒ <code>IDBResult</code>
使用query，可用来查询或SQL执行

**Kind**: static method of [<code>DBHelper</code>](#DBHelper)  

| Param | Type | Description |
| --- | --- | --- |
| pars | <code>IDBQueryParam</code> | 执行参数， 1. 如果有sql属性，则只有sql和params有效。params为sql中的?参数, 例如  `{"sql": "select * from table where id=? and title like ?", params: [1, '%abc%']}` 2. 如果有where且为string， 则会拼接sql执行 where 会拼到sql的where关健词后面。如：`{table: 'table1', where: 'id=? or title=?', columns: 'id,title',orders: [['time', 'desc']]}`      结果会拼成: `select id, title from table1 where id=? or title=? order by time desc` 3. 如果where为object， 则会直接调用db的select |

<a name="DBHelper.queryStringWhere"></a>

### DBHelper.queryStringWhere(pars)
执行有where并且为字符串的情况

**Kind**: static method of [<code>DBHelper</code>](#DBHelper)  

| Param |
| --- |
| pars | 

<a name="DBHelper.select"></a>

### DBHelper.select(pars)
当where为object时，采用select直接查

**Kind**: static method of [<code>DBHelper</code>](#DBHelper)  

| Param | Description |
| --- | --- |
| pars | select参数，where为object情况 |

<a name="DBHelper.insert"></a>

### DBHelper.insert(pars)
新增

**Kind**: static method of [<code>DBHelper</code>](#DBHelper)  

| Param |
| --- |
| pars | 

<a name="DBHelper.update"></a>

### DBHelper.update(pars)
更新数据指定table 和 where 即可。如：{table: 'table1', where: {id:1}}

**Kind**: static method of [<code>DBHelper</code>](#DBHelper)  

| Param |
| --- |
| pars | 

<a name="DBHelper.delete"></a>

### DBHelper.delete(pars)
删除数据指定table 和 where 即可。如：{table: 'table1', where: {id:1}}

**Kind**: static method of [<code>DBHelper</code>](#DBHelper)  

| Param |
| --- |
| pars | 

<a name="BaseModel"></a>

## BaseModel
数据model的基础类构造函数可以接受DB查出的result属性跟DB中的字段规定为  加前缀F例如：属性名为firsName 会自动映射到_dbData中的Ffirst_name字段以下划线为开头的属性名不会做映射注： 所有需要支持json序列化的，请定义时指定默认值。如： firstName: string = "";

**Kind**: global class  

* [BaseModel](#BaseModel)
    * [new BaseModel(data, map)](#new_BaseModel_new)
    * _instance_
        * [._fieldMap](#BaseModel+_fieldMap) : <code>Map</code>
        * [.getPropertyNames()](#BaseModel+getPropertyNames)
    * _static_
        * [.toArray(data)](#BaseModel.toArray) ⇒ <code>Array.&lt;Model&gt;</code>
        * [.Table(name)](#BaseModel.Table)
        * [.TableField(field)](#BaseModel.TableField)

<a name="new_BaseModel_new"></a>

### new BaseModel(data, map)
根据参数实例化当前类


| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object/String</code> | 如果传入object会当做DB表数据来映射，如果是model对象，则进行浅拷贝。如果是字符串只进行json转换 |
| map | <code>Object</code> | 字段跟属性的映射，一般不需要指定，除非需要特殊  格式：{property: field} |

<a name="BaseModel+_fieldMap"></a>

### baseModel.\_fieldMap : <code>Map</code>
表字段跟对象属性的映射格式：{property: field}

**Kind**: instance property of [<code>BaseModel</code>](#BaseModel)  
**Properties**

| Name |
| --- |
| _fieldMap | 

<a name="BaseModel+getPropertyNames"></a>

### baseModel.getPropertyNames()
获取所有属性名，包括子和父类

**Kind**: instance method of [<code>BaseModel</code>](#BaseModel)  
<a name="BaseModel.toArray"></a>

### BaseModel.toArray(data) ⇒ <code>Array.&lt;Model&gt;</code>
把原始数据组转为当前model数组

**Kind**: static method of [<code>BaseModel</code>](#BaseModel)  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Array</code> | 原始数据数组 |

<a name="BaseModel.Table"></a>

### BaseModel.Table(name)
表名修饰符

**Kind**: static method of [<code>BaseModel</code>](#BaseModel)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | 表名 |

<a name="BaseModel.TableField"></a>

### BaseModel.TableField(field)
表字段修饰符

**Kind**: static method of [<code>BaseModel</code>](#BaseModel)  

| Param | Type | Description |
| --- | --- | --- |
| field | <code>String</code> | 字段名 |

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
根据属性名得到对应的表字段名，这里规定死为属性名前加一个F为字段名并把大写字母转为_小写

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | 属性名 |

<a name="toJSON"></a>

## toJSON() ⇒
转为json

**Kind**: global function  
**Returns**: object  
