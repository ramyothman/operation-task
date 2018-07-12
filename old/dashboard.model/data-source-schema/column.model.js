"use strict";
exports.__esModule = true;
var column_data_type_model_1 = require("./column-data-type.model");
var Column = /** @class */ (function () {
    function Column() {
    }
    Column.cloneList = function (model) {
        var cList = [];
        if (model == null || model.length == 0)
            return cList;
        for (var i = 0; i < model.length; i++) {
            cList.push(Column.clone(model[i]));
        }
        return cList;
    };
    Column.clone = function (model) {
        var c = new Column();
        if (model == null)
            return c;
        c.AllowNull = model.AllowNull;
        c.ColumnDataType = column_data_type_model_1.ColumnDataType.clone(model.ColumnDataType);
        c.ColumnFullName = model.ColumnFullName;
        c.ColumnId = model.ColumnId;
        c.Id = model.Id;
        c.IsComputed = model.IsComputed;
        c.IsForeign = model.IsForeign;
        c.IsIdentity = model.IsIdentity;
        c.IsPrimary = model.IsPrimary;
        c.IsSelected = model.IsSelected;
        c.Name = model.Name;
        return c;
    };
    return Column;
}());
exports.Column = Column;
