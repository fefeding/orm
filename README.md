# ORM
[![Latest NPM release](https://img.shields.io/npm/v/@lct/orm.svg)](https://www.npmjs.com/package/@lct/orm)

## 介绍
本项目为基于`typescript`的一个ORM规范。对`Model`做一个约定，提供DB访问ORM接口。

## 快速上手
#### 安装
```javascript
npm install @lct/orm
```
#### 准备DB
创建表 `t_user`
```sql
CREATE TABLE `t_user` (
  `Fid` int(11) NOT NULL AUTO_INCREMENT,
  `Fname` varchar(64) DEFAULT NULL,
  `Fnick_name` varchar(64) DEFAULT NULL,
  `Fcreate_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`Fid`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8;
```
#### 定义Model
Model我们认为是跟表一一对应的类。
```javascript
import { BaseModel } from "@lct/orm";

@BaseModel.Table('t_user') //关联表t_user,
//@BaseModel.Table(tablename, ['id'])//可以从这里指定多个主健，也可以在属性中去指定
class MyModel extends BaseModel {  
    @BaseModel.TableField('Fid') //映射属性跟字段, 这里可以不指定这句，默认为关联上Fid
    @BaseModel.TablePrimaryKey() //指定当前属性为唯一健
    id: number = 0;
    @BaseModel.TableField('Fname')
    name: string = "";
    nickName: string = "";
    createTime: string = "";
}
```
#### 使用ORM操作DB
```javascript
import * as mysql from "mysql";
import { BaseModel, DBHelper } from "@lct/orm";
//本地测试数据库
//先准备好测试DB
const connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'jiamao',
    password : '123456',
    database : 'test',
    charset  : 'utf8'
  });

  //实例化DB操作
const db = new DBHelper(connection);
insert();

//新增一个user
async insert() {
    connection.connect();

    let m = new MyModel();
    m.name = "my name";
    m.nickName = "name";
    let ret = await db.insert(m); 
    console.log(ret);
    
    connection.end();
}
```