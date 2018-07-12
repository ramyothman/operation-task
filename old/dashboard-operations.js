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
var dash = require("./dashboard.model/dashboard-data-fields");
var dashboard_widget_model_1 = require("./dashboard.model/dashboard-widget.model");
var _ = require("lodash");
var expr_eval_1 = require("expr-eval");
var moment = require("moment");
//import { AppSettings } from '../../settings/app/app.settings';
var numeral = require("numeral");
var dashboard_widget_type_enum_1 = require("./dashboard.model/dashboard-widget-type.enum");
var dashboard_data_fields_1 = require("./dashboard.model/dashboard-data-fields");
var Operations = /** @class */ (function () {
    /*** end Input Section**/
    function Operations() {
        //row structure
        this.colors = ['#27ae60', '#2980b9', '#8e44ad', '#e74c3c', '#f1c40f', '#f39c12', '#2c3e50'];
    }
    Operations.prototype.EnumToArray = function (Enum) {
        var arr = [];
        for (var o in Enum)
            arr.push({ id: Enum[o], name: o });
        return arr.splice(arr.length / 2);
    };
    Operations.prototype.GroupBy_v1 = function (GroupFields, DataSource, removeNull) {
        if (removeNull === void 0) { removeNull = false; }
        var counter = 0;
        var resualt = [];
        var Data = DataSource.slice();
        if (GroupFields.length == 0) {
            resualt.push(Data);
            return resualt;
        }
        for (var _i = 0, Data_1 = Data; _i < Data_1.length; _i++) {
            var row = Data_1[_i];
            var counter_1 = 0;
            var grouped = "";
            var isNull = false;
            for (var _a = 0, GroupFields_1 = GroupFields; _a < GroupFields_1.length; _a++) {
                var role = GroupFields_1[_a];
                var value = "";
                var FieldVal = "";
                if (removeNull && row[role.Field.StoredName] == null) {
                    isNull = true;
                    break;
                }
                if (role.Field.FieldType == dash.DataTypeEnum.object && role.Type) {
                    var dat = new Date(row[role.Field.StoredName]);
                    value = this.formatDate(row[role.Field.StoredName], role.Type);
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
                if (!resualt.hasOwnProperty(grouped)) {
                    resualt[grouped] = [];
                }
                resualt[grouped].push(row);
            }
            else {
                resualt[counter_1] = [];
                resualt[counter_1++].push(row);
            }
        }
        return this.SortGroups(resualt);
    };
    Operations.prototype.GroupBy_Single = function (GroupQuery, DataSource, removeNull) {
        if (removeNull === void 0) { removeNull = false; }
        var counter = 0;
        GroupQuery;
        var resualt = [];
        var Data = DataSource.slice();
        if (!GroupQuery && !(GroupQuery.QueryType == dash.QueryTypeEnum.Group || GroupQuery.QueryType == dash.QueryTypeEnum.Serise)) {
            resualt.push(Data);
            return resualt;
        }
        var role = GroupQuery.Operation;
        for (var _i = 0, Data_2 = Data; _i < Data_2.length; _i++) {
            var row = Data_2[_i];
            var counter_2 = 0;
            var grouped = "";
            var isNull = false;
            var value = "";
            var FieldVal = "";
            if (removeNull && row[role.Field.StoredName] == null) {
                isNull = true;
                continue;
            }
            if (role.Field.FieldType == dash.DataTypeEnum.object && role.Type) {
                var dat = new Date(row[role.Field.StoredName]);
                value = this.formatDate(row[role.Field.StoredName], role.Type);
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
                resualt[counter_2] = [];
                resualt[counter_2++].push(row);
            }
        }
        return this.SortGroups(resualt, GroupQuery.Customization.SortType);
    };
    Operations.prototype.ConstructGroups_WithFields = function (GroupFields, DataSource, Qtype, removeNull, sortGroups) {
        if (Qtype === void 0) { Qtype = dash.QueryTypeEnum.Group; }
        if (removeNull === void 0) { removeNull = false; }
        if (sortGroups === void 0) { sortGroups = true; }
        var counter = 0;
        var fields = new Array();
        var seperatedFields = [];
        var resualt = [];
        var sort = false;
        var Data = DataSource.slice();
        if (GroupFields.length == 0) {
            resualt.push(Data);
            return new dashboard_data_fields_1.PreparedDataGroups(resualt, fields, seperatedFields);
        }
        GroupFields = _.sortBy(GroupFields, function (x) { return x.GetFieldName(); });
        for (var _i = 0, Data_3 = Data; _i < Data_3.length; _i++) {
            var row = Data_3[_i];
            var counter_3 = 0;
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
                if (role.Field.FieldType == dash.DataTypeEnum.object && role.Type) {
                    dat = new Date(row[role.Field.StoredName]);
                    if (role.Type == dash.DateGroupEnum.Month) {
                        // debugger;
                        var today = new Date();
                        if (dat.getFullYear() != today.getFullYear()) {
                            rowOut = true;
                            return "break";
                        }
                    }
                    value = this_1.formatDate(row[role.Field.StoredName], role.Type);
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
                    if (!fields[counter_3]) {
                        fields[counter_3] = new dashboard_data_fields_1.DimensionField(role.Field.FieldName, Qtype, new Array(), true);
                    }
                    if (fields[counter_3].value.findIndex(function (x) { return x == value; }) == -1) {
                        fields[counter_3].value.push(value);
                    }
                }
                counter_3++;
            };
            var this_1 = this, dat;
            for (var _a = 0, GroupFields_2 = GroupFields; _a < GroupFields_2.length; _a++) {
                var role = GroupFields_2[_a];
                var state_1 = _loop_1(role);
                if (state_1 === "break")
                    break;
            }
            if (isNull || rowOut)
                continue;
            if (grouped.length > 0) {
                if (!resualt.hasOwnProperty(grouped)) {
                    //debugger;
                    resualt[grouped] = [];
                    seperatedFields.push(RowGoups);
                }
                resualt[grouped].push(row);
            }
            else {
                resualt[counter_3] = [];
                resualt[counter_3++].push(row);
            }
        }
        // if (!resualt.length && sort)
        if (sortGroups) {
            var t = this.SortGroupedObjectKeys(resualt, seperatedFields);
            resualt = t.data;
            seperatedFields = t.sperated;
        }
        return new dashboard_data_fields_1.PreparedDataGroups(resualt, fields, seperatedFields);
    };
    Operations.prototype.SortGroups = function (Groups, type) {
        if (type === void 0) { type = dash.SortingType.ascending; }
        var Keys = new Array();
        var resualt1 = [];
        var res = type;
        for (var key in Groups) {
            Keys.push(key);
        }
        Keys.sort(function (a, b) { return res * ((a < b) ? -1 : (a > b) ? 1 : 0); });
        for (var _i = 0, Keys_1 = Keys; _i < Keys_1.length; _i++) {
            var key = Keys_1[_i];
            resualt1[key] = _.cloneDeep(Groups[key]);
        }
        return resualt1;
    };
    Operations.prototype.SortGroupedObjectKeys = function (data, seperated) {
        var Keys = new Array();
        var resualt1 = [];
        var resulat2 = [];
        var temp_seperation = [];
        for (var key in data) {
            Keys.push(key);
        }
        var counter = 0;
        for (var _i = 0, seperated_1 = seperated; _i < seperated_1.length; _i++) {
            var sp = seperated_1[_i];
            temp_seperation[Keys[counter]] = sp;
            counter++;
        }
        Keys.sort();
        for (var _a = 0, Keys_2 = Keys; _a < Keys_2.length; _a++) {
            var key = Keys_2[_a];
            resualt1[key] = _.cloneDeep(data[key]);
            resulat2.push(temp_seperation[key]);
        }
        return { data: resualt1, sperated: resulat2 };
    };
    //Atia was HERE
    Operations.prototype.getRemainingDays = function (CompareDate, OrderActivationDate, DaystoDelivery) {
        if (DaystoDelivery === void 0) { DaystoDelivery = 30; }
        //console.log(CompareDate, OrderActivationDate, DaystoDelivery)
        var Difference = 0;
        if (CompareDate && CompareDate != null && OrderActivationDate && OrderActivationDate != null) {
            var a = moment(CompareDate);
            var b = moment(OrderActivationDate);
            var days = a.diff(b, 'days');
            Difference = DaystoDelivery - days;
        }
        return Difference;
    };
    Operations.prototype.Delta_v1 = function (op, GroupName1, GroupName2, Groups) {
        var actual = this.agro(op.ActualField, GroupName1, Groups[GroupName1]) || 0;
        var target = this.agro(op.TargetField, GroupName2, Groups[GroupName2]) || 0;
        var res;
        switch (op.Type) {
            case dash.DeltaTypeEnum.PercentVariation:
                res = _.round(((actual - target) / target) * 100), 2;
                break;
            default:
                res = _.round(((actual / target) - 1) - 100, 2);
        }
        return res;
    };
    Operations.prototype.agro = function (op, GroupName, GroupData, LastGroupName, target) {
        if (GroupName === void 0) { GroupName = ""; }
        if (LastGroupName === void 0) { LastGroupName = ""; }
        if (target === void 0) { target = 0; }
        var group = GroupData || new Array();
        var field = op.Field.StoredName;
        var index = (GroupName + dash.QueryTypeEnum.Measure + op.Type + field);
        var lastIndex = (LastGroupName + dash.QueryTypeEnum.Measure + op.Type + field);
        if (!this.cashe[index]) {
            if (op.Type == dash.Measure.Sum)
                this.cashe[index] = _.sumBy(group, field);
            else if (op.Type == dash.Measure.Average) {
                var sumIT = Object.assign({}, op);
                sumIT.Type = dash.Measure.Sum;
                var length_1 = (group) ? group.length : 0;
                this.cashe[index] = this.agro(sumIT, GroupName, GroupData) / group.length;
            }
            else if (op.Type == dash.Measure.Max) {
                this.cashe[index] = _.maxBy(group, field)[field];
            }
            else if (op.Type == dash.Measure.Min) {
                this.cashe[index] = _.minBy(group, field)[field];
            }
            else if (op.Type == dash.Measure.Count) {
                this.cashe[index] = group.length;
            }
            else if (op.Type == dash.Measure.Accumulative) {
                this.cashe[index] = _.sumBy(group, field);
                if (LastGroupName.length) {
                    this.cashe[index] += +this.cashe[lastIndex];
                }
            }
            else if (op.Type == dash.Measure.Target) {
                this.cashe[index] = (target / 365) * 30;
                if (LastGroupName.length) {
                    this.cashe[index] += +this.cashe[lastIndex];
                }
            }
        }
        return this.cashe[index];
    };
    Operations.prototype.Toknize = function (stat) {
        var buffer = "";
        var res = [];
        for (var i = 0; i < stat.length; i++) {
            if (stat[i] == "_" || (stat[i] >= 'a' && stat <= 'z') || (stat[i] >= 'A' && stat[i] <= 'Z')) {
                buffer += stat[i];
            }
            else if (buffer.length > 0) {
                res.push(buffer);
                buffer = "";
            }
        }
        if (buffer.length > 0)
            res.push(buffer);
        return res;
    };
    Operations.prototype.SparkLine = function (Field, Agru, data) {
        Agru.Field.FieldName = "agrumentField";
        Field.Field.FieldName = "target";
        data = this.GroupBy_v1([Agru], data);
        var Queries = [];
        var Q = new dash.Query;
        Q.Operation = Field;
        Q.QueryType = dash.QueryTypeEnum.Measure;
        Queries.push(Q);
        Q = new dash.Query;
        Q.Operation = Agru;
        Q.QueryType = dash.QueryTypeEnum.Group;
        Queries.push(Q);
        return this.operate_v2(Queries, data);
    };
    //normal column structure
    Operations.prototype.operate_v2 = function (Roles, DataSource, formatNumbers, withIndex, seriseIsGroups, HideGroupValue) {
        if (formatNumbers === void 0) { formatNumbers = true; }
        var result = [];
        var ExpressionTokens = [];
        var count1 = 0;
        this.restCashe();
        for (var _i = 0, Roles_1 = Roles; _i < Roles_1.length; _i++) {
            var role = Roles_1[_i];
            var count = 0;
            var maxVal = null;
            var minVal = null;
            if (role.QueryType == dash.QueryTypeEnum.Serise && !seriseIsGroups)
                continue;
            for (var inx1 in DataSource) {
                var newR = {};
                var group = DataSource[inx1];
                if ((role.QueryType == dash.QueryTypeEnum.Group || role.QueryType == dash.QueryTypeEnum.Serise) && !newR[role.Operation.Field.FieldName]) {
                    var recored = "";
                    if (role.Operation.Field.FieldType == dash.DataTypeEnum.object && role.Operation.Type) {
                        var dt = new Date(group[0][role.Operation.Field.StoredName]);
                        recored = this.formatDate(group[0][role.Operation.Field.StoredName], role.Operation.Type);
                    }
                    else
                        recored = group[0][role.Operation.Field.StoredName];
                    if (role.QueryType == dash.QueryTypeEnum.Serise && seriseIsGroups) {
                        if (!newR["serise"])
                            newR["serise"] = "" + recored;
                        else
                            newR["serise"] += "-" + recored;
                    }
                    if (!HideGroupValue)
                        newR[role.Operation.Field.FieldName] = recored;
                }
                else if (role.Operation.Field && inx1.indexOf("null") != -1) {
                    newR[role.Operation.Field.FieldName] = 0;
                }
                else if (role.QueryType == dash.QueryTypeEnum.Measure && !newR[role.Operation.Field.FieldName]) {
                    newR[role.Operation.Field.FieldName] = this.agro(role.Operation, inx1, group);
                }
                else if (role.QueryType == dash.QueryTypeEnum.Delta && !newR[role.Operation.FieldName]) {
                    if (role.Operation.ActualGroup == inx1 || role.Operation.TargetGroup == inx1) {
                        var ans = this.Delta_v1(role.Operation, role.Operation.ActualGroup || role.Operation.TargetGroup, role.Operation.TargetGroup || role.Operation.ActualGroup, DataSource);
                        newR[role.Operation.Field.FieldName] = ans;
                    }
                    else {
                        var ans = this.Delta_v1(role.Operation, inx1, inx1, DataSource);
                        newR[role.Operation.Field.FieldName] = ans;
                    }
                }
                else if (role.QueryType == dash.QueryTypeEnum.Spark) {
                    newR[role.Operation.FieldName] = this.SparkLine(role.Operation.ActualField, role.Operation.ArgumentField, _.cloneDeep(group));
                }
                else if (role.QueryType == dash.QueryTypeEnum.Chart) {
                    // debugger;
                    var val = this.getRemainingDays(group[0][role.Operation.CompareDate.GetStoredName()], group[0][role.Operation.CompareToDate.GetStoredName()], role.Operation.DaysRange);
                    var comp = { "value": val, "range": role.Operation.DaysRange };
                    if (maxVal == null)
                        maxVal = val;
                    if (minVal == null)
                        minVal = val;
                    maxVal = Math.max(maxVal, val);
                    minVal = Math.min(minVal, val);
                    newR[role.Operation.FieldName] = comp;
                }
                else if (role.QueryType == dash.QueryTypeEnum.BarChart) {
                    // debugger;
                    var val = this.agro(role.Operation, inx1, group);
                    if (maxVal == null)
                        maxVal = val;
                    if (minVal == null)
                        minVal = val;
                    maxVal = Math.max(maxVal, val);
                    minVal = Math.min(minVal, val);
                    newR[role.Operation.Field.FieldName] = { "value": val || 0 };
                }
                else if (role.QueryType == dash.QueryTypeEnum.calc && !newR[role.Operation.FieldName]) {
                    if (!ExpressionTokens.length) {
                        ExpressionTokens = this.Toknize(role.Operation.Expression);
                    }
                    var obj = {};
                    for (var i = 0; i < ExpressionTokens.length; i++) {
                        obj[ExpressionTokens[i]] = this.cashe[(inx1 + dash.QueryTypeEnum.Measure + dash.Measure.Sum + ExpressionTokens[i])] || (this.cashe[(inx1 + dash.QueryTypeEnum.Measure + dash.Measure.Sum + ExpressionTokens[i])] = _.sumBy(group, ExpressionTokens[i]));
                    }
                    var parser = new expr_eval_1.Parser();
                    var expr = parser.parse(role.Operation.Expression);
                    newR[role.Operation.FieldName] = expr.evaluate(obj);
                }
                if (count1 > count) {
                    if (withIndex) {
                        result[inx1] = __assign({}, result[inx1], newR);
                    }
                    else {
                        result[count] = __assign({}, result[count], newR);
                    }
                }
                else {
                    count1++;
                    if (withIndex)
                        result[inx1] = newR;
                    else
                        result.push(newR);
                }
                count++;
            }
            if (role.QueryType == dash.QueryTypeEnum.BarChart || role.QueryType == dash.QueryTypeEnum.Chart) {
                for (var row in result) {
                    result[row][role.Operation.GetFieldName()]["max"] = maxVal;
                    result[row][role.Operation.GetFieldName()]["min"] = minVal;
                }
            }
        }
        //console.log(result);
        return result;
    };
    Operations.prototype.operate_Chartjse = function (Roles, DataSource, seriseName, seriseSeperation, GroupSeperation, additionalData) {
        if (seriseName === void 0) { seriseName = ""; }
        if (seriseSeperation === void 0) { seriseSeperation = []; }
        if (GroupSeperation === void 0) { GroupSeperation = []; }
        if (additionalData === void 0) { additionalData = []; }
        if (seriseName.length)
            seriseName = seriseName.replace('+', ' - ');
        var dataset = [];
        var ExpressionTokens = [];
        var count1 = 0;
        var colorCounter = 0;
        this.restCashe();
        for (var _i = 0, Roles_2 = Roles; _i < Roles_2.length; _i++) {
            var role = Roles_2[_i];
            var data = [];
            var colors = [];
            var labels = [];
            var sepCounter = 0;
            var colorsCounter = 0;
            if (role.QueryType == dash.QueryTypeEnum.Serise || role.QueryType == dash.QueryTypeEnum.Group)
                continue;
            var lastGroup = "";
            for (var inx1 in DataSource) {
                var groupSep = [];
                if (GroupSeperation) {
                    var x = 0;
                    for (var g in GroupSeperation) {
                        if (x == sepCounter) {
                            groupSep = GroupSeperation[g];
                            break;
                        }
                        x++;
                    }
                }
                var newCalculation = void 0;
                var group = DataSource[inx1];
                if (role.Operation.Field && inx1.indexOf("null") != -1) {
                    newCalculation = 0;
                }
                else if (role.QueryType == dash.QueryTypeEnum.Measure) {
                    newCalculation = this.agro(role.Operation, inx1, group, lastGroup);
                }
                else if (role.QueryType == dash.QueryTypeEnum.calc) {
                    if (!ExpressionTokens.length) {
                        ExpressionTokens = this.Toknize(role.Operation.Expression);
                    }
                    var obj = {};
                    for (var i = 0; i < ExpressionTokens.length; i++) {
                        obj[ExpressionTokens[i]] = this.cashe[(inx1 + dash.QueryTypeEnum.Measure + dash.Measure.Sum + ExpressionTokens[i])] || (this.cashe[(inx1 + dash.QueryTypeEnum.Measure + dash.Measure.Sum + ExpressionTokens[i])] = _.sumBy(group, ExpressionTokens[i]));
                    }
                    var parser = new expr_eval_1.Parser();
                    var expr = parser.parse(role.Operation.Expression);
                    newCalculation = expr.evaluate(obj);
                }
                var xAxis = inx1.replace("+", " ");
                if (!additionalData[xAxis])
                    additionalData[xAxis] = {};
                var memo = additionalData[xAxis];
                if (!memo["Counting"])
                    memo["Counting"] = 0;
                if (!memo["Total"])
                    memo["Total"] = 0;
                memo["Total"] += +newCalculation;
                memo["Counting"]++;
                var temp = { 'y': newCalculation, 'x': xAxis, 'group': groupSep };
                data.push(temp);
                labels.push(temp.x);
                colors.push(this.colors[colorsCounter % this.colors.length]);
                colorsCounter++;
                sepCounter++;
                lastGroup = inx1;
            }
            var label = seriseName;
            if (label.length)
                label + " - ";
            dataset.push({ "label": label + role.Operation.Field.FieldName, type: dash.chartType[role.OptionalType], 'data': data, 'Field': role.Operation.Field, 'serise': seriseName, 'serisList': seriseSeperation, 'backgroundColor': colors, "labels": labels, "role": role });
        }
        //    console.log(dataset);
        return dataset;
    };
    Operations.prototype.getRandomColor = function () {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };
    Operations.prototype.CalculateExpression = function (exp, data) {
        var ExpressionTokens = this.Toknize(exp.Expression);
        var obj = {};
        for (var i = 0; i < ExpressionTokens.length; i++) {
            obj[ExpressionTokens[i]] = _.sumBy(data, ExpressionTokens[i]);
        }
        var parser = new expr_eval_1.Parser();
        var expr = parser.parse(exp.Expression);
        return expr.evaluate(obj);
    };
    Operations.prototype.PrepareGroups = function (Queries, Data, removeNull) {
        if (removeNull === void 0) { removeNull = false; }
        var Q = [];
        for (var _i = 0, Queries_1 = Queries; _i < Queries_1.length; _i++) {
            var query = Queries_1[_i];
            if (query.QueryType == dash.QueryTypeEnum.Group) {
                Q.push(query.Operation);
            }
            else if (query.QueryType == dash.QueryTypeEnum.Chart) {
                query.Operation.CompareDate.Type = dash.DateGroupEnum.none;
                query.Operation.CompareToDate.Type = dash.DateGroupEnum.none;
                Q.push(query.Operation.CompareDate);
                Q.push(query.Operation.CompareToDate);
            }
        }
        return Data = this.GroupBy_v1(Q, Data, removeNull);
    };
    Operations.prototype.PrepareSerise = function (Queries, Data, removeNull) {
        if (removeNull === void 0) { removeNull = false; }
        var Q = [];
        for (var _i = 0, Queries_2 = Queries; _i < Queries_2.length; _i++) {
            var query = Queries_2[_i];
            if (query.QueryType == dash.QueryTypeEnum.Serise) {
                Q.push(query.Operation);
            }
        }
        return Data = this.GroupBy_v1(Q, Data, removeNull);
    };
    Operations.prototype.PrepareGroups_withFields = function (Queries, Data, removeNull, sortGroups) {
        if (removeNull === void 0) { removeNull = false; }
        if (sortGroups === void 0) { sortGroups = true; }
        var Q = [];
        for (var _i = 0, Queries_3 = Queries; _i < Queries_3.length; _i++) {
            var query = Queries_3[_i];
            if (query.QueryType == dash.QueryTypeEnum.Group) {
                Q.push(query.Operation);
            }
        }
        return this.ConstructGroups_WithFields(Q, Data, dash.QueryTypeEnum.Group, removeNull, sortGroups);
    };
    Operations.prototype.PrepareSerise_withFields = function (Queries, Data, removeNull, sortGroups) {
        if (removeNull === void 0) { removeNull = false; }
        if (sortGroups === void 0) { sortGroups = true; }
        var Q = [];
        for (var _i = 0, Queries_4 = Queries; _i < Queries_4.length; _i++) {
            var query = Queries_4[_i];
            if (query.QueryType == dash.QueryTypeEnum.Serise) {
                Q.push(query.Operation);
            }
        }
        return this.ConstructGroups_WithFields(Q, Data, dash.QueryTypeEnum.Serise, removeNull, sortGroups);
    };
    Operations.prototype.BuildGrid = function (Quries, Datasource) {
        console.log("this is build grid dude");
        //    //debugger;
        this.cashe = [];
        var datav = Datasource.slice();
        var res = this.PrepareGroups(Quries, datav);
        //  debugger
        return this.operate_v2(Quries, res);
    };
    Operations.prototype.BuildPieChart = function (Quries, Datasource) {
        var Datasource = this.PrepareSerise(Quries, Datasource, true);
        this.cashe = [];
        var groups = [];
        var agro = [];
        var ser = [];
        var final = [];
        var result = [];
        var ans = [];
        for (var _i = 0, Quries_1 = Quries; _i < Quries_1.length; _i++) {
            var i = Quries_1[_i];
            if (i.QueryType == dash.QueryTypeEnum.Group)
                groups.push(i);
            else if (i.QueryType == dash.QueryTypeEnum.Serise)
                ser.push(i);
            else
                agro.push(i);
        }
        for (var i in Datasource) {
            var res = this.PrepareGroups(Quries, Datasource[i], true);
            this.restCashe();
            Datasource[i] = this.operate_v2(Quries, res, true, true);
        }
        // serise modifiy if no serise 
        final = Datasource;
        //checking groups
        var layers = [];
        result.push([]);
        if (groups.length == 0) {
            var se = 0;
            for (var serise in final) {
                //  //debugger;
                result[se] = { 'serise_name': serise.replace("+", " "), 'groups': [] };
                result[se]['groups'].push({ 'Group_name': "", 'values': [] });
                for (var _a = 0, agro_1 = agro; _a < agro_1.length; _a++) {
                    var agrument = agro_1[_a];
                    for (var _b = 0, _c = final[serise]; _b < _c.length; _b++) {
                        var row = _c[_b];
                        result[se]['groups'][0].values.push({
                            'agrument': agrument.Operation.GetFieldName(), 'target': row[agrument.Operation.GetFieldName()]
                        });
                    }
                }
                se++;
            }
            layers.push(result);
        }
        else if (ser.length > 0) {
            for (var _d = 0, agro_2 = agro; _d < agro_2.length; _d++) {
                var agrument = agro_2[_d];
                layers.push(this.construct_layer(final, agrument));
            }
        }
        else {
            var se = 0;
            for (var serise in final) {
                result.push([]);
                for (var _e = 0, agro_3 = agro; _e < agro_3.length; _e++) {
                    var agrument = agro_3[_e];
                    result[se] = { 'serise_name': serise.replace("+", " "), 'groups': [] };
                    var count = 0;
                    result[se]['groups'].push({ 'agrument': agrument.Operation.GetFieldName(), 'values': [] });
                    for (var row in final[serise]) {
                        result[se]['groups'][count].values.push({
                            'agrument': row, 'target': final[serise][row][agrument.Operation.GetFieldName()]
                        });
                    }
                    count++;
                    se++;
                }
            }
            if (result.length > 0)
                layers.push(result);
        }
        console.log(layers);
        return layers;
    };
    Operations.prototype.BuildPieChart_chartjs = function (Quries, DatasourceOrg) {
        //debugger;
        var PreparedSerises = this.PrepareSerise_withFields(Quries, DatasourceOrg, true);
        var seperation = PreparedSerises.GroupKeyValue;
        var seperationCounter = 0;
        var serisesList = PreparedSerises.GroupsValue;
        var measureFields;
        var groupFields;
        //  debugger;
        var Datasource = PreparedSerises.data;
        this.cashe = [];
        var groups = [];
        var agro = [];
        var ser = [];
        var datasets = [];
        var result = [];
        var ans = [];
        var layers = [];
        for (var _i = 0, Quries_2 = Quries; _i < Quries_2.length; _i++) {
            var i = Quries_2[_i];
            if (i.QueryType == dash.QueryTypeEnum.Group)
                groups.push(i);
            else if (i.QueryType == dash.QueryTypeEnum.Serise)
                ser.push(i);
            else {
                agro.push(i);
                if (!measureFields)
                    measureFields = new dashboard_data_fields_1.DimensionField("Measure", dash.QueryTypeEnum.Measure, new Array(), false);
                measureFields.value.push(i.Operation.GetFieldName());
            }
        }
        // debugger;
        if (ser.length > 0 && groups.length > 0) {
            for (var i in Datasource) {
                var res = this.PrepareGroups_withFields(Quries, Datasource[i], true);
                if (!groupFields || !groupFields.length)
                    groupFields = res.GroupsValue;
                else
                    groupFields = this.ConcatDistinctroups(groupFields, res.GroupsValue);
                var index = 0;
                for (var _a = 0, agro_4 = agro; _a < agro_4.length; _a++) {
                    var agrument = agro_4[_a];
                    if (!layers[index])
                        layers[index] = [];
                    var T = this.operate_Chartjse([agrument], res.data, i, seperation[seperationCounter++], res.GroupKeyValue);
                    if (T)
                        layers[index] = layers[index].concat(T);
                    index++;
                }
            }
            console.log(layers);
            return new dashboard_widget_model_1.widgetData([], layers, serisesList, groupFields, measureFields, []);
        }
        else {
            for (var i in Datasource) {
                var res_1 = this.PrepareGroups_withFields(Quries, Datasource[i], true);
                this.restCashe();
                var serName = "";
                if (ser.length > 0)
                    serName = i;
                if (!groupFields || !groupFields.length)
                    groupFields = res_1.GroupsValue;
                else
                    groupFields = this.ConcatDistinctroups(groupFields, res_1.GroupsValue);
                var x = this.operate_Chartjse(Quries, res_1.data, serName, seperation[seperationCounter++], res_1.GroupKeyValue);
                datasets = datasets.concat(x);
            }
        }
        // serise modifiy if no serise 
        //checking groups
        result.push([]);
        //  seperationCounter=0
        if (groups.length == 0) {
            var label = [];
            var data = [];
            var index = 0;
            for (var i = 0; i < datasets.length; i++) {
                if (!i) { // set data 
                    result[index] = datasets[i];
                    if (ser.length == index)
                        result[index].label = "Total";
                    else
                        result[index].label = result[0].serise;
                    result[index].labels = [];
                    result[index].labels.push(datasets[i].Field.Caption || datasets[i].Field.FieldName);
                    for (var _b = 0, _c = result[index].data; _b < _c.length; _b++) {
                        var row = _c[_b];
                        row.x = result[index].Field.FieldName;
                    }
                    continue;
                }
                //debugger;
                result[index].backgroundColor.concat(datasets[i].backgroundColor);
                for (var _d = 0, _e = datasets[i].data; _d < _e.length; _d++) {
                    var row = _e[_d];
                    row.x = result[index].Field.FieldName;
                    result[index].data.push(row);
                    result[index].labels.push(datasets[i].Field.Caption || datasets[i].Field.FieldName);
                }
            }
            index++;
            layers.push([result]);
        }
        else {
            layers.push(datasets);
            // layers.push({ 'labels': agruments, 'datasets': dataset });
        }
        //  console.log(layers);
        return new dashboard_widget_model_1.widgetData([], layers, serisesList, groupFields, measureFields, []);
    };
    Operations.prototype.BuildWidget = function (widget) {
        console.log("buildWidget is here");
        if (!widget.Datasource)
            alert("no DataSource ");
        if (widget.WidgetType == dashboard_widget_type_enum_1.DashboardWidgetTypeEnum.Grid) {
            if (widget.Operations != null) {
                //console.log(widget);
                widget.CurrentData = this.BuildGrid(widget.Operations, widget.Datasource);
            }
            //  console.log(widget.CurrentData);
        }
        else if (widget.WidgetType == dashboard_widget_type_enum_1.DashboardWidgetTypeEnum.Pivot) {
            var DataSource = void 0;
            if (widget.Operations != null) {
                DataSource = {
                    fields: widget.Operations,
                    store: widget.Datasource
                };
            }
            widget.CurrentData = DataSource;
            console.log(widget.CurrentData);
        }
        else if (widget.WidgetType == dashboard_widget_type_enum_1.DashboardWidgetTypeEnum.PieChart) {
            if (widget.Operations != null) {
                var data = this.BuildPieChart_chartjs(widget.Operations, widget.Datasource);
                widget.CurrentData = data;
                if (!widget.selectedArgument && !widget.selectedArgument && !widget.selectedSerise.length && !widget.selectedArgument.length)
                    widget.selectedArgument = data.agrument;
                //  console.log(widget.CurrentData);
                widget.BuildSchema();
            }
            //   this.PieChartLayer = this.widget.CurrentData.layers[0];
            // var temp = this.Methods.BuildWidget(this.widget.Operations, this.widget.Datasource);
            // //console.log(this.Methods.PrepareSerise(this.widget.Operations, temp));
        }
        else if (widget.WidgetType == dashboard_widget_type_enum_1.DashboardWidgetTypeEnum.BarChart) {
            if (widget.Operations != null) {
                var T;
                if (widget.ExpBar) {
                    T = this.buildExpBarChart(widget.Operations, widget.Datasource);
                }
                else
                    T = this.buildFlatCharts_chartjs(widget.Operations, widget.Datasource);
                widget.CurrentData = T;
                widget.syncLabels(T.labels);
                this.reSortLabels(widget);
                widget.BuildSchema();
                widget.UpdateColors();
                //widget.ColorBehavior = true;
                //if (this.widget.colorPlatte[e.SerialName] && this.widget.colorPlatte[e.SerialName].color && this.widget.colorPlatte[e.SerialName].color.toLowerCase() != e.color.toLowerCase()) {
                //  //debugger;
                //  this.widget.ChangeColor(e.SerialName, e.color)
                //}
            }
            //   this.PieChartLayer = this.widget.CurrentData.layers[0];
            // var temp = this.Methods.BuildWidget(this.widget.Operations, this.widget.Datasource);
            // //console.log(this.Methods.PrepareSerise(this.widget.Operations, temp));
        }
        else if (widget.WidgetType == dashboard_widget_type_enum_1.DashboardWidgetTypeEnum.DigitChart) {
            if (widget.Operations != null) {
                var T_1;
                T_1 = this.buildDigitChart(widget.Operations, widget.Datasource);
                widget.CurrentData = T_1;
                //   widget.BuildSchema();
            }
        }
        else if (widget.WidgetType == dashboard_widget_type_enum_1.DashboardWidgetTypeEnum.ActiveTotalChart) {
            if (widget.Operations != null) {
                console.log("active total chart is here");
                var T_2;
                T_2 = this.buildActiveTotalChart(widget.Operations, widget.Datasource);
                console.log(T_2);
                widget.CurrentData = T_2;
                //   widget.BuildSchema();
            }
        }
        else if (widget.WidgetType == dashboard_widget_type_enum_1.DashboardWidgetTypeEnum.Gauge) {
            if (widget.Operations != null) {
                var T_3;
                console.log(widget.Operations);
                T_3 = this.BuildGauge(widget.Operations, widget.Datasource);
                widget.CurrentData = T_3;
                //   widget.BuildSchema();
            }
        }
        // console.log(widget);
    };
    Operations.prototype.BuildGauge = function (Queries, dataSource) {
        var serise = this.PrepareGroups(Queries, dataSource);
        var layers = [];
        //    debugger;
        for (var _i = 0, Queries_5 = Queries; _i < Queries_5.length; _i++) {
            var Q = Queries_5[_i];
            if (Q.QueryType == dash.QueryTypeEnum.Delta) {
                var currentLayer = [];
                for (var index in serise) {
                    var name_1 = "";
                    this.restCashe();
                    var value = this.Delta_v1(Q.Operation, index, index, serise);
                    if (index != "0")
                        name_1 = index;
                    var actualSum = this.agro(Q.Operation.ActualField, index, serise) || 0;
                    var TargetSum = this.agro(Q.Operation.TargetField, index, serise) || 0;
                    currentLayer.push({ 'name': name_1, 'value': value, 'TargetValue': TargetSum, 'ActualValue': actualSum });
                }
                layers.push({ "name": Q.Operation.GetFieldName(), "data": currentLayer });
            }
        }
        //   debugger;
        return layers;
    };
    Operations.prototype.reSortLabels = function (widget) {
        //  debugger;
        var labels = [];
        var temp = _.cloneDeep(widget.widgetLabels);
        temp = temp.sort(function (a, b) {
            return a.priority - b.priority;
        });
        widget.widgetLabels = temp;
    };
    Operations.prototype.construct_layer = function (data, agrument) {
        var result = [];
        var se = 0;
        for (var serise in data) {
            result.push([]);
            result[se] = { 'serise_name': serise.replace("+", " "), 'groups': [] };
            result[se]['groups'].push({ 'agrument': agrument.Operation.GetFieldName(), 'values': [] });
            for (var row in data[serise]) {
                result[se]['groups'][0].values.push({
                    'agrument': row, 'target': data[serise][row][agrument.Operation.GetFieldName()]
                });
            }
            se++;
        }
        return result;
    };
    Operations.prototype.restCashe = function () {
        this.cashe = [];
    };
    Operations.prototype.buildActiveTotalChart = function (Quries, Datasource) {
        var result = [];
        var Active = 0;
        var total = 0;
        //debugger;
        var Measure = [];
        var Group = [];
        for (var _i = 0, Quries_3 = Quries; _i < Quries_3.length; _i++) {
            var Q = Quries_3[_i];
            if (Q.QueryType == dash.QueryTypeEnum.ActiveTotal) {
                var q = new dash.Query();
                q.QueryType = dash.QueryTypeEnum.Measure;
                q.Operation = Q.Operation.ActualField;
                Measure.push(q);
                q = new dash.Query();
                q.QueryType = dash.QueryTypeEnum.Measure;
                q.Operation = Q.Operation.TargetField;
                Measure.push(q);
            }
            else if (Q.QueryType == dash.QueryTypeEnum.Group) {
                Group.push(Q);
                //Group.push(Q.Operation.TargetField);
            }
        }
        var ans = this.PrepareGroups(Group, Datasource, true);
        ans = this.operate_v2(Measure.concat(Group), ans);
        for (var _a = 0, Quries_4 = Quries; _a < Quries_4.length; _a++) {
            var Q = Quries_4[_a];
            if (ans && ans[0] && Q.QueryType == dash.QueryTypeEnum.ActiveTotal) {
                Active = ans[0][Q.Operation.ActualField.GetFieldName()] || 0;
                total = ans[0][Q.Operation.TargetField.GetFieldName()] || 0;
                result.push({ "Query": Q, "active": Active, "total": total });
            }
        }
        console.log(result);
        return result;
    };
    Operations.prototype.buildFlatCharts = function (Quries, Datasource) {
        this.cashe = [];
        var groups = [];
        var agro = [];
        var ser = [];
        var final = [];
        var result = [];
        var agruments = [];
        var all_serise = [];
        for (var _i = 0, Quries_5 = Quries; _i < Quries_5.length; _i++) {
            var i_1 = Quries_5[_i];
            if (i_1.QueryType == dash.QueryTypeEnum.Group)
                groups.push(i_1);
            else if (i_1.QueryType == dash.QueryTypeEnum.Serise)
                ser.push(i_1);
            else
                agro.push(i_1);
        }
        var Datasource = this.PrepareGroups(groups, Datasource, true);
        var i = 0;
        //console.log(Datasource)
        for (var row in Datasource) {
            var res = this.PrepareSerise(ser, Datasource[row], true);
            agruments.push(row);
            this.restCashe();
            final.push(this.operate_v2(ser.concat(agro), res, true, false, true, true));
        }
        final = this.handleSerise(ser, final, agruments);
        //console.log(final);
        console.log(final);
        return final;
    };
    Operations.prototype.handleSerise = function (ser, data, argu) {
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
    //for Groups
    Operations.prototype.cloneDeepNotIndexed = function (arr) {
    };
    Operations.prototype.ConcatDistinctroups = function (T, S) {
        for (var _i = 0, T_4 = T; _i < T_4.length; _i++) {
            var RT = T_4[_i];
            for (var _a = 0, S_1 = S; _a < S_1.length; _a++) {
                var RS = S_1[_a];
                if (RT.name == RS.name) {
                    var _loop_2 = function (val) {
                        if (RT.value.findIndex(function (x) { return x == val; }) == -1)
                            RT.value.push(val);
                    };
                    for (var _b = 0, _c = RS.value; _b < _c.length; _b++) {
                        var val = _c[_b];
                        _loop_2(val);
                    }
                }
            }
        }
        return T;
    };
    Operations.prototype.buildDigitChart = function (Quries, DatasourceOrg) {
        //debugger;
        var result = this.operate_v2(Quries, [DatasourceOrg], false);
        var target = 0;
        var actual = 0;
        if (result && result.length > 0)
            for (var _i = 0, Quries_6 = Quries; _i < Quries_6.length; _i++) {
                var Q = Quries_6[_i];
                if (Q.QueryType == dash.QueryTypeEnum.Measure) {
                    if (Q.QuerySubType == dash.QuerySubTypeEnum.DigitActual)
                        actual = +result[0][Q.Operation.GetFieldName()];
                    else if (Q.QuerySubType == dash.QuerySubTypeEnum.DigitTarget)
                        target = +result[0][Q.Operation.GetFieldName()];
                }
            }
        return numeral(actual - target).format('0.0a');
    };
    Operations.prototype.buildFlatCharts_chartjs = function (Quries, DatasourceOrg) {
        // debugger;
        this.cashe = [];
        var groups = [];
        var agro = [];
        var ser = [];
        var dataset = [];
        var result = [];
        var Datasource = [];
        var seperation = [];
        var seperationCounter = 0;
        var agruments = new Array();
        var seriseFields = new Array();
        var groupFields = new Array();
        var measureFields;
        var all_serise = [];
        var additionalData = new Array();
        var _loop_3 = function (i_2) {
            if (i_2.QueryType == dash.QueryTypeEnum.Group)
                groups.push(i_2);
            else if (i_2.QueryType == dash.QueryTypeEnum.Serise)
                ser.push(i_2);
            else {
                agro.push(i_2);
                if (agro.length == 1)
                    DatasourceOrg.sort(function (a, b) { return a[i_2.Operation.Field.StoredName] - b[i_2.Operation.Field.StoredName]; });
                if (!measureFields)
                    measureFields = new dashboard_data_fields_1.DimensionField("Measure", dash.QueryTypeEnum.Measure, new Array(), false);
                measureFields.value.push(i_2.Operation.GetFieldName());
            }
        };
        for (var _i = 0, Quries_7 = Quries; _i < Quries_7.length; _i++) {
            var i_2 = Quries_7[_i];
            _loop_3(i_2);
        }
        if (ser.length) {
            var temp = this.PrepareSerise_withFields(ser, DatasourceOrg, true, false);
            seriseFields = temp.GroupsValue;
            Datasource = temp.data;
            seperation = temp.GroupKeyValue;
        }
        else {
            Datasource = [];
            Datasource['all'] = DatasourceOrg;
        }
        var i = 0;
        //console.log(Datasource)
        seperationCounter = 0;
        for (var row in Datasource) {
            var T = this.PrepareGroups_withFields(groups, Datasource[row], true, false);
            // debugger;
            if (!groupFields || !groupFields.length)
                groupFields = T.GroupsValue;
            else
                groupFields = this.ConcatDistinctroups(groupFields, T.GroupsValue);
            if (groups.length > 0) {
                var _loop_4 = function (groupName) {
                    if (agruments.findIndex(function (x) { return x == groupName; }) == -1) {
                        agruments.push(groupName);
                    }
                };
                for (var groupName in T.data) {
                    _loop_4(groupName);
                }
            }
            else {
                var temp = T.data["0"];
                T.data = [];
                T.data["Total"] = temp;
                agruments.push("Total");
            }
            //  //debugger;
            var name_2 = "";
            if (row != 'all')
                name_2 = row;
            //debugger;
            this.restCashe();
            var x = this.operate_Chartjse(groups.concat(agro), T.data, name_2, seperation[seperationCounter++], T.GroupKeyValue, additionalData);
            // debugger;
            for (var _a = 0, x_1 = x; _a < x_1.length; _a++) {
                var set = x_1[_a];
                dataset.push(set);
                set["borderWidth"] = "1";
            }
        }
        // debugger;
        // final = this.handleSerise(ser, final, agruments);
        //console.log(final);
        if (groups.length == 1 && groups[0].Operation.Field.FieldType == dash.DataTypeEnum.object && groups[0].Operation.Type == dash.DateGroupEnum.Month) {
            agruments = agruments.sort(function (a, b) {
                return dash.monthNames[a] - dash.monthNames[b];
            });
        }
        var last = [];
        this.sortXY(dataset, agruments, additionalData);
        //buil   debugger;
        return new dashboard_widget_model_1.widgetData(agruments, dataset, seriseFields, groupFields, measureFields, additionalData);
    };
    Operations.prototype.sortXY = function (data, agru, last) {
        if (last === void 0) { last = []; }
        var counter = 0;
        var prioiry = [];
        // debugger;
        for (var _i = 0, agru_1 = agru; _i < agru_1.length; _i++) {
            var label = agru_1[_i];
            prioiry[label] = counter++;
        }
        var setcounter = 0;
        for (var _a = 0, data_2 = data; _a < data_2.length; _a++) {
            var set = data_2[_a];
            set.data = set.data.sort(function (a, b) {
                return prioiry[a.x] - prioiry[b.x];
            });
            var t = 0;
            var temp = [];
            for (var _b = 0, _c = set.data; _b < _c.length; _b++) {
                var row = _c[_b];
                while (agru[t] != row.x && t < agru.length) {
                    temp.push({ 'x': agru[t] });
                    t++;
                }
                temp.push(row);
                if (!last[row.x])
                    last[row.x] = {};
                last[row.x]["last"] = setcounter;
                t++;
            }
            while (t < agru.length) {
                temp.push({ 'x': agru[t] });
                t++;
            }
            set.data = temp;
            setcounter++;
        }
    };
    Operations.prototype.buildExpBarChart = function (Quries, DatasourceOrg) {
        var actual;
        var target;
        var groupField;
        // debugger;
        for (var _i = 0, Quries_8 = Quries; _i < Quries_8.length; _i++) {
            var q = Quries_8[_i];
            if (q.QueryType == dash.QueryTypeEnum.Measure && q.QuerySubType == dash.QuerySubTypeEnum.ActualExp) {
                actual = q;
            }
            else if (q.QueryType == dash.QueryTypeEnum.Measure && q.QuerySubType == dash.QuerySubTypeEnum.TargetExp) {
                target = q;
            }
            else if (q.QueryType == dash.QueryTypeEnum.Group && q.Operation.Type == dash.DateGroupEnum.Month) {
                groupField = q;
            }
        }
        if (!groupField || !actual || !target)
            return this.buildFlatCharts_chartjs(Quries, DatasourceOrg);
        var T = this.PrepareGroups_withFields([groupField], DatasourceOrg);
        var DataSource = T.data;
        /**********************/ //
        this.restCashe();
        var labels = this.constructorExpLabels(dash.DateGroupEnum.Month);
        var dataset = [];
        var actualData = [];
        var targetData = [];
        var expData = [];
        var lastGroup = "";
        var lastExp = 0;
        var totalExp = 0;
        var targetConst = 0;
        //debugger;
        for (var inx in DataSource) {
            var g = DataSource[inx];
            if (g.length) {
                targetConst = g[0][target.Operation.Field.StoredName];
                break;
            }
        }
        if (typeof targetConst != "number")
            targetConst = 0;
        var date = new Date();
        var month = date.getMonth() + 1;
        var today = date.getDay();
        var rate = null;
        for (var _a = 0, labels_1 = labels; _a < labels_1.length; _a++) {
            var label = labels_1[_a];
            var groupSep = [];
            groupSep[groupField.Operation.Field.FieldName] = label;
            var targetValue = this.agro(target.Operation, label, DataSource[label], lastGroup, targetConst);
            var ActualValue = 0;
            var ExpValue = 0;
            if (dash.monthNames[label] <= month) {
                ActualValue = this.agro(actual.Operation, label, DataSource[label], lastGroup);
                ExpValue = ActualValue;
            }
            if (dash.monthNames[label] >= month) {
                if (dash.monthNames[label] == month) {
                    ExpValue = ActualValue;
                    rate = (ActualValue / (((month - 1) * 30) + today));
                    // rate /= 360;
                    //console.log(rate);
                    ExpValue = ActualValue + (rate * (30 - today)) + lastExp;
                }
                else
                    ExpValue = (rate * 30) + lastExp;
            }
            var groups = DataSource[label];
            actualData.push({ 'y': ActualValue, 'x': label, 'group': groupSep });
            targetData.push({ 'y': targetValue, 'x': label, 'group': groupSep });
            expData.push({ 'y': ExpValue, 'x': label, 'group': groupSep });
            lastGroup = label;
            lastExp = ExpValue;
        }
        var ExpField = new dash.Field();
        ExpField.FieldName = "Exp OF " + actual.Operation.Field.FieldName;
        dataset.push({ "label": "Target", type: "line", 'data': targetData, 'Field': target.Operation.Field, 'serise': "", 'serisList': [], 'backgroundColor': [], "labels": labels, "role": target });
        dataset.push({ "label": "Expected Value", type: "line", 'data': expData, 'Field': ExpField, 'serise': "", 'serisList': [], 'backgroundColor': [], "labels": labels, "role": actual });
        dataset.push({ "label": "Value", 'data': actualData, 'Field': actual.Operation.Field, 'serise': "", 'serisList': [], 'backgroundColor': [], "labels": labels, "role": actual });
        var measureFields = new dashboard_data_fields_1.DimensionField("Measure", dash.QueryTypeEnum.Measure, new Array(), false);
        measureFields.value.push(actual.Operation.GetFieldName());
        measureFields.value.push(target.Operation.GetFieldName());
        measureFields.value.push(ExpField.FieldName);
        /*********************/ //
        return new dashboard_widget_model_1.widgetData(labels, dataset, [], T.GroupsValue, measureFields, []);
    };
    Operations.prototype.calculatExp = function (groups, datasets) {
        if (!groups || !groups.length) {
            return null;
        }
        var actual = null;
        for (var _i = 0, datasets_1 = datasets; _i < datasets_1.length; _i++) {
            var dat = datasets_1[_i];
            if (dat.role.QuerySubType == dash.QuerySubTypeEnum.ActualExp) {
                actual = dat;
                break;
            }
        }
        if (!actual)
            return null;
        var labels = this.constructorExpLabels(groups[0].Operation.Type);
        if (!labels)
            return null;
    };
    Operations.prototype.constructorExpLabels = function (type) {
        if (type == dash.DateGroupEnum.Month) {
            return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        }
        return null;
    };
    Operations.prototype.arrangColors = function (dataset) {
        var colors = new dash.GroupOperation(new dash.Field("serise", "serise"));
        this.GroupBy_v1([colors], dataset);
        return this.GroupBy_v1([colors], dataset);
    };
    Operations.prototype.ApplyFilters = function (widget, Updating) {
        if (Updating === void 0) { Updating = false; }
        var changed = false;
        var operate = [];
        ///chech for strign filter
        //check if there  are master filter to Aplay   
        if (widget.MasterFilter) {
            var data = widget.OrginalDatasource;
            operate = jQuery.extend(true, [], Operations.MasterFilter);
            operate['F' + widget.ID] = [];
            changed = true;
        }
        //check for local selected components filter
        else if (Object.keys(widget.AcceptFilter).length > 0) {
            for (var id in widget.AcceptFilter) {
                if (widget.AcceptFilter[id]) {
                    if (Operations.MasterFilter[id]) {
                        operate.push(_.cloneDeep(Operations.MasterFilter[id]));
                        if (!changed)
                            changed = true;
                    }
                }
            }
        }
        if (changed) {
            var finalData = _.cloneDeep(widget.OrginalDatasource);
            if (widget.FilterString && widget.FilterString.length > 3) {
                finalData = this.FilterByString(widget.FilterString, finalData);
            }
            widget.Datasource = this.FilterLists(operate, finalData);
            this.BuildWidget(widget);
        }
        else if (Updating) {
            var finalData = _.cloneDeep(widget.OrginalDatasource);
            if (widget.FilterString && widget.FilterString.length > 3) {
                finalData = this.FilterByString(widget.FilterString, finalData);
            }
            widget.Datasource = finalData;
            this.BuildWidget(widget);
        }
    };
    Operations.prototype.formatDate = function (date, Type, dashes) {
        if (dashes === void 0) { dashes = true; }
        var dat = new Date(date);
        var DateFormated = "";
        if (!dashes) {
            if (Type == dashboard_data_fields_1.DateGroupEnum.MonthYear) {
                DateFormated += "Year_" + (dat.getFullYear()).toString();
                DateFormated += "_" + (dat.getMonth() + 1).toString();
            }
            else if (Type == dashboard_data_fields_1.DateGroupEnum.QuarterYear) {
                DateFormated += "Year_" + (dat.getFullYear()).toString();
                DateFormated += "_" + "Quarter_" + (_.ceil((dat.getMonth() + 1) / 3)).toString();
            }
            else if (Type == dashboard_data_fields_1.DateGroupEnum.none) {
                DateFormated += "Year_" + (dat.getFullYear()).toString();
                DateFormated += "_" + (dat.getMonth() + 1).toString();
                DateFormated += "_" + (dat.getDay()).toString();
            }
            else if (Type == dashboard_data_fields_1.DateGroupEnum.Year) {
                DateFormated += "Year_" + (dat.getFullYear()).toString();
            }
            else if (Type == dashboard_data_fields_1.DateGroupEnum.Month) {
                DateFormated = dash.monthNames[(dat.getMonth() + 1)];
            }
        }
        else {
            if (Type == dashboard_data_fields_1.DateGroupEnum.QuarterYear) {
                DateFormated = dat.getFullYear().toString();
                DateFormated += "/ Q " + (_.ceil((dat.getMonth() + 1) / 3)).toString();
            }
            else if (Type == dashboard_data_fields_1.DateGroupEnum.MonthYear) {
                DateFormated = dat.getFullYear().toString();
                DateFormated += "/" + (dat.getMonth() + 1).toString();
            }
            else if (Type == dashboard_data_fields_1.DateGroupEnum.none) {
                DateFormated = dat.getFullYear().toString();
                DateFormated += "/" + (dat.getMonth() + 1).toString();
                DateFormated += "/" + (dat.getDay()).toString();
            }
            else if (Type == dashboard_data_fields_1.DateGroupEnum.Month) {
                DateFormated = dash.monthNames[(dat.getMonth() + 1)];
            }
            else if (Type == dashboard_data_fields_1.DateGroupEnum.Year) {
                DateFormated = dat.getFullYear().toString();
            }
        }
        return DateFormated;
    };
    //wanna role 
    //private Sum(op: dash.MeasureOperation, GroupName: string) {
    //    var index = (GroupName + dash.QueryTypeEnum.Measure + op.Type + op.Field.StoredName);
    //    if (!this.cashe[index])
    //        this.cashe[index] = _.sumBy(this.DataAsGroups[GroupName], op.Field.StoredName);
    //    return this.cashe[index];
    //}
    //"sales > 5 && xsd<56 ! "
    /*
     list of -
     list of data 1 &   ID - Country - City
                         1    EGY      Cairo
                         2    EGY      Alexandria
                         3    USA      California
     list of data 2     Vendor
                        BMW
                        Mercedes
     Type: string or date group by ;
 
 
 
     Input Data
                      ID Country Vendor  Price
                       1  EGY    BMW      1000
                       1  EGY    Honda    500
                       2  USA    BMW     20000
     -------------------------------------------
     FilterString
 
     */
    ///olllllllllllllllld
    Operations.prototype.BuildGroups = function () {
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
    Operations.prototype.BuildGroupFields = function () {
        for (var _i = 0, _a = this.Fields; _i < _a.length; _i++) {
            var entity = _a[_i];
            if (entity.OperationType == dashboard_data_fields_1.OperationTypeEnum.Group) {
                this.GroupFields[entity.FieldName] = entity.DataType;
            }
        }
    };
    Operations.prototype.operate_v1 = function () {
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
                                newR[role.DisplayName] = this.GetCashe((inx1 + "sum" + field), group, field);
                            else if (role.MeasureType == dashboard_data_fields_1.Measure.Max) {
                                newR[role.DisplayName] = _.maxBy(group, field)[field];
                            }
                            else if (role.MeasureType == dashboard_data_fields_1.Measure.Min) {
                                newR[role.DisplayName] = _.minBy(group, field)[field];
                            }
                            else if (role.MeasureType == dashboard_data_fields_1.Measure.Average) {
                                newR[role.DisplayName] = this.average(inx1, "sum", field, group);
                            }
                            else if (role.MeasureType == dashboard_data_fields_1.Measure.Count) {
                                newR[role.DisplayName] = group.length;
                            }
                        }
                        else if (role.OperationType == dashboard_data_fields_1.OperationTypeEnum.Delta) {
                            newR[role.DisplayName] = this.Delta(inx1, inx1, field, role.DeltaTargetDataField, "sum");
                        }
                        else if (role.OperationType == dashboard_data_fields_1.OperationTypeEnum.DeltaGroup && (inx1 == role.DeltaGroupsTypeValue[0] || inx1 == role.DeltaGroupsTypeValue[1])) {
                            newR[role.DisplayName] = this.Delta(role.DeltaGroupsTypeValue[0], role.DeltaGroupsTypeValue[1], field, role.DeltaTargetDataField, "sum");
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
                            this.ExpressionTokens = this.Toknize(role.Expression);
                        }
                        var obj = {};
                        for (var i = 0; i < this.ExpressionTokens.length; i++) {
                            obj[this.ExpressionTokens[i]] = this.GetCashe((inx1 + "sum" + this.ExpressionTokens[i]), group, this.ExpressionTokens[i]);
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
    //by equtin
    Operations.prototype.FilterByString = function (FilterString, data) {
        if (FilterString.length > 3)
            return jQuery.grep(data, function (o) { return eval(FilterString); });
    };
    Operations.prototype.FilterAndGroup = function (FilterString, GroupOptions, Data, FilterFirst) {
        if (FilterFirst === void 0) { FilterFirst = 1; }
        if (FilterFirst) {
            return this.GroupBy(GroupOptions, this.FilterByString(FilterString, Data));
        }
        else
            return this.FilterByString(FilterString, this.GroupBy(GroupOptions, Data));
    };
    //filter List
    Operations.prototype.FilterLists = function (FilterList, Datasource) {
        //console.log(FilterList);
        var data = _.cloneDeep(Datasource);
        //console.log(data)
        var Filtered = [];
        for (var _i = 0, data_3 = data; _i < data_3.length; _i++) {
            var row = data_3[_i];
            var isValid = true;
            for (var list in FilterList) {
                isValid = (isValid && this.probertyFilter(FilterList[list], row));
            }
            if (isValid)
                Filtered.push(row);
        }
        //console.log(Filtered)
        return Filtered;
    };
    Operations.prototype.probertyFilter = function (list, data) {
        if (list.length == 0)
            return true;
        for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
            var obj = list_1[_i];
            var acepted = true;
            for (var head in obj) {
                if (data.hasOwnProperty(head)) {
                    if (dash.DataTypeEnum[typeof (obj[head])] != dash.DataTypeEnum.object) {
                        if (obj[head] != data[head]) {
                            acepted = false;
                            break;
                        }
                    }
                    else {
                        if (obj[head].date != this.formatDate(data[head], obj[head].type)) {
                            {
                                acepted = false;
                                break;
                            }
                        }
                    }
                }
            }
            if (acepted)
                return true;
        }
        if (!acepted)
            return false;
        return true;
    };
    Operations.prototype.average = function (index, type, field, obj) {
        if (!this.cashe[index + "avg" + field])
            this.cashe[index + "avg" + field] = this.GetCashe((index + type + field), obj, field) / obj.length;
        return this.cashe[index + "avg" + field];
    };
    Operations.prototype.Delta = function (index1, index2, base, target, type) {
        if (!this.cashe[index1 + index2 + "delta" + base + target])
            this.cashe[index1 + index2 + "delta" + base + target] = _.round((this.GetCashe((index1 + type + base), this.DataAsGroups[index1], base) / this.GetCashe((index2 + type + target), this.DataAsGroups[index2], target) - 1) * 100, 2);
        return this.cashe[index1 + index2 + "delta" + base + target];
    };
    Operations.prototype.GetCashe = function (index, Obj, field) {
        if (!this.cashe[index])
            this.cashe[index] = _.sumBy(Obj, field);
        return this.cashe[index];
    };
    Operations.prototype.IsAlpha = function (ch) {
        return ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z'));
    };
    Operations.prototype.constructFilterString = function (expr, obj) {
        var res = "";
        for (var i = 0; i < expr.length; i++) {
            if (expr[i] == '\'') {
                res += expr[i++];
                while (expr[i] != '\'' && i < expr.length) {
                    res += expr[i++];
                }
                if (expr[i] == '\'')
                    res += expr[i];
            }
            else if (this.IsAlpha(expr[i] || expr[i] == '_')) {
                var buffer = "";
                while (this.IsAlpha(expr[i] || expr[i] == '_') && i < expr.length) {
                    buffer += expr[i++];
                }
                if (buffer == "and")
                    res += " && ";
                else if (buffer == "or")
                    res += " || ";
                else {
                    res += obj + buffer;
                }
                i--;
            }
            else
                res += expr[i];
        }
        return res;
    };
    Operations.prototype.GroupBy = function (fields, Data) {
        this.FinalView = [];
        this.cashe = {};
        this.DataAsGroups = [];
        this.GroupFields = [];
        this.ExpressionTokens = [];
        this.Fields = fields;
        this.data = Data;
        // this.BuildGroupFields();
        this.BuildGroups();
        // //console.log(this.DataAsGroups);
        this.operate_v1();
        return this.FinalView;
    };
    Operations.MasterFilter = [];
    Operations.MasterFilterListIDs = [];
    return Operations;
}());
exports.Operations = Operations;
