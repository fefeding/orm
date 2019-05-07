

/**
 * DB操作参数
 * 传递参数规范
 * table和uniqueKeys不传时，会默认采用DBService指定的默认值    
 * record有时也会用来当查询传值条件   
 */
declare interface IDBParam { 
    /**
     * 当前操作的表名
     */
    table?: string;
    /**
     * 操作DB原生接口
     */
    db?: {
        select: Function;
        query: Function;
        update: Function;
        insert: Function;
        delete: Function;
        get: Function;
        beginTransaction: Function;
        beginTransactionScope: Function;
        commit: Function;
        rollback: Function;        
    }|any
}

/**
 * 用sql语句查询
 */
declare interface IDBSqlParam extends IDBParam {
    sql?: string; //查询语句
    //对应语句中的?参数数组
    params?: Array<string | number>;
}

/**
 * 按where执行，where为字符串，最终会拼到sql语句的 where 关健词后面
 */
declare interface IDBWhereParam extends IDBParam {
    /**
     * 查询条件，可以是数组或object。
     * 如果是数组，则表示sql采用的是? 传参方式
     */
    where: string;   
    
    /**
     * 条件中的?对应的参数
     * 只有where为字符串，且条件中有?变量时才有意义
     */
    params: Array<string | number>;
}

/**
 * 查询类操作参数
 * 1. 当做查询操作时,可以指定sql和where进行，where可以为一个数组
 * 例如： {sql: "select * from table where id=? and title like ?", where: [2, '中文']}
 * 2. 查询也可以指定columns，table和where的方式。
 * 例如： {talbe: 'table1', columns: 'id, title', where: {id:1}} 表示查id=1的数据
 * 如果where为字符串，则会去用table,columns组合sql执行
 */
declare interface IDBQueryParam extends IDBSqlParam {       

    /**
     * 查询的列，默认为*
     */
    columns?: string|Array<string>;

    /**
     * 排序方式，在查询时需要
     * 一个字符串的二维数组
     * @type Array<Array<string>>
     */
    orders?: Array<Array<string>>;

    /**
     * 查询条件，可以是object或字符串。
     * 如果是字符串，则会拼到where关健词之后，并且可以通过params来指定其中的?参数值
     */
    where?: string | Map<string, string|number> | object | any;   
    
    /**
     * 条件中的?对应的参数
     * 只有where为字符串，且条件中有?变量时才有意义
     */
    params?: Array<string | number>;
    
    /**
     * 查询条数
     */
    limit?: number;

    /**
     * 查询起始索引
     */
    offset?: number;
}

/**
 * 分布查询传参
 * 
 */
declare interface IDBPagingQueryParam extends IDBQueryParam {
    /**
     * 查询时每页显示多少条记录
     * 默认为0 表示查所有
     */
    size: number;

    /**
     * 当前查的是第几页
     * 起始值为1
     */
    page: number;
}

/**
 * 操作DB更新参数
 * 1. 新增需要指定table,record。如果不指定主健或table，则会采用指定的DBService相应的属性默认值，record为新增记录的字段。   
 * 2. 修改与新增类似，只需多指定uniqueKeys为你要修改的哪条记录
 * 3. 删除只需指定uniqueKeys 和表名，表示要删除哪条
 * 例如： {talbe: 'table1', record: {id:1}, uniqueKeys: ['id']}
 */
declare interface IDBOperationParam extends IDBParam {
    /**
     * 主健集
     * 在更新和删除时需要
     * 例如: ['id']
     */
    uniqueKeys?: Array<string>;

    /**
     * 更新数据条件
     */
    where?: any;

    /**
     * 操作DB时，传的字段值 
     * 例如： {id: 1, name: "test"}
     */
    data: any;
}

/**
 * 操作DB返回数据
 */
declare interface IDBResult {
    //返回的数据
    data: any;
}

/**
 * 分页查询数据结果
 */
declare interface IDBPagingResult extends IDBResult {
    page: number; //当前第几页
    count: number; //总共符合条件的数据条数
    total: number; //总共符合条件的有多少页
}

/**
 * 执行语句返回值
 */
