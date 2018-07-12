"use strict";
exports.__esModule = true;
var column_model_1 = require("./column.model");
var Table = /** @class */ (function () {
    function Table() {
        this.Data = null;
    }
    Table.clone = function (model) {
        var t = new Table();
        if (model == null)
            return t;
        t.Id = model.Id;
        t.Name = model.Name;
        t.NameSpace = model.Name;
        t.Schema = model.Schema;
        t.TableID = model.TableID;
        t.Columns = column_model_1.Column.cloneList(model.Columns);
        t.ConString = model.ConString;
        return t;
    };
    return Table;
}());
exports.Table = Table;
