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
var dashboard_widget_model_1 = require("./dashboard.model/dashboard-widget.model");
var dashboard_cache_model_1 = require("./dashboard-cache.model");
var dashboard_grouping_manager_model_1 = require("./dashboard-grouping-manager.model");
var dash = require("./dashboard.model/dashboard-data-fields");
var dashboard_label_manager_1 = require("./dashboard-label-manager");
var dashboard_helper_1 = require("./dashboard.helper");
var dashboard_data_fields_1 = require("./dashboard.model/dashboard-data-fields");
var numeral = require("numeral");
var dashboard_serise_manager_1 = require("./dashboard-serise-manager");
var _ = require("lodash");
var expr_eval_1 = require("expr-eval");
var dashboard_chart_js_builder_1 = require("./dashboard-chart-js-builder");
// to build default chart 
var chartBuilder = /** @class */ (function () {
    function chartBuilder(widget) {
        this.cache = dashboard_cache_model_1.Cache.getInstance;
        this.widget = widget;
        this.queries = widget.Operations;
        this.dataSource = widget.Datasource;
    }
    chartBuilder.prototype.buildGridChart = function () {
        //
        //let this.queries = this.widget.Operations;
        //let this.dataSource = this.widget.Datasource;
        console.log("grid chart is here"); // for testing 
        this.cache.resetCache(); //this.restCashe();//Cache.getInstance.resetCache(); //this.cashe = [];   
        var datav = this.dataSource.slice();
        var res = dashboard_grouping_manager_model_1.GroupingManager.getInstance.prepareGroups(this.queries, datav); //PrepareGroups(this.queries, datav);
        this.widget.CurrentData = this.operate_v2(this.queries, res);
        console.log(this.widget.CurrentData);
    };
    chartBuilder.prototype.buildPivotChart = function () {
        //console.log("build pivot is here :D ");
        var DataSource;
        DataSource = {
            fields: this.queries,
            store: this.dataSource
        };
        console.log(DataSource); // for testing
        this.widget.CurrentData = DataSource;
    };
    chartBuilder.prototype.buildExpBarChart = function () {
        //let this.queries = this.widget.Operations;
        //let this.dataSource = this.widget.Datasource;
        if (!this.widget.ExpBar) {
            var chartJS = new dashboard_chart_js_builder_1.chartJsBuilder(this.widget);
            chartJS.buildFlatChart();
            return; // buildFlatChart_chartjs already has last 4 lines
        }
        var actual;
        var target;
        var groupField;
        // debugger;
        for (var _i = 0, _a = this.queries; _i < _a.length; _i++) {
            var q = _a[_i];
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
        if (!groupField || !actual || !target) {
            //this.buildFlatCharts_chartjs();
            var chartJS = new dashboard_chart_js_builder_1.chartJsBuilder(this.widget);
            chartJS.buildFlatChart();
            return; // buildFlatChart_chartjs already has last 4 lines
        }
        var T = dashboard_grouping_manager_model_1.GroupingManager.getInstance.prepareGroupsWithFields([groupField], this.dataSource); //this.PrepareGroups_withFields([groupField], this.dataSource);
        var DataSource = T.data;
        /**********************/ //
        this.cache.resetCache(); //this.restCashe();//Cache.getInstance.resetCache();
        var labels = dashboard_label_manager_1.LabelManager.getInstance.constructExpLabels(dash.DateGroupEnum.Month); //this.constructorExpLabels(dash.DateGroupEnum.Month);
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
        for (var _b = 0, labels_1 = labels; _b < labels_1.length; _b++) {
            var label = labels_1[_b];
            var groupSep = [];
            groupSep[groupField.Operation.Field.FieldName] = label;
            var targetValue = dashboard_helper_1.agro(target.Operation, label, DataSource[label], lastGroup, targetConst);
            var ActualValue = 0;
            var ExpValue = 0;
            if (dash.monthNames[label] <= month) {
                ActualValue = dashboard_helper_1.agro(actual.Operation, label, DataSource[label], lastGroup);
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
        this.widget.CurrentData = new dashboard_widget_model_1.widgetData(labels, dataset, [], T.GroupsValue, measureFields, []);
        this.widget.syncLabels(this.widget.CurrentData.labels);
        dashboard_label_manager_1.LabelManager.getInstance.reSortLabels(this.widget); //this.reSortLabels(this.widget);
        this.widget.BuildSchema();
        this.widget.UpdateColors();
    };
    chartBuilder.prototype.buildDigitChart = function () {
        //let this.queries = this.widget.Operations;
        //let this.dataSource = this.widget.Datasource;
        var result = this.operate_v2(this.queries, [this.dataSource], false);
        var target = 0;
        var actual = 0;
        if (result && result.length > 0)
            for (var _i = 0, _a = this.queries; _i < _a.length; _i++) {
                var Q = _a[_i];
                if (Q.QueryType == dash.QueryTypeEnum.Measure) {
                    if (Q.QuerySubType == dash.QuerySubTypeEnum.DigitActual)
                        actual = +result[0][Q.Operation.GetFieldName()];
                    else if (Q.QuerySubType == dash.QuerySubTypeEnum.DigitTarget)
                        target = +result[0][Q.Operation.GetFieldName()];
                }
            }
        this.widget.CurrentData = numeral(actual - target).format('0.0a');
    };
    chartBuilder.prototype.buildActiveTotalChart = function () {
        //   let this.queries = this.widget.Operations;
        // let this.dataSource = this.widget.Datasource;
        var result = [];
        var Active = 0;
        var total = 0;
        //debugger;
        var Measure = [];
        var Group = [];
        for (var _i = 0, _a = this.queries; _i < _a.length; _i++) {
            var Q = _a[_i];
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
        var ans = dashboard_grouping_manager_model_1.GroupingManager.getInstance.prepareGroups(Group, this.dataSource, true); //this.PrepareGroups(Group, this.dataSource, true);
        ans = this.operate_v2(Measure.concat(Group), ans);
        for (var _b = 0, _c = this.queries; _b < _c.length; _b++) {
            var Q = _c[_b];
            if (ans && ans[0] && Q.QueryType == dash.QueryTypeEnum.ActiveTotal) {
                Active = ans[0][Q.Operation.ActualField.GetFieldName()] || 0;
                total = ans[0][Q.Operation.TargetField.GetFieldName()] || 0;
                result.push({ "Query": Q, "active": Active, "total": total });
            }
        }
        console.log("the result is here" + result);
        this.widget.CurrentData = result;
    };
    chartBuilder.prototype.buildGaugeChart = function () {
        //   let this.queries = this.widget.Operations;
        // let this.dataSource = this.widget.Datasource;
        var serise = dashboard_grouping_manager_model_1.GroupingManager.getInstance.prepareGroups(this.queries, this.dataSource); //this.PrepareGroups(this.queries, dataSource);
        var layers = [];
        //    debugger;
        for (var _i = 0, _a = this.queries; _i < _a.length; _i++) {
            var Q = _a[_i];
            if (Q.QueryType == dash.QueryTypeEnum.Delta) {
                var currentLayer = [];
                for (var index in serise) {
                    var name_1 = "";
                    this.cache.resetCache(); //this.restCashe(); // Cache.getInstance.resetCache();
                    var value = dashboard_helper_1.delta_v1(Q.Operation, index, index, serise);
                    if (index != "0")
                        name_1 = index;
                    var actualSum = dashboard_helper_1.agro(Q.Operation.ActualField, index, serise) || 0;
                    var TargetSum = dashboard_helper_1.agro(Q.Operation.TargetField, index, serise) || 0;
                    currentLayer.push({ 'name': name_1, 'value': value, 'TargetValue': TargetSum, 'ActualValue': actualSum });
                }
                layers.push({ "name": Q.Operation.GetFieldName(), "data": currentLayer });
            }
        }
        //   debugger;
        this.widget.CurrentData = layers;
    };
    chartBuilder.prototype.buildFlatChart = function () {
        // let this.queries = this.widget.Operations;
        //let this.dataSource = this.widget.Datasource;
        this.cache.resetCache(); //this.cashe = [];// Cache.getInstance.resetCache();
        var groups = [];
        var agro = [];
        var ser = [];
        var final = [];
        var result = [];
        var agruments = [];
        var all_serise = [];
        for (var _i = 0, _a = this.queries; _i < _a.length; _i++) {
            var i_1 = _a[_i];
            if (i_1.QueryType == dash.QueryTypeEnum.Group)
                groups.push(i_1);
            else if (i_1.QueryType == dash.QueryTypeEnum.Serise)
                ser.push(i_1);
            else
                agro.push(i_1);
        }
        var Datasource = dashboard_grouping_manager_model_1.GroupingManager.getInstance.prepareGroups(groups, this.dataSource, true); //this.PrepareGroups(groups, Datasource,true);
        var i = 0;
        //console.log(Datasource)
        for (var row in Datasource) {
            var res = dashboard_serise_manager_1.SeriseManager.getInstance.prepareSerise(ser, Datasource[row], true); //this.prepareSerise(ser, Datasource[row],true)
            agruments.push(row);
            this.cache.resetCache(); //this.restCashe();//Cache.getInstance.resetCache();
            final.push(this.operate_v2(ser.concat(agro), res, true, false, true, true));
        }
        final = dashboard_serise_manager_1.SeriseManager.getInstance.handleSerise(ser, final, agruments); //this.handleSerise(ser, final, agruments);
        //console.log(final);
        console.log(final);
        this.widget.CurrentData = final;
    };
    chartBuilder.prototype.operate_v2 = function (Roles, DataSource, formatNumbers, withIndex, seriseIsGroups, HideGroupValue) {
        if (formatNumbers === void 0) { formatNumbers = true; }
        var result = [];
        var ExpressionTokens = [];
        var count1 = 0;
        this.cache.resetCache(); //this.restCashe();//Cache.getInstance.resetCache();
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
                        recored = dashboard_helper_1.formatDate(group[0][role.Operation.Field.StoredName], role.Operation.Type);
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
                    newR[role.Operation.Field.FieldName] = dashboard_helper_1.agro(role.Operation, inx1, group);
                }
                else if (role.QueryType == dash.QueryTypeEnum.Delta && !newR[role.Operation.FieldName]) {
                    if (role.Operation.ActualGroup == inx1 || role.Operation.TargetGroup == inx1) {
                        var ans = dashboard_helper_1.delta_v1(role.Operation, role.Operation.ActualGroup || role.Operation.TargetGroup, role.Operation.TargetGroup || role.Operation.ActualGroup, DataSource);
                        newR[role.Operation.Field.FieldName] = ans;
                    }
                    else {
                        var ans = dashboard_helper_1.delta_v1(role.Operation, inx1, inx1, DataSource);
                        newR[role.Operation.Field.FieldName] = ans;
                    }
                }
                else if (role.QueryType == dash.QueryTypeEnum.Spark) {
                    newR[role.Operation.FieldName] = this.sparkLine(role.Operation.ActualField, role.Operation.ArgumentField, _.cloneDeep(group));
                }
                else if (role.QueryType == dash.QueryTypeEnum.Chart) {
                    // debugger;
                    var val = dashboard_helper_1.getRemainingDays(group[0][role.Operation.CompareDate.GetStoredName()], group[0][role.Operation.CompareToDate.GetStoredName()], role.Operation.DaysRange);
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
                    var val = dashboard_helper_1.agro(role.Operation, inx1, group);
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
                        ExpressionTokens = dashboard_helper_1.toknize(role.Operation.Expression);
                    }
                    var obj = {};
                    for (var i = 0; i < ExpressionTokens.length; i++) {
                        // obj[ExpressionTokens[i]] = this.cashe[(inx1 + dash.QueryTypeEnum.Measure + dash.Measure.Sum + ExpressionTokens[i])] || (this.cashe[(inx1 + dash.QueryTypeEnum.Measure + dash.Measure.Sum + ExpressionTokens[i])] = _.sumBy(group, ExpressionTokens[i]));
                        // test this
                        if (!this.cache.getCacheValue(inx1 + dash.QueryTypeEnum.Measure + dash.Measure.Sum + ExpressionTokens[i])) {
                            this.cache.setCache(inx1 + dash.QueryTypeEnum.Measure + dash.Measure.Sum + ExpressionTokens[i], _.sumBy(group, ExpressionTokens[i]));
                        }
                        obj[ExpressionTokens[i]] = this.cache.getCacheValue(inx1 + dash.QueryTypeEnum.Measure + dash.Measure.Sum + ExpressionTokens[i]);
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
    chartBuilder.prototype.sparkLine = function (Field, Agru, data) {
        Agru.Field.FieldName = "agrumentField";
        Field.Field.FieldName = "target";
        data = dashboard_grouping_manager_model_1.GroupingManager.getInstance.groupByOperations([Agru], data); //this.GroupBy_v1([Agru], data);
        data = dashboard_grouping_manager_model_1.GroupingManager.getInstance.sortGroups(data);
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
    chartBuilder.prototype.buildPieChart = function () {
        throw new Error("Method not implemented.");
    };
    return chartBuilder;
}());
exports.chartBuilder = chartBuilder;
