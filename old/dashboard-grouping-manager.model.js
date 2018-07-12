"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
exports.__esModule = true;
var dashboard_data_fields_1 = require("./dashboard.model/dashboard-data-fields");
var dashboard_helper_1 = require("./dashboard.helper");
var dashboard_filter_manager_1 = require("./dashboard-filter-manager");
var _ = require("lodash");
var expr_eval_1 = require("expr-eval");
var dashboard_cache_model_1 = require("./dashboard-cache.model");
var GroupingManager = /** @class */ (function () {
    function GroupingManager() {
    }
    GroupingManager.prototype.GroupingManager = function () { };
    Object.defineProperty(GroupingManager, "getInstance", {
        get: function () {
            return this.instance || (this.instance = new this());
        },
        enumerable: true,
        configurable: true
    });
    GroupingManager.prototype.groupByOperations = function (groupFields, dataSource, removeNull) {
        if (removeNull === void 0) { removeNull = false; }
        var result = [];
        var Data = dataSource.slice();
        if (groupFields.length == 0) {
            result.push(Data);
            return result;
        }
        for (var _i = 0, Data_1 = Data; _i < Data_1.length; _i++) {
            var row = Data_1[_i];
            var counter = 0;
            var grouped = "";
            var isNull = false;
            for (var _a = 0, groupFields_1 = groupFields; _a < groupFields_1.length; _a++) {
                var role = groupFields_1[_a];
                var value = "";
                var FieldVal = "";
                if (removeNull && row[role.Field.StoredName] == null) {
                    isNull = true;
                    break;
                }
                if (role.Field.FieldType == dashboard_data_fields_1.DataTypeEnum.object && role.Type) {
                    value = dashboard_helper_1.formatDate(row[role.Field.StoredName], role.Type);
                    row[role.Field.FieldName] = value;
                }
                else {
                    value = row[role.Field.StoredName];
                }
                if (value && value.length) {
                    if (grouped && grouped.length)
                        grouped += " - ";
                    grouped += value.toString();
                }
            }
            if (isNull)
                continue;
            if (grouped.length > 0) {
                grouped = grouped.toString();
                if (!result.hasOwnProperty(grouped)) {
                    result[grouped] = [];
                }
                result[grouped].push(row);
            }
            else {
                result[counter] = [];
                result[counter++].push(row);
            }
        }
        return result;
    };
    GroupingManager.prototype.groupByQuery = function (groupQuery, dataSource, removeNull) {
        if (removeNull === void 0) { removeNull = false; }
        groupQuery;
        var resualt = [];
        var Data = dataSource.slice();
        if (!groupQuery && !(groupQuery.QueryType == dashboard_data_fields_1.QueryTypeEnum.Group || groupQuery.QueryType == dashboard_data_fields_1.QueryTypeEnum.Serise)) {
            resualt.push(Data);
            return resualt;
        }
        var role = groupQuery.Operation;
        for (var _i = 0, Data_2 = Data; _i < Data_2.length; _i++) {
            var row = Data_2[_i];
            var counter = 0;
            var grouped = "";
            var isNull = false;
            var value = "";
            var FieldVal = "";
            if (removeNull && row[role.Field.StoredName] == null) {
                isNull = true;
                continue;
            }
            if (role.Field.FieldType == dashboard_data_fields_1.DataTypeEnum.object && role.Type) {
                var dat = new Date(row[role.Field.StoredName]);
                value = dashboard_helper_1.formatDate(row[role.Field.StoredName], role.Type);
                row[role.Field.FieldName] = value;
            }
            else {
                value = row[role.Field.StoredName];
            }
            if (value && value.length) {
                grouped = value.toString();
            }
            if (grouped.length > 0) {
                grouped = grouped.toString();
                if (!resualt.hasOwnProperty(grouped)) {
                    resualt[grouped] = [];
                }
                resualt[grouped].push(row);
            }
            else {
                resualt[counter] = [];
                resualt[counter++].push(row);
            }
        }
        return resualt;
    };
    GroupingManager.prototype.prepareGroups = function (queries, data, removeNull) {
        if (removeNull === void 0) { removeNull = false; }
        var groupOperations = this.convertChartQueryToOperation(queries);
        groupOperations = groupOperations.concat(this.convertGroupQueryToOperation(queries));
        var result = this.groupByOperations(groupOperations, data, removeNull);
        return this.sortGroups(result);
    };
    GroupingManager.prototype.groupWithFields = function (groupFields, dataSource, Qtype, removeNull, sortGroups) {
        if (Qtype === void 0) { Qtype = dashboard_data_fields_1.QueryTypeEnum.Group; }
        if (removeNull === void 0) { removeNull = false; }
        if (sortGroups === void 0) { sortGroups = true; }
        var fields = new Array();
        var seperatedFields = [];
        var result = [];
        var sort = false;
        var Data = dataSource.slice();
        if (groupFields.length == 0) {
            result.push(Data);
            return new dashboard_data_fields_1.PreparedDataGroups(result, fields, seperatedFields);
        }
        groupFields = _.sortBy(groupFields, function (x) { return x.GetFieldName(); });
        for (var _i = 0, Data_3 = Data; _i < Data_3.length; _i++) {
            var row = Data_3[_i];
            var counter = 0;
            var grouped = "";
            var isNull = false;
            var RowGoups = [];
            var rowOut = false;
            var _loop_1 = function (role) {
                sort = sort || role.sort;
                var value = "";
                var FieldVal = "";
                if (removeNull && row[role.Field.StoredName] == null) {
                    isNull = true;
                    return "break";
                }
                if (role.Field.FieldType == dashboard_data_fields_1.DataTypeEnum.object && role.Type) {
                    dat = new Date(row[role.Field.StoredName]);
                    if (role.Type == dashboard_data_fields_1.DateGroupEnum.Month) {
                        var today = new Date();
                        if (dat.getFullYear() != today.getFullYear()) {
                            rowOut = true;
                            return "break";
                        }
                    }
                    value = dashboard_helper_1.formatDate(row[role.Field.StoredName], role.Type);
                    row[role.Field.FieldName] = value;
                }
                else {
                    value = row[role.Field.StoredName];
                }
                if (value && value.length) {
                    RowGoups[role.GetFieldName()] = value;
                    if (grouped.length)
                        grouped += " - ";
                    grouped += value;
                    if (!fields[counter]) {
                        fields[counter] = new dashboard_data_fields_1.DimensionField(role.Field.FieldName, Qtype, new Array(), true);
                    }
                    if (fields[counter].value.findIndex(function (x) { return x == value; }) == -1) {
                        fields[counter].value.push(value);
                    }
                }
                counter++;
            };
            var dat;
            for (var _a = 0, groupFields_2 = groupFields; _a < groupFields_2.length; _a++) {
                var role = groupFields_2[_a];
                var state_1 = _loop_1(role);
                if (state_1 === "break")
                    break;
            }
            if (isNull || rowOut)
                continue;
            if (grouped.length > 0) {
                if (!result.hasOwnProperty(grouped)) {
                    //debugger;
                    result[grouped] = [];
                    seperatedFields.push(RowGoups);
                }
                result[grouped].push(row);
            }
            else {
                result[counter] = [];
                result[counter++].push(row);
            }
        }
        // if (!resualt.length && sort)
        if (sortGroups) {
            var t = this.sortWithFields(result, seperatedFields);
            result = t.data;
            seperatedFields = t.sperated;
        }
        return new dashboard_data_fields_1.PreparedDataGroups(result, fields, seperatedFields);
    };
    GroupingManager.prototype.prepareGroupsWithFields = function (queries, data, removeNull, sortGroups) {
        if (removeNull === void 0) { removeNull = false; }
        if (sortGroups === void 0) { sortGroups = true; }
        var groupOperations = this.convertGroupQueryToOperation(queries);
        return this.groupWithFields(groupOperations, data, dashboard_data_fields_1.QueryTypeEnum.Group, removeNull, sortGroups);
    };
    GroupingManager.prototype.sortWithFields = function (data, seperated) {
        var keys = new Array();
        var result1 = [];
        var result2 = [];
        var temp_seperation = [];
        for (var key in data) {
            keys.push(key);
        }
        var counter = 0;
        for (var _i = 0, seperated_1 = seperated; _i < seperated_1.length; _i++) {
            var sp = seperated_1[_i];
            temp_seperation[keys[counter]] = sp;
            counter++;
        }
        keys.sort();
        for (var _a = 0, keys_1 = keys; _a < keys_1.length; _a++) {
            var key = keys_1[_a];
            result1[key] = _.cloneDeep(data[key]);
            result2.push(temp_seperation[key]);
        }
        return { data: result1, sperated: result2 };
    };
    GroupingManager.prototype.sortGroups = function (groups, type) {
        if (type === void 0) { type = dashboard_data_fields_1.SortingType.ascending; }
        var keys = new Array();
        var result = [];
        var res = type;
        for (var key in groups) {
            keys.push(key);
        }
        keys.sort(function (a, b) { return res * ((a < b) ? -1 : (a > b) ? 1 : 0); });
        for (var _i = 0, keys_2 = keys; _i < keys_2.length; _i++) {
            var key = keys_2[_i];
            result[key] = _.cloneDeep(groups[key]);
        }
        return result;
    };
    GroupingManager.prototype.concatDistinctGroups = function (T, S) {
        for (var _i = 0, T_1 = T; _i < T_1.length; _i++) {
            var RT = T_1[_i];
            for (var _a = 0, S_1 = S; _a < S_1.length; _a++) {
                var RS = S_1[_a];
                if (RT.name == RS.name) {
                    var _loop_2 = function (val) {
                        found = RT.value.findIndex(function (x) { return x == val; });
                        if (found == -1)
                            RT.value.push(val);
                    };
                    var found;
                    for (var _b = 0, _c = RS.value; _b < _c.length; _b++) {
                        var val = _c[_b];
                        _loop_2(val);
                    }
                }
            }
        }
        return T;
    };
    GroupingManager.prototype.convertGroupQueryToOperation = function (queries) {
        var Q = [];
        for (var _i = 0, queries_1 = queries; _i < queries_1.length; _i++) {
            var query = queries_1[_i];
            if (query.QueryType == dashboard_data_fields_1.QueryTypeEnum.Group) {
                Q.push(query.Operation);
            }
        }
        return Q;
    };
    GroupingManager.prototype.convertChartQueryToOperation = function (queries) {
        var Q = [];
        for (var _i = 0, queries_2 = queries; _i < queries_2.length; _i++) {
            var query = queries_2[_i];
            if (query.QueryType == dashboard_data_fields_1.QueryTypeEnum.Chart) {
                query.Operation.CompareDate.Type = dashboard_data_fields_1.DateGroupEnum.none;
                query.Operation.CompareToDate.Type = dashboard_data_fields_1.DateGroupEnum.none;
                Q.push(query.Operation.CompareDate);
                Q.push(query.Operation.CompareToDate);
            }
        }
        return Q;
    };
    GroupingManager.prototype.operate_v1 = function () {
        for (var _i = 0, _a = this.Fields; _i < _a.length; _i++) {
            var role = _a[_i];
            var count = 0;
            for (var inx1 in this.DataAsGroups) {
                var newR = {};
                var group = this.DataAsGroups[inx1];
                for (var field in group[0]) {
                    if (role.FieldName == field) {
                        if (role.OperationType == dashboard_data_fields_1.OperationTypeEnum.Group && !newR[role.DisplayName]) {
                            newR[role.DisplayName] = group[0][field];
                        }
                        else if (role.OperationType == dashboard_data_fields_1.OperationTypeEnum.Measure) {
                            if (role.MeasureType == dashboard_data_fields_1.Measure.Sum)
                                newR[role.DisplayName] = dashboard_cache_model_1.Cache.getInstance.getCache((inx1 + "sum" + field), group, field);
                            else if (role.MeasureType == dashboard_data_fields_1.Measure.Max) {
                                newR[role.DisplayName] = _.maxBy(group, field)[field];
                            }
                            else if (role.MeasureType == dashboard_data_fields_1.Measure.Min) {
                                newR[role.DisplayName] = _.minBy(group, field)[field];
                            }
                            else if (role.MeasureType == dashboard_data_fields_1.Measure.Average) {
                                newR[role.DisplayName] = dashboard_helper_1.average(inx1, "sum", field, group);
                            }
                            else if (role.MeasureType == dashboard_data_fields_1.Measure.Count) {
                                newR[role.DisplayName] = group.length;
                            }
                        }
                        else if (role.OperationType == dashboard_data_fields_1.OperationTypeEnum.Delta) {
                            newR[role.DisplayName] = dashboard_helper_1.delta(inx1, inx1, field, role.DeltaTargetDataField, "sum");
                        }
                        else if (role.OperationType == dashboard_data_fields_1.OperationTypeEnum.DeltaGroup && (inx1 == role.DeltaGroupsTypeValue[0] || inx1 == role.DeltaGroupsTypeValue[1])) {
                            newR[role.DisplayName] = dashboard_helper_1.delta(role.DeltaGroupsTypeValue[0], role.DeltaGroupsTypeValue[1], field, role.DeltaTargetDataField, "sum");
                            // //console.log(_.sumBy(this.DataAsGroups[role.DeltaGroupsTypeValue[1]], role.DeltaTargetDataField));
                        }
                        else if (role.OperationType == dashboard_data_fields_1.OperationTypeEnum.Spark) {
                            newR[role.DisplayName] = {};
                            newR[role.DisplayName]["points"] = [];
                            for (var point in group) {
                                var SparkObj = {};
                                var dt = new Date(group[point][role.SparkDateFieldName]);
                                SparkObj["Fulldate"] = dt;
                                if (role.SparkDateType == dashboard_data_fields_1.DateGroupEnum.QuarterYear) {
                                    SparkObj["value"] = group[point][role.FieldName];
                                    SparkObj["Year"] = dt.getFullYear().toString();
                                    SparkObj["count"] = 1;
                                    SparkObj["date"] = _.ceil((dt.getMonth() + 1) / 3).toString();
                                    var check = _.find(newR[role.DisplayName].points, { 'Year': SparkObj["Year"], 'Quarter': SparkObj["Quarter"] });
                                    if (check) {
                                        check['value'] += SparkObj["value"];
                                        check["count"]++;
                                    }
                                    else
                                        newR[role.DisplayName].points.push(SparkObj);
                                    newR[role.DisplayName]["Date_Type"] = "Quarter";
                                }
                                else if (role.SparkDateType == dashboard_data_fields_1.DateGroupEnum.Year) {
                                    SparkObj["value"] = group[point][role.FieldName];
                                    SparkObj["Year"] = dt.getFullYear().toString();
                                    SparkObj["date"] = SparkObj["Year"];
                                    SparkObj["count"] = 1;
                                    var check = _.find(newR[role.DisplayName].points, { 'Year': SparkObj["Year"] });
                                    if (check) {
                                        check['value'] += SparkObj["value"];
                                        check["count"]++;
                                    }
                                    else
                                        newR[role.DisplayName].points.push(SparkObj);
                                    newR[role.DisplayName]["Date_Type"] = "Year";
                                }
                                else if (role.SparkDateType == dashboard_data_fields_1.DateGroupEnum.MonthYear) {
                                    SparkObj["value"] = group[point][role.FieldName];
                                    SparkObj["Year"] = dt.getFullYear().toString();
                                    SparkObj["date"] = _.ceil(dt.getMonth() + 1).toString();
                                    var check = _.find(newR[role.DisplayName].points, { 'Year': SparkObj["Year"], 'Month': SparkObj["Month"] });
                                    SparkObj["count"] = 1;
                                    if (check) {
                                        check['value'] += SparkObj["value"];
                                        check["count"]++;
                                    }
                                    else
                                        newR[role.DisplayName].points.push(SparkObj);
                                    newR[role.DisplayName]["Date_Type"] = "Month";
                                }
                                // if()
                                // newR[role.DisplayName].points = _.sortBy(newR[role.DisplayName].points, ['date']);
                            }
                            newR[role.DisplayName]["MAX"] = _.maxBy(newR[role.DisplayName].points, 'value');
                            newR[role.DisplayName]["MIN"] = _.minBy(newR[role.DisplayName].points, 'value');
                        }
                    }
                    if (role.OperationType == dashboard_data_fields_1.OperationTypeEnum.calc && !newR[role.DisplayName]) {
                        if (!this.ExpressionTokens.length) {
                            this.ExpressionTokens = dashboard_helper_1.toknize(role.Expression);
                        }
                        var obj = {};
                        for (var i = 0; i < this.ExpressionTokens.length; i++) {
                            obj[this.ExpressionTokens[i]] = dashboard_cache_model_1.Cache.getInstance.getCache((inx1 + "sum" + this.ExpressionTokens[i]), group, this.ExpressionTokens[i]);
                        }
                        var parser = new expr_eval_1.Parser();
                        var expr = parser.parse(role.Expression);
                        newR[role.DisplayName] = expr.evaluate(obj);
                    }
                }
                if (this.FinalView.length > count) {
                    this.FinalView[count] = __assign({}, this.FinalView[count], newR);
                }
                else {
                    newR["count"] = group.length;
                    this.FinalView.push(newR);
                }
                count++;
            }
        }
        // //console.log(this.FinalView);
        ////console.log(this.cashe);
    };
    GroupingManager.prototype.filterAndGroup = function (filterString, groupOptions, data, filterFirst) {
        if (filterFirst === void 0) { filterFirst = 1; }
        if (filterFirst) {
            return this.groupBy(groupOptions, dashboard_filter_manager_1.FilterManager.getInstance.filterByString(filterString, data));
        }
        else {
            return dashboard_filter_manager_1.FilterManager.getInstance.filterByString(filterString, this.groupBy(groupOptions, data));
        }
    };
    GroupingManager.prototype.groupBy = function (fields, data) {
        this.FinalView = [];
        dashboard_cache_model_1.Cache.getInstance.resetCache();
        this.DataAsGroups = [];
        this.GroupFields = [];
        this.ExpressionTokens = [];
        this.Fields = fields;
        this.data = data;
        // this.BuildGroupFields();
        this.buildGroups();
        // //console.log(this.DataAsGroups);
        this.operate_v1();
        return this.FinalView;
    };
    GroupingManager.prototype.buildGroups = function () {
        var counter = 0;
        for (var _i = 0, _a = this.data; _i < _a.length; _i++) {
            var row = _a[_i];
            var grouped = "";
            for (var _b = 0, _c = this.Fields; _b < _c.length; _b++) {
                var entity = _c[_b];
                var FieldVal = "";
                if (entity.OperationType == dashboard_data_fields_1.OperationTypeEnum.Group) {
                    if (entity.DataType && entity.DataType == dashboard_data_fields_1.DataTypeEnum.object) {
                        var dat = new Date(row[entity.FieldName]);
                        grouped += (dat.getFullYear()).toString();
                        if (entity.GroupedDateType == dashboard_data_fields_1.DateGroupEnum.MonthYear) {
                            grouped += (dat.getMonth() + 1).toString();
                        }
                        else if (entity.GroupedDateType == dashboard_data_fields_1.DateGroupEnum.QuarterYear) {
                            grouped += (_.ceil((dat.getMonth() + 1) / 3)).toString();
                        }
                    }
                    else
                        grouped += row[entity.FieldName];
                }
            }
            if (grouped.length > 0) {
                if (!this.DataAsGroups.hasOwnProperty(grouped)) {
                    this.DataAsGroups[grouped] = [];
                }
                this.DataAsGroups[grouped].push(row);
            }
            else {
                this.DataAsGroups[counter] = [];
                this.DataAsGroups[counter++].push(row);
            }
        }
    };
    return GroupingManager;
}());
exports.GroupingManager = GroupingManager;
