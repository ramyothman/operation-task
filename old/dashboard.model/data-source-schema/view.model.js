"use strict";
exports.__esModule = true;
var column_model_1 = require("./column.model");
var View = /** @class */ (function () {
    function View() {
        this.Data = null;
    }
    //get Data(): any {
    //    var errorMessage: string;
    //    if (this._Data != null)
    //        return this._Data;
    //    let e = new GetColumnPrameter();
    //    e.Connection = this.ConString
    //    e.Id = this.Id;
    //    e.Name = this.Name;
    //    e.ObjectID = this.ViewID;
    //    e.Schema = this.Schema;
    //    this.dataSourceService.getAllTableData(e)
    //        .subscribe(
    //        value => {
    //            this._Data = value
    //        },
    //        error => errorMessage = <any>error);
    //    return this._Data;
    //}
    View.clone = function (model) {
        var t = new View();
        if (model == null)
            return t;
        t.Id = model.Id;
        t.Name = model.Name;
        t.NameSpace = model.Name;
        t.Schema = model.Schema;
        t.ViewID = model.ViewID;
        t.Columns = column_model_1.Column.cloneList(model.Columns);
        t.ConString = model.ConString;
        return t;
    };
    return View;
}());
exports.View = View;