declare interface IDBExecuteResult extends IDBResult {    
    fieldCount: number;
    affectedRows: number;
    insertId: number;
    serverStatus: number;
    warningCount: number;
    message: string;
    protocol41: boolean;
    changedRows: number;     
}

/**
 * 提供DB操作基础库
 * 支持分页等功能
 */
declare interface IDBHelper {    

    /**
     * DB操作对象，
     * 可以是原生的mysql连接，或eggjs的
     */
    db: any;

    /**
     * 使用query，可用来查询或SQL执行
     * @param {IDBQueryParam} pars 执行参数， 
     * 1. 如果有sql属性，则只有sql和params有效。params为sql中的?参数, 例如  `{"sql": "select * from table where id=? and title like ?", params: [1, '%abc%']}`
     * 2. 如果有where且为string， 则会拼接sql执行 where 会拼到sql的where关健词后面。如：`{table: 'table1', where: 'id=? or title=?', columns: 'id,title',orders: [['time', 'desc']]}`
     *      结果会拼成: `select id, title from table1 where id=? or title=? order by time desc`
     * 3. 如果where为object， 则会直接调用db的select
     * @param {BaseModel} [optional] 可选参数，如果指定了具体的model类，则会实例化成model的数组对象返回
     * @returns {IDBResult}
     */
    async query(pars: IDBQueryParam, type?: { new(): BaseModel}|any): Promise<IDBResult>;

    /**
     * 执行SQL
     * @param pars {IDBSqlParam} SQL和执行参数。如：{sql: 'update table set title=? where id=?', params: ['title1', 1]}
     * @returns {any} 受影响的行数
     */
    async execute(pars: IDBSqlParam): Promise<any>;

    /**
     * 执行有where并且为字符串的情况
     * 此函数不支持属性名到字段的映射，调用前自已处理
     * @param pars {IDBQueryParam}
     */
    async queryStringWhere(pars: IDBQueryParam): Promise<any>;
    /**
     * 获取单个数据
     * @param pars {IDBQueryParam} 获取单条数据接口，{table:'table1', where: {id:1}}
     */
    async get(pars: IDBQueryParam, type?: { new(): BaseModel}|any): Promise<any>;

    /**
     * 当where为object时，采用select直接查
     * @param pars {IDBQueryParam} select参数，where为object情况
     * @param type {BaseModel|type} 指定model类或实例
     */
    async select(pars: IDBQueryParam, type: {new():BaseModel, _fieldMap: object;}|BaseModel): Promise<any>;

    /**
     * 更新数据
     * 指定table 和 where 即可。如：{table: 'table1', where: {id:1}}
     * @param pars {BaseModel|IDBOperationParam} 需要更新model对象，或操作指定
     * @param table {String}[optinal] 表名，如果不指定则从pars中读
     * @param db {any}[optional] 当前DB连接，不指定则用当前实例DB
     */
    async update(pars: IDBOperationParam|BaseModel, table?: string, db?: any): Promise<IDBExecuteResult>;

    /**
     * 删除数据
     * 指定table 和 where 即可。如：{table: 'table1', where: {id:1}}
     * @param pars {BaseModel|IDBOperationParam} 需要更新model对象，或操作指定
     * @param table {String}[optinal] 表名，如果不指定则从pars中读
     * @param db {any}[optional] 当前DB连接，不指定则用当前实例DB
     */
    async delete(pars: IDBOperationParam|BaseModel, table?: string, db?: any): Promise<IDBExecuteResult>;

    /**
     * 往DB里插入一个model对象
     * @param data {BaseModel|IDBOperationParam} 新增的数据model或操作选项
     * @param table {string} 表名
     * @param db {MySql.Connection}[optional] DB连接
     * @returns {IDBExecuteResult} 格式{fieldCount: 0,affectedRows: 1,insertId: 6,serverStatus: 2,warningCount: 0,message: '',protocol41: true,changedRows: 0 }
     */
    async insert(data: IDBOperationParam|BaseModel, table: string = "", db: any = null): Promise<any>;

    /**
     * 执行sql
     * @param sql 要执行的SQL 例如sql="select * from id=?"
     * @param params SQL中的参数，例如[1]
     * @param db DB连接
     */
    async executeSql(sql: string, params: any=[], db: any=null): Promise<any>;
}