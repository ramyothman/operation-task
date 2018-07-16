"use strict";
exports.__esModule = true;
var dashboard_widget_model_1 = require("./dashboard.model/dashboard-widget.model");
var dashboard_grouping_manager_model_1 = require("./dashboard-grouping-manager.model");
var dashboard_serise_manager_1 = require("./dashboard-serise-manager");
var dashboard_data_fields_1 = require("./dashboard.model/dashboard-data-fields");
var dash = require("./dashboard.model/dashboard-data-fields");
var expr_eval_1 = require("expr-eval");
var dashboard_label_manager_1 = require("./dashboard-label-manager");
var dashboard_helper_1 = require("./dashboard.helper");
var dashboard_cache_model_1 = require("./dashboard-cache.model");
var _ = require("lodash");
// to build chart js
var chartJsBuilder = /** @class */ (function () {
    function chartJsBuilder(widget) {
        this.colors = ['#27ae60', '#2980b9', '#8e44ad', '#e74c3c', '#f1c40f', '#f39c12', '#2c3e50'];
        this.cache = dashboard_cache_model_1.Cache.getInstance;
        this.widget = widget;
        this.queries = widget.Operations;
        this.dataSource = widget.Datasource;
    }
    chartJsBuilder.prototype.buildPieChart = function () {
        // let this.queries = this.widget.Operations;
        //let this.dataSource = this.widget.Datasource;
        var PreparedSerises = dashboard_serise_manager_1.SeriseManager.getInstance.prepareSerise_withFields(this.queries, this.dataSource, true); //this.prepareSerise_withFields(this.queries, this.dataSource, true);
        var seperation = PreparedSerises.GroupKeyValue;
        var seperationCounter = 0;
        var serisesList = PreparedSerises.GroupsValue;
        var measureFields;
        var groupFields;
        //  debugger;
        var Datasource = PreparedSerises.data;
        this.cache.resetCache(); //this.cashe = [] // Cache.getInstance.resetCache();
        var groups = [];
        var agro = [];
        var ser = [];
        var datasets = [];
        var result = [];
        var ans = [];
        var layers = [];
        for (var _i = 0, _a = this.queries; _i < _a.length; _i++) {
            var i = _a[_i];
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
                var res = dashboard_grouping_manager_model_1.GroupingManager.getInstance.prepareGroupsWithFields(this.queries, Datasource[i], true); //this.PrepareGroups_withFields(this.queries, Datasource[i], true);
                if (!groupFields || !groupFields.length)
                    groupFields = res.GroupsValue;
                else
                    groupFields = dashboard_grouping_manager_model_1.GroupingManager.getInstance.concatDistinctGroups(groupFields, res.GroupsValue); //this.ConcatDistinctroups(groupFields, res.GroupsValue);
                var index = 0;
                for (var _b = 0, agro_1 = agro; _b < agro_1.length; _b++) {
                    var agrument = agro_1[_b];
                    if (!layers[index])
                        layers[index] = [];
                    var T = this.operate_Chartjse([agrument], res.data, i, seperation[seperationCounter++], res.GroupKeyValue);
                    if (T)
                        layers[index] = layers[index].concat(T);
                    index++;
                }
            }
            console.log(layers);
            this.widget.CurrentData = new dashboard_widget_model_1.widgetData([], layers, serisesList, groupFields, measureFields, []);
            //return; // here
        }
        else {
            for (var i in Datasource) {
                var res_1 = dashboard_grouping_manager_model_1.GroupingManager.getInstance.prepareGroupsWithFields(this.queries, Datasource[i], true); //this.PrepareGroups_withFields(this.queries, Datasource[i], true);
                this.cache.resetCache(); //this.restCashe();//Cache.getInstance.resetCache();
                var serName = "";
                if (ser.length > 0)
                    serName = i;
                if (!groupFields || !groupFields.length)
                    groupFields = res_1.GroupsValue;
                else
                    groupFields = dashboard_grouping_manager_model_1.GroupingManager.getInstance.concatDistinctGroups(groupFields, res_1.GroupsValue); //this.ConcatDistinctroups(groupFields, res.GroupsValue);
                var x = this.operate_Chartjse(this.queries, res_1.data, serName, seperation[seperationCounter++], res_1.GroupKeyValue);
                datasets = datasets.concat(x);
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
                        for (var _c = 0, _d = result[index].data; _c < _d.length; _c++) {
                            var row = _d[_c];
                            row.x = result[index].Field.FieldName;
                        }
                        continue;
                    }
                    //debugger;
                    result[index].backgroundColor.concat(datasets[i].backgroundColor);
                    for (var _e = 0, _f = datasets[i].data; _e < _f.length; _e++) {
                        var row = _f[_e];
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
            this.widget.CurrentData = new dashboard_widget_model_1.widgetData([], layers, serisesList, groupFields, measureFields, []);
        }
        // serise modifiy if no serise 
        //checking groups
        //  seperationCounter=0
        if (!this.widget.selectedArgument && !this.widget.selectedArgument && !this.widget.selectedSerise.length && !this.widget.selectedArgument.length)
            this.widget.selectedArgument = this.widget.CurrentData.agrument; //data.agrument;
        //  console.log(widget.CurrentData);
        this.widget.BuildSchema();
    };
    chartJsBuilder.prototype.buildFlatChart = function () {
        //let this.queries = this.widget.Operations;
        // let this.dataSource = this.widget.Datasource;
        this.cache.resetCache(); //this.cashe = [];//Cache.getInstance.resetCache();
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
        var _loop_1 = function (i_1) {
            if (i_1.QueryType == dash.QueryTypeEnum.Group)
                groups.push(i_1);
            else if (i_1.QueryType == dash.QueryTypeEnum.Serise)
                ser.push(i_1);
            else {
                agro.push(i_1);
                if (agro.length == 1)
                    this_1.dataSource.sort(function (a, b) { return a[i_1.Operation.Field.StoredName] - b[i_1.Operation.Field.StoredName]; });
                if (!measureFields)
                    measureFields = new dashboard_data_fields_1.DimensionField("Measure", dash.QueryTypeEnum.Measure, new Array(), false);
                measureFields.value.push(i_1.Operation.GetFieldName());
            }
        };
        var this_1 = this;
        for (var _i = 0, _a = this.queries; _i < _a.length; _i++) {
            var i_1 = _a[_i];
            _loop_1(i_1);
        }
        if (ser.length) {
            var temp = dashboard_serise_manager_1.SeriseManager.getInstance.prepareSerise_withFields(ser, this.dataSource, true, false); //this.prepareSerise_withFields(ser, this.dataSource, true,false);
            seriseFields = temp.GroupsValue;
            Datasource = temp.data;
            seperation = temp.GroupKeyValue;
        }
        else {
            Datasource = [];
            Datasource['all'] = this.dataSource;
        }
        var i = 0;
        //console.log(Datasource)
        seperationCounter = 0;
        for (var row in Datasource) {
            var T = dashboard_serise_manager_1.SeriseManager.getInstance.prepareSerise_withFields(groups, Datasource[row], true, false); //this.PrepareGroups_withFields(groups, Datasource[row], true,false);
            // debugger;
            if (!groupFields || !groupFields.length)
                groupFields = T.GroupsValue;
            else
                groupFields = dashboard_grouping_manager_model_1.GroupingManager.getInstance.concatDistinctGroups(groupFields, T.GroupsValue); //this.ConcatDistinctroups(groupFields, T.GroupsValue);
            if (groups.length > 0) {
                var _loop_2 = function (groupName) {
                    if (agruments.findIndex(function (x) { return x == groupName; }) == -1) {
                        agruments.push(groupName);
                    }
                };
                for (var groupName in T.data) {
                    _loop_2(groupName);
                }
            }
            else {
                var temp = T.data["0"];
                T.data = [];
                T.data["Total"] = temp;
                agruments.push("Total");
            }
            //  //debugger;
            var name_1 = "";
            if (row != 'all')
                name_1 = row;
            //debugger;
            this.cache.resetCache(); //this.restCashe();//Cache.getInstance.resetCache();
            var x = this.operate_Chartjse(groups.concat(agro), T.data, name_1, seperation[seperationCounter++], T.GroupKeyValue, additionalData);
            // debugger;
            for (var _b = 0, x_1 = x; _b < x_1.length; _b++) {
                var set = x_1[_b];
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
        dashboard_helper_1.sortXY(dataset, agruments, additionalData);
        //buil   debugger;
        this.widget.CurrentData = new dashboard_widget_model_1.widgetData(agruments, dataset, seriseFields, groupFields, measureFields, additionalData);
        this.widget.syncLabels(this.widget.CurrentData.labels);
        //this.reSortLabels(this.widget);
        dashboard_label_manager_1.LabelManager.getInstance.reSortLabels(this.widget);
        this.widget.BuildSchema();
        this.widget.UpdateColors();
    };
    chartJsBuilder.prototype.operate_Chartjse = function (Roles, DataSource, seriseName, seriseSeperation, GroupSeperation, additionalData) {
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
        this.cache.resetCache(); //this.restCashe();//Cache.getInstance.resetCache();
        for (var _i = 0, Roles_1 = Roles; _i < Roles_1.length; _i++) {
            var role = Roles_1[_i];
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
                    newCalculation = dashboard_helper_1.agro(role.Operation, inx1, group, lastGroup);
                }
                else if (role.QueryType == dash.QueryTypeEnum.calc) {
                    if (!ExpressionTokens.length) {
                        ExpressionTokens = dashboard_helper_1.toknize(role.Operation.Expression);
                    }
                    var obj = {};
                    for (var i = 0; i < ExpressionTokens.length; i++) {
                        // obj[ExpressionTokens[i]] = this.cashe[(inx1 + dash.QueryTypeEnum.Measure + dash.Measure.Sum + ExpressionTokens[i])] || (this.cashe[(inx1 + dash.QueryTypeEnum.Measure + dash.Measure.Sum + ExpressionTokens[i])] = _.sumBy(group, ExpressionTokens[i]));
                        if (!this.cache.getCacheValue(inx1 + dash.QueryTypeEnum.Measure + dash.Measure.Sum + ExpressionTokens[i])) {
                            this.cache.setCache(inx1 + dash.QueryTypeEnum.Measure + dash.Measure.Sum + ExpressionTokens[i], _.sumBy(group, ExpressionTokens[i]));
                        }
                        obj[ExpressionTokens[i]] = this.cache.getCacheValue(inx1 + dash.QueryTypeEnum.Measure + dash.Measure.Sum + ExpressionTokens[i]);
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
    chartJsBuilder.prototype.buildGridChart = function () {
        throw new Error("Method not implemented.");
    };
    chartJsBuilder.prototype.buildPivotChart = function () {
        throw new Error("Method not implemented.");
    };
    chartJsBuilder.prototype.buildExpBarChart = function () {
        throw new Error("Method not implemented.");
    };
    chartJsBuilder.prototype.buildDigitChart = function () {
        throw new Error("Method not implemented.");
    };
    chartJsBuilder.prototype.buildActiveTotalChart = function () {
        throw new Error("Method not implemented.");
    };
    chartJsBuilder.prototype.buildGaugeChart = function () {
        throw new Error("Method not implemented.");
    };
    return chartJsBuilder;
}());
exports.chartJsBuilder = chartJsBuilder;
