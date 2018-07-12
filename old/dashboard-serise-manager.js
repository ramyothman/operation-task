"use strict";
exports.__esModule = true;
var dash = require("./dashboard.model/dashboard-data-fields");
var dashboard_grouping_manager_model_1 = require("./dashboard-grouping-manager.model");
var SeriseManager = /** @class */ (function () {
    function SeriseManager() {
    } // private to prevent to create more than one instance by access constructor from outside
    Object.defineProperty(SeriseManager, "getInstance", {
        get: function () {
            if (this.instance == null) {
                this.instance = new SeriseManager();
            }
            return this.instance;
        },
        enumerable: true,
        configurable: true
    });
    SeriseManager.prototype.prepareSerise = function (Queries, Data, removeNull) {
        if (removeNull === void 0) { removeNull = false; }
        var Q = this.convertQueryToGroupOperation(Queries);
        return Data = dashboard_grouping_manager_model_1.GroupingManager.getInstance.groupByOperations(Q, Data, removeNull); //GroupBy_v1(Q, Data, removeNull); 
    };
    SeriseManager.prototype.prepareSerise_withFields = function (Queries, Data, removeNull, sortGroups) {
        if (removeNull === void 0) { removeNull = false; }
        if (sortGroups === void 0) { sortGroups = true; }
        var Q = this.convertQueryToGroupOperation(Queries);
        return dashboard_grouping_manager_model_1.GroupingManager.getInstance.groupWithFields(Q, Data, dash.QueryTypeEnum.Serise, removeNull, sortGroups); //ConstructGroups_WithFields(Q, Data, dash.QueryTypeEnum.Serise, removeNull, sortGroups);
    };
    SeriseManager.prototype.convertQueryToGroupOperation = function (Queries) {
        var Q = [];
        for (var _i = 0, Queries_1 = Queries; _i < Queries_1.length; _i++) {
            var query = Queries_1[_i];
            if (query.QueryType == dash.QueryTypeEnum.Serise) {
                Q.push(query.Operation);
            }
        }
        return Q;
    };
    SeriseManager.prototype.handleSerise = function (ser, data, argu) {
        var res = [];
        var all_ser = [];
        var count = 0;
        var check = [];
        for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
            var recored = data_1[_i];
            var seriseName = "";
            var nRow = {};
            for (var _a = 0, recored_1 = recored; _a < recored_1.length; _a++) {
                var row = recored_1[_a];
                for (var field in row) {
                    if (field == 'serise')
                        continue;
                    if (row['serise'])
                        nRow[row['serise'] + "-" + field] = row[field];
                    else
                        nRow[field] = row[field];
                }
                //delete row[x.Operation.GetFieldName()];
                if (!check[row['serise']]) {
                    check[row['serise']] = true;
                    all_ser.push(row['serise'] || "");
                }
            }
            if (!argu[count] || argu[count] == '0')
                nRow['argument'] = 'total';
            else
                nRow['argument'] = argu[count].split('+').join('<br>');
            count++;
            res.push(nRow);
        }
        return { 'serise': all_ser, 'data': res };
    };
    return SeriseManager;
}());
exports.SeriseManager = SeriseManager;
