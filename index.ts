/// <reference path="./typings/index.d.ts" />

import base from "./model/base";
import dbhelper from "./helper/dbHelper";
import modelhelper from "./helper/modelHelper";

export const BaseModel = base;
export const DBHelper = dbhelper;
export const ModelHelper = modelhelper;

export default {
    BaseModel,
    DBHelper,
    ModelHelper
};