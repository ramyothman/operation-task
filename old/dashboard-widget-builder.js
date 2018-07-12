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
var dashboard_widget_model_1 = require("./dashboard.model/dashboard-widget.model");
var dashboard_widget_type_enum_1 = require("./dashboard.model/dashboard-widget-type.enum");
var dash = require("./dashboard.model/dashboard-data-fields");
var numeral = require("numeral");
var dashboard_grouping_manager_model_1 = require("./dashboard-grouping-manager.model");
var dashboard_serise_manager_1 = require("./dashboard-serise-manager");
var dashboard_label_manager_1 = require("./dashboard-label-manager");
var dashboard_cache_model_1 = require("./dashboard-cache.model");
var expr_eval_1 = require("expr-eval");
var dashboard_helper_1 = require("./dashboard.helper");
var _ = require("lodash");
var DashBoardWidgetBuilder = /** @class */ (function () {
    function DashBoardWidgetBuilder(widget) {
        this.mapFromEnumToFuncName = new Map(); //  initializes the map pair that contain <Enum, FunctionName> pairs
        this.colors = ['#27ae60', '#2980b9', '#8e44ad', '#e74c3c', '#f1c40f', '#f39c12', '#2c3e50'];
        this.cache = dashboard_cache_model_1.Cache.getInstance;
        this.widget = widget;
        this.intialize();
    }
    DashBoardWidgetBuilder.prototype.intialize = function () {
        this.addNewTypeToMap(dashboard_widget_type_enum_1.DashboardWidgetTypeEnum.ActiveTotalChart, 'buildActiveTotalChart');
        this.addNewTypeToMap(dashboard_widget_type_enum_1.DashboardWidgetTypeEnum.DigitChart, 'buildDigitChart');
        this.addNewTypeToMap(dashboard_widget_type_enum_1.DashboardWidgetTypeEnum.Gauge, 'BuildGauge');
        this.addNewTypeToMap(dashboard_widget_type_enum_1.DashboardWidgetTypeEnum.Grid, 'BuildGrid');
        this.addNewTypeToMap(dashboard_widget_type_enum_1.DashboardWidgetTypeEnum.Pivot, 'buildPivot');
        this.addNewTypeToMap(dashboard_widget_type_enum_1.DashboardWidgetTypeEnum.PieChart, 'BuildPieChart_chartjs');
        this.addNewTypeToMap(dashboard_widget_type_enum_1.DashboardWidgetTypeEnum.BarChart, 'buildExpBarChart');
    };
    DashBoardWidgetBuilder.prototype.addNewTypeToMap = function (newEnum, funcName) {
        this.mapFromEnumToFuncName.set(newEnum, "this." + funcName + "()");
    };
    DashBoardWidgetBuilder.prototype.checkDataSource = function () {
        if (!this.widget.Datasource)
            alert("no DataSource");
    };
    DashBoardWidgetBuilder.prototype.build = function () {
        this.checkDataSource();
        if (this.widget.Operations == null) {
            return;
        }
        if (this.widget.WidgetType == dashboard_widget_type_enum_1.DashboardWidgetTypeEnum.BarChart && !this.widget.ExpBar) {
            this.buildFlatCharts_chartjs();
        }
        else {
            eval(this.mapFromEnumToFuncName.get(this.widget.WidgetType));
        }
    };
    DashBoardWidgetBuilder.prototype.buildGrid = function () {
        //
        var Quries = this.widget.Operations;
        var Datasource = this.widget.Datasource;
        this.cache.resetCache(); //this.restCashe();//Cache.getInstance.resetCache(); //this.cashe = [];   
        var datav = Datasource.slice();
        var res = dashboard_grouping_manager_model_1.GroupingManager.getInstance.prepareGroups(Quries, datav); //PrepareGroups(Quries, datav);
        this.widget.CurrentData = this.operate_v2(Quries, res);
    };
    DashBoardWidgetBuilder.prototype.buildPivot = function () {
        var DataSource;
        DataSource = {
            fields: this.widget.Operations,
            store: this.widget.Datasource
        };
        this.widget.CurrentData = DataSource;
    };
    DashBoardWidgetBuilder.prototype.buildPieChart_chartjs = function () {
        var Quries = this.widget.Operations;
        var DatasourceOrg = this.widget.Datasource;
        var PreparedSerises = dashboard_serise_manager_1.SeriseManager.getInstance.prepareSerise_withFields(Quries, DatasourceOrg, true); //this.prepareSerise_withFields(Quries, DatasourceOrg, true);
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
        for (var _i = 0, Quries_1 = Quries; _i < Quries_1.length; _i++) {
            var i = Quries_1[_i];
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
                var res = dashboard_grouping_manager_model_1.GroupingManager.getInstance.prepareGroupsWithFields(Quries, Datasource[i], true); //this.PrepareGroups_withFields(Quries, Datasource[i], true);
                if (!groupFields || !groupFields.length)
                    groupFields = res.GroupsValue;
                else
                    groupFields = dashboard_grouping_manager_model_1.GroupingManager.getInstance.concatDistinctGroups(groupFields, res.GroupsValue); //this.ConcatDistinctroups(groupFields, res.GroupsValue);
                var index = 0;
                for (var _a = 0, agro_1 = agro; _a < agro_1.length; _a++) {
                    var agrument = agro_1[_a];
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
                var res_1 = dashboard_grouping_manager_model_1.GroupingManager.getInstance.prepareGroupsWithFields(Quries, Datasource[i], true); //this.PrepareGroups_withFields(Quries, Datasource[i], true);
                this.cache.resetCache(); //this.restCashe();//Cache.getInstance.resetCache();
                var serName = "";
                if (ser.length > 0)
                    serName = i;
                if (!groupFields || !groupFields.length)
                    groupFields = res_1.GroupsValue;
                else
                    groupFields = dashboard_grouping_manager_model_1.GroupingManager.getInstance.concatDistinctGroups(groupFields, res_1.GroupsValue); //this.ConcatDistinctroups(groupFields, res.GroupsValue);
                var x = this.operate_Chartjse(Quries, res_1.data, serName, seperation[seperationCounter++], res_1.GroupKeyValue);
                datasets = datasets.concat(x);
            }
            // serise modifiy if no serise 
            //checking groups
            result.push([]);
            //  seperationCounter=0
            if (groups.length == 0) {
                var label = [];
                var data_1 = [];
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
    DashBoardWidgetBuilder.prototype.buildExpBarChart = function () {
        var Quries = this.widget.Operations;
        var DatasourceOrg = this.widget.Datasource;
        var actual;
        var target;
        var groupField;
        // debugger;
        for (var _i = 0, Quries_2 = Quries; _i < Quries_2.length; _i++) {
            var q = Quries_2[_i];
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
            this.buildFlatCharts_chartjs();
            return; // buildFlatChart_chartjs already has last 4 lines
        }
        var T = dashboard_grouping_manager_model_1.GroupingManager.getInstance.prepareGroupsWithFields([groupField], DatasourceOrg); //this.PrepareGroups_withFields([groupField], DatasourceOrg);
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
        this.widget.CurrentData = new dashboard_widget_model_1.widgetData(labels, dataset, [], T.GroupsValue, measureFields, []);
        this.widget.syncLabels(this.widget.CurrentData.labels);
        dashboard_label_manager_1.LabelManager.getInstance.reSortLabels(this.widget); //this.reSortLabels(this.widget);
        this.widget.BuildSchema();
        this.widget.UpdateColors();
    };
    DashBoardWidgetBuilder.prototype.buildFlatCharts_chartjs = function () {
        var Quries = this.widget.Operations;
        var DatasourceOrg = this.widget.Datasource;
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
                    DatasourceOrg.sort(function (a, b) { return a[i_1.Operation.Field.StoredName] - b[i_1.Operation.Field.StoredName]; });
                if (!measureFields)
                    measureFields = new dashboard_data_fields_1.DimensionField("Measure", dash.QueryTypeEnum.Measure, new Array(), false);
                measureFields.value.push(i_1.Operation.GetFieldName());
            }
        };
        for (var _i = 0, Quries_3 = Quries; _i < Quries_3.length; _i++) {
            var i_1 = Quries_3[_i];
            _loop_1(i_1);
        }
        if (ser.length) {
            var temp = dashboard_serise_manager_1.SeriseManager.getInstance.prepareSerise_withFields(ser, DatasourceOrg, true, false); //this.prepareSerise_withFields(ser, DatasourceOrg, true,false);
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
        this.widget.CurrentData = new dashboard_widget_model_1.widgetData(agruments, dataset, seriseFields, groupFields, measureFields, additionalData);
        this.widget.syncLabels(this.widget.CurrentData.labels);
        //this.reSortLabels(this.widget);
        dashboard_label_manager_1.LabelManager.getInstance.reSortLabels(this.widget);
        this.widget.BuildSchema();
        this.widget.UpdateColors();
    };
    DashBoardWidgetBuilder.prototype.buildDigitChart = function () {
        var Quries = this.widget.Operations;
        var DatasourceOrg = this.widget.Datasource;
        var result = this.operate_v2(Quries, [DatasourceOrg], false);
        var target = 0;
        var actual = 0;
        if (result && result.length > 0)
            for (var _i = 0, Quries_4 = Quries; _i < Quries_4.length; _i++) {
                var Q = Quries_4[_i];
                if (Q.QueryType == dash.QueryTypeEnum.Measure) {
                    if (Q.QuerySubType == dash.QuerySubTypeEnum.DigitActual)
                        actual = +result[0][Q.Operation.GetFieldName()];
                    else if (Q.QuerySubType == dash.QuerySubTypeEnum.DigitTarget)
                        target = +result[0][Q.Operation.GetFieldName()];
                }
            }
        this.widget.CurrentData = numeral(actual - target).format('0.0a');
    };
    DashBoardWidgetBuilder.prototype.buildActiveTotalChart = function () {
        var Quries = this.widget.Operations;
        var Datasource = this.widget.Datasource;
        var result = [];
        var Active = 0;
        var total = 0;
        //debugger;
        var Measure = [];
        var Group = [];
        for (var _i = 0, Quries_5 = Quries; _i < Quries_5.length; _i++) {
            var Q = Quries_5[_i];
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
        var ans = dashboard_grouping_manager_model_1.GroupingManager.getInstance.prepareGroups(Group, Datasource, true); //this.PrepareGroups(Group, Datasource, true);
        ans = this.operate_v2(Measure.concat(Group), ans);
        for (var _a = 0, Quries_6 = Quries; _a < Quries_6.length; _a++) {
            var Q = Quries_6[_a];
            if (ans && ans[0] && Q.QueryType == dash.QueryTypeEnum.ActiveTotal) {
                Active = ans[0][Q.Operation.ActualField.GetFieldName()] || 0;
                total = ans[0][Q.Operation.TargetField.GetFieldName()] || 0;
                result.push({ "Query": Q, "active": Active, "total": total });
            }
        }
        console.log(result);
        this.widget.CurrentData = result;
    };
    DashBoardWidgetBuilder.prototype.buildGauge = function () {
        var Queries = this.widget.Operations;
        var dataSource = this.widget.Datasource;
        var serise = dashboard_grouping_manager_model_1.GroupingManager.getInstance.prepareGroups(Queries, dataSource); //this.PrepareGroups(Queries, dataSource);
        var layers = [];
        //    debugger;
        for (var _i = 0, Queries_1 = Queries; _i < Queries_1.length; _i++) {
            var Q = Queries_1[_i];
            if (Q.QueryType == dash.QueryTypeEnum.Delta) {
                var currentLayer = [];
                for (var index in serise) {
                    var name_2 = "";
                    this.cache.resetCache(); //this.restCashe(); // Cache.getInstance.resetCache();
                    var value = this.delta_v1(Q.Operation, index, index, serise);
                    if (index != "0")
                        name_2 = index;
                    var actualSum = this.agro(Q.Operation.ActualField, index, serise) || 0;
                    var TargetSum = this.agro(Q.Operation.TargetField, index, serise) || 0;
                    currentLayer.push({ 'name': name_2, 'value': value, 'TargetValue': TargetSum, 'ActualValue': actualSum });
                }
                layers.push({ "name": Q.Operation.GetFieldName(), "data": currentLayer });
            }
        }
        //   debugger;
        this.widget.CurrentData = layers;
    };
    DashBoardWidgetBuilder.prototype.buildFlatCharts = function () {
        var Quries = this.widget.Operations;
        var Datasource = this.widget.Datasource;
        this.cache.resetCache(); //this.cashe = [];// Cache.getInstance.resetCache();
        var groups = [];
        var agro = [];
        var ser = [];
        var final = [];
        var result = [];
        var agruments = [];
        var all_serise = [];
        for (var _i = 0, Quries_7 = Quries; _i < Quries_7.length; _i++) {
            var i_2 = Quries_7[_i];
            if (i_2.QueryType == dash.QueryTypeEnum.Group)
                groups.push(i_2);
            else if (i_2.QueryType == dash.QueryTypeEnum.Serise)
                ser.push(i_2);
            else
                agro.push(i_2);
        }
        Datasource = dashboard_grouping_manager_model_1.GroupingManager.getInstance.prepareGroups(groups, Datasource, true); //this.PrepareGroups(groups, Datasource,true);
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
    DashBoardWidgetBuilder.prototype.buildPieChart = function () {
        var Quries = this.widget.Operations;
        var Datasource = this.widget.Datasource;
        Datasource = dashboard_serise_manager_1.SeriseManager.getInstance.prepareSerise(Quries, Datasource, true); //this.prepareSerise(Quries, Datasource,true);
        this.cache.resetCache(); //this.cashe = [];//Cache.getInstance.resetCache();
        var groups = [];
        var agro = [];
        var ser = [];
        var final = [];
        var result = [];
        var ans = [];
        for (var _i = 0, Quries_8 = Quries; _i < Quries_8.length; _i++) {
            var i = Quries_8[_i];
            if (i.QueryType == dash.QueryTypeEnum.Group)
                groups.push(i);
            else if (i.QueryType == dash.QueryTypeEnum.Serise)
                ser.push(i);
            else
                agro.push(i);
        }
        for (var i in Datasource) {
            var res = dashboard_grouping_manager_model_1.GroupingManager.getInstance.prepareGroups(Quries, Datasource[i], true); //this.PrepareGroups(Quries, Datasource[i],true); 
            this.cache.resetCache(); //this.restCashe();//Cache.getInstance.resetCache();
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
                for (var _a = 0, agro_2 = agro; _a < agro_2.length; _a++) {
                    var agrument = agro_2[_a];
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
            for (var _d = 0, agro_3 = agro; _d < agro_3.length; _d++) {
                var agrument = agro_3[_d];
                layers.push(this.construct_layer(final, agrument));
            }
        }
        else {
            var se = 0;
            for (var serise in final) {
                result.push([]);
                for (var _e = 0, agro_4 = agro; _e < agro_4.length; _e++) {
                    var agrument = agro_4[_e];
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
        this.widget.CurrentData = layers;
    };
    DashBoardWidgetBuilder.prototype.agro = function (op, GroupName, GroupData, LastGroupName, target) {
        if (GroupName === void 0) { GroupName = ""; }
        if (LastGroupName === void 0) { LastGroupName = ""; }
        if (target === void 0) { target = 0; }
        var group = GroupData || new Array();
        var field = op.Field.StoredName;
        var index = (GroupName + dash.QueryTypeEnum.Measure + op.Type + field);
        var lastIndex = (LastGroupName + dash.QueryTypeEnum.Measure + op.Type + field);
        if (!this.cache.getCacheValue(index)) { //this.cashe[index]) {
            if (op.Type == dash.Measure.Sum) {
                // this.cashe[index] = _.sumBy(group, field);
                this.cache.setCache(index, _.sumBy(group, field));
            }
            else if (op.Type == dash.Measure.Average) {
                var sumIT = Object.assign({}, op);
                sumIT.Type = dash.Measure.Sum;
                var length_1 = (group) ? group.length : 0;
                // this.cashe[index] = this.agro(sumIT, GroupName, GroupData) / group.length;
                this.cache.setCache(index, this.agro(sumIT, GroupName, GroupData) / group.length);
            }
            else if (op.Type == dash.Measure.Max) {
                // this.cashe[index] = _.maxBy(group, field)[field];
                this.cache.setCache(index, _.maxBy(group, field)[field]);
            }
            else if (op.Type == dash.Measure.Min) {
                // this.cashe[index] = _.minBy(group, field)[field];
                this.cache.setCache(index, _.minBy(group, field)[field]);
            }
            else if (op.Type == dash.Measure.Count) {
                // this.cashe[index] = group.length;
                this.cache.setCache(index, group.length);
            }
            else if (op.Type == dash.Measure.Accumulative) {
                // this.cashe[index] = _.sumBy(group, field);
                this.cache.setCache(index, _.sumBy(group, field));
                if (LastGroupName.length) {
                    // this.cashe[index] += +this.cashe[lastIndex];
                    this.cache.setCache(index, this.cache.getCacheValue(index) + +this.cache.getCacheValue(lastIndex));
                }
            }
            else if (op.Type == dash.Measure.Target) {
                // this.cashe[index] = (target/365)*30;
                this.cache.setCache(index, (target / 365) * 30);
                if (LastGroupName.length) {
                    // this.cashe[index] += +this.cashe[lastIndex];
                    this.cache.setCache(index, this.cache.getCacheValue(index) + +this.cache.getCacheValue(lastIndex));
                }
            }
        }
        return this.cache.getCacheValue(index); //this.cashe[index];
    }; // in helper already delete it 
    DashBoardWidgetBuilder.prototype.delta_v1 = function (op, GroupName1, GroupName2, Groups) {
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
    }; // in helper already delete it 
    DashBoardWidgetBuilder.prototype.operate_Chartjse = function (Roles, DataSource, seriseName, seriseSeperation, GroupSeperation, additionalData) {
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
            var data_2 = [];
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
                data_2.push(temp);
                labels.push(temp.x);
                colors.push(this.colors[colorsCounter % this.colors.length]);
                colorsCounter++;
                sepCounter++;
                lastGroup = inx1;
            }
            var label = seriseName;
            if (label.length)
                label + " - ";
            dataset.push({ "label": label + role.Operation.Field.FieldName, type: dash.chartType[role.OptionalType], 'data': data_2, 'Field': role.Operation.Field, 'serise': seriseName, 'serisList': seriseSeperation, 'backgroundColor': colors, "labels": labels, "role": role });
        }
        //    console.log(dataset);
        return dataset;
    };
    DashBoardWidgetBuilder.prototype.construct_layer = function (data, agrument) {
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
    }; // helper class
    DashBoardWidgetBuilder.prototype.sortXY = function (data, agru, last) {
        if (last === void 0) { last = []; }
        var counter = 0;
        var prioiry = [];
        // debugger;
        for (var _i = 0, agru_1 = agru; _i < agru_1.length; _i++) {
            var label = agru_1[_i];
            prioiry[label] = counter++;
        }
        var setcounter = 0;
        for (var _a = 0, data_3 = data; _a < data_3.length; _a++) {
            var set = data_3[_a];
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
    }; // helper class delete it 
    DashBoardWidgetBuilder.prototype.operate_v2 = function (Roles, DataSource, formatNumbers, withIndex, seriseIsGroups, HideGroupValue) {
        if (formatNumbers === void 0) { formatNumbers = true; }
        var result = [];
        var ExpressionTokens = [];
        var count1 = 0;
        this.cache.resetCache(); //this.restCashe();//Cache.getInstance.resetCache();
        for (var _i = 0, Roles_2 = Roles; _i < Roles_2.length; _i++) {
            var role = Roles_2[_i];
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
                    newR[role.Operation.Field.FieldName] = this.agro(role.Operation, inx1, group);
                }
                else if (role.QueryType == dash.QueryTypeEnum.Delta && !newR[role.Operation.FieldName]) {
                    if (role.Operation.ActualGroup == inx1 || role.Operation.TargetGroup == inx1) {
                        var ans = this.delta_v1(role.Operation, role.Operation.ActualGroup || role.Operation.TargetGroup, role.Operation.TargetGroup || role.Operation.ActualGroup, DataSource);
                        newR[role.Operation.Field.FieldName] = ans;
                    }
                    else {
                        var ans = this.delta_v1(role.Operation, inx1, inx1, DataSource);
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
    DashBoardWidgetBuilder.prototype.sparkLine = function (Field, Agru, data) {
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
    return DashBoardWidgetBuilder;
}());
exports.DashBoardWidgetBuilder = DashBoardWidgetBuilder;
