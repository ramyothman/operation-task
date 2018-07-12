"use strict";
exports.__esModule = true;
var ColumnDataType = /** @class */ (function () {
    function ColumnDataType() {
    }
    ColumnDataType.clone = function (model) {
        var dt = new ColumnDataType();
        if (model == null)
            return dt;
        dt.CSharpType = model.CSharpType;
        dt.DotNetType = model.DotNetType;
        dt.JavaType = model.JavaType;
        dt.LanguageSpecificType = model.LanguageSpecificType;
        dt.SQLType = model.SQLType;
        dt.VBType = model.VBType;
        return dt;
    };
    return ColumnDataType;
}());
exports.ColumnDataType = ColumnDataType;
