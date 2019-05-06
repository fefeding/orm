/// <reference path="./typings/index.d.ts" />

import model from "./model/base";
import dbhelper from "./helper/db";
import modelhelper from "./helper/modelHelper";

export const BaseModel = model;
export const DBHelper = dbhelper;
export const ModelHelper = modelhelper;

export default {
    BaseModel,
    DBHelper,
    ModelHelper
};