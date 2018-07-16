"use strict";
exports.__esModule = true;
var dashboard_widget_type_enum_1 = require("./dashboard-widget-type.enum");
var table_model_1 = require("./data-source-schema/table.model");
var view_model_1 = require("./data-source-schema/view.model");
var platte_model_1 = require("./platte.model");
var dashboard_data_fields_1 = require("./dashboard-data-fields");
var _ = require("lodash");
//import { BehaviorSubject } from 'rxjs/BehaviorSubject';
//import Chart from 'chart.js';
var dashboard_widget_chart_type_1 = require("./dashboard-widget-chart-type");
var DashboardWidget = /** @class */ (function () {
    function DashboardWidget() {
        this.AcceptFilter = [];
        this.FilterSelectionType = "none";
        this.ChartSeriseSelectionType = 'allArgumentPoints';
        this.table = new table_model_1.Table();
        this.view = new view_model_1.View();
        this.isTable = true;
        this.CenterRange = true;
        this.Operations = [];
        this.DataOperations = [];
        this.IsSelected = false;
        this.isNested = false;
        this.Stacked = false;
        this.ExpBar = false;
        this.selectedArgument = new Array(); //for coloring 
        this.selectedSerise = new Array(); // for coloring
        this.AutoColoredMeasure = false;
        this.ColorschemaList = new Array();
        this.colorCounter = 0;
        this.colorPlatte = [];
        this.WidgetType = dashboard_widget_type_enum_1.DashboardWidgetTypeEnum.None;
        this.WidgetChartType = dashboard_widget_chart_type_1.DashboardWidgetChartTypeEnum.echart; // new for chartType
        this.ColorContext = { $implicit: null };
        this.widgetLabels = [];
        this._fieldTypes = null;
        this._fields = null;
        this.ColumnFields = [];
        this.ValueFields = [];
        this.GroupByFields = [];
        this.XaxisFields = [];
        this.YaxisFields = [];
        this.random = [];
    }
    DashboardWidget.prototype.syncLabels = function (source) {
        if (!this.widgetLabels)
            this.widgetLabels = [];
        var newLB = [];
        var sync = [];
        var mx = 0;
        var _loop_1 = function (lb) {
            var index = this_1.widgetLabels.findIndex(function (x) { return x.label == lb; });
            if (index != -1) {
                sync.push(this_1.widgetLabels[index]);
                mx = Math.max(mx, this_1.widgetLabels[index].priority);
            }
            else
                newLB.push(lb);
        };
        var this_1 = this;
        for (var _i = 0, source_1 = source; _i < source_1.length; _i++) {
            var lb = source_1[_i];
            _loop_1(lb);
        }
        for (var _a = 0, newLB_1 = newLB; _a < newLB_1.length; _a++) {
            var row = newLB_1[_a];
            sync.push({ "label": row, "priority": mx++ });
        }
        //sync = sync.sort(function (a, b) {
        //  return a.priority - b.priority;
        //});
        this.widgetLabels = sync;
    };
    Object.defineProperty(DashboardWidget.prototype, "FieldTypes", {
        get: function () {
            if (this._fieldTypes == null) {
                var fieldTypes = [];
                switch (this.WidgetType) {
                    case dashboard_widget_type_enum_1.DashboardWidgetTypeEnum.Grid:
                        fieldTypes.push({ "name": 'Dimension', "class": 'dashboard-icn-dimensions', "type": dashboard_data_fields_1.QueryTypeEnum.Group });
                        fieldTypes.push({ "name": 'Measure', "class": 'dashboard-icn-pivot', "type": dashboard_data_fields_1.QueryTypeEnum.Measure });
                        fieldTypes.push({ "name": 'Delta', "class": 'dashboard-icn-delta', "type": dashboard_data_fields_1.QueryTypeEnum.Delta });
                        fieldTypes.push({ "name": 'Sparkline', "class": 'dashboard-icn-sparkline', "type": dashboard_data_fields_1.QueryTypeEnum.Spark });
                        fieldTypes.push({ "name": 'Chart', "class": 'dashboard-icn-bar-chart', "type": dashboard_data_fields_1.QueryTypeEnum.Chart });
                        fieldTypes.push({ "name": 'Bar Chart', "class": 'dashboard-icn-bar-chart', "type": dashboard_data_fields_1.QueryTypeEnum.BarChart });
                        //fieldTypes.push({ "name": 'Sparkline', "class": 'field-type-icon-calculatedField', "type": QueryTypeEnum.calc });
                        break;
                    case dashboard_widget_type_enum_1.DashboardWidgetTypeEnum.Pivot:
                        break;
                    case dashboard_widget_type_enum_1.DashboardWidgetTypeEnum.BarChart:
                        fieldTypes.push({ "name": 'Bar Chart', "class": 'dashboard-icn-bar-chart', "type": dashboard_data_fields_1.chartType.bar });
                        fieldTypes.push({ "name": 'Line Chart', "class": 'dashboard-icn-line', "type": dashboard_data_fields_1.chartType.line });
                        break;
                    case dashboard_widget_type_enum_1.DashboardWidgetTypeEnum.PieChart:
                    case dashboard_widget_type_enum_1.DashboardWidgetTypeEnum.ScatterChart:
                    case dashboard_widget_type_enum_1.DashboardWidgetTypeEnum.StatisticsChart:
                    case dashboard_widget_type_enum_1.DashboardWidgetTypeEnum.TreeChart:
                        break;
                    default:
                        break;
                }
                this._fieldTypes = fieldTypes;
            }
            return this._fieldTypes;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DashboardWidget.prototype, "Fields", {
        get: function () {
            if (this._fields == null) {
                var fields = [];
                /// debugger;
                if (this.isTable && this.table.Columns) {
                    for (var _i = 0, _a = this.table.Columns; _i < _a.length; _i++) {
                        var col = _a[_i];
                        var tt = col.ColumnDataType.LanguageSpecificType == "Date" ? "object" : col.ColumnDataType.LanguageSpecificType;
                        tt = col.ColumnDataType.LanguageSpecificType == "boolean" ? "number" : tt;
                        fields.push({ "name": col.Name, "type": dashboard_data_fields_1.DataTypeEnum[tt] });
                    }
                }
                else if (this.view.Columns) {
                    for (var _b = 0, _c = this.view.Columns; _b < _c.length; _b++) {
                        var col = _c[_b];
                        var tt = col.ColumnDataType.LanguageSpecificType == "Date" ? "object" : col.ColumnDataType.LanguageSpecificType;
                        tt = col.ColumnDataType.LanguageSpecificType == "boolean" ? "number" : tt;
                        fields.push({ "name": col.Name, "type": dashboard_data_fields_1.DataTypeEnum[tt] });
                    }
                }
                //  console.log(fields);
                this._fields = fields;
            }
            return this._fields;
        },
        set: function (d) {
            this._fields = d;
        },
        enumerable: true,
        configurable: true
    });
    DashboardWidget.prototype.DataSourceChanged = function () {
        this._fields = null;
        this._fieldTypes = null;
    };
    DashboardWidget.prototype.ChangeColor = function (serial, value) {
        this.colorPlatte[serial] = { "color": value, "setByUser": true };
        this.applayColors();
        this.updateChartsColor();
    };
    DashboardWidget.prototype.UpdateColors = function () {
        this.applayColors();
        this.updateChartsColor();
    };
    DashboardWidget.prototype.BuildSchema = function () {
        //s debugger
        this.colorCounter = 0;
        this.random = [];
        this.CombaineSelection();
        var all_Fields = [];
        if (this.selectedSerise) {
            all_Fields = all_Fields.concat(_.sortBy(this.selectedSerise, function (x) { return x.name; }));
        }
        if (this.selectedArgument) {
            all_Fields = all_Fields.concat(_.sortBy(this.selectedArgument, function (x) { return x.name; }));
        }
        if (!this.AutoColoredMeasure && this.CurrentData && this.CurrentData.fields) {
            all_Fields.push(this.CurrentData.fields);
        }
        if (all_Fields.length > 0) {
            schema.IDCounter = 0;
            this.ColorschemaList = this._rec(0, "", all_Fields);
            this.ColorContext.$implicit = this.ColorschemaList;
            this.applayColors();
            // console.log(this.colorPlatte);
            this.updateChartsColor();
        }
    };
    DashboardWidget.prototype.CombaineSelection = function () {
        //debugger;
        if (this.selectedSerise) {
            var temp = new Array();
            for (var _i = 0, _a = this.selectedSerise; _i < _a.length; _i++) {
                var row = _a[_i];
                for (var _b = 0, _c = this.CurrentData.legend; _b < _c.length; _b++) {
                    var legend = _c[_b];
                    if (row.name == legend.name) {
                        legend.AutoColored = false;
                        temp.push(legend);
                        break;
                    }
                }
            }
            this.selectedSerise = temp;
        }
        else
            this.selectedSerise = new Array();
        if (this.selectedArgument) {
            var temp = new Array();
            for (var _d = 0, _e = this.selectedArgument; _d < _e.length; _d++) {
                var row = _e[_d];
                for (var _f = 0, _g = this.CurrentData.agrument; _f < _g.length; _f++) {
                    var agrument = _g[_f];
                    if (row.name == agrument.name) {
                        agrument.AutoColored = false;
                        temp.push(agrument);
                        break;
                    }
                }
            }
            this.selectedArgument = temp;
        }
        else
            this.selectedArgument = new Array();
    };
    DashboardWidget.prototype._rec = function (inx, name, all_Fields) {
        if (inx == all_Fields.length)
            return new Array();
        var level = new Array();
        for (var _i = 0, _a = all_Fields[inx].value; _i < _a.length; _i++) {
            var val = _a[_i];
            var node = new schema();
            node.name = val;
            node.SerialName = "";
            if (name.length)
                node.SerialName = name + "-";
            node.SerialName += val;
            level.push(node);
            node.id = "sc" + (schema.IDCounter++);
            node.supList = this._rec(inx + 1, node.SerialName, all_Fields);
            node.myContext.$implicit = node.supList;
        }
        //leaves color
        if (!level[0].supList || level[0].supList.length == 0) {
            for (var _b = 0, level_1 = level; _b < level_1.length; _b++) {
                var node = level_1[_b];
                if ((!this.colorPlatte[node.SerialName] || !this.colorPlatte[node.SerialName].setByUser) && !this.random[node.SerialName]) {
                    this.colorPlatte[node.SerialName] = { "color": platte_model_1.platte.getColor(this.colorCounter), "setByUser": false };
                    this.random[node.SerialName] = true;
                    this.colorCounter++;
                }
                node.color = this.colorPlatte[node.SerialName].color;
            }
        }
        return level;
    };
    DashboardWidget.prototype.applayColors = function () {
        if (this.WidgetType == dashboard_widget_type_enum_1.DashboardWidgetTypeEnum.BarChart) {
            this.saveDatasetColor(this.CurrentData.datasets, this.CurrentData.labels);
        }
        else if (this.WidgetType == dashboard_widget_type_enum_1.DashboardWidgetTypeEnum.PieChart) {
            for (var _i = 0, _a = this.CurrentData.datasets; _i < _a.length; _i++) {
                var layer = _a[_i];
                for (var _b = 0, layer_1 = layer; _b < layer_1.length; _b++) {
                    var charts = layer_1[_b];
                    this.saveDatasetColor([charts], charts.labels);
                }
            }
        }
    };
    DashboardWidget.prototype.updateChartsColor = function () {
        this.ColorBehavior = !this.ColorBehavior;
    };
    DashboardWidget.prototype.saveDatasetColor = function (datasets, labels) {
        //debugger;
        this.colorPlatte.findIndex;
        for (var _i = 0, datasets_1 = datasets; _i < datasets_1.length; _i++) {
            var set = datasets_1[_i];
            var backgroundColor = [];
            var Sname = "";
            if (this.selectedSerise && this.selectedSerise.length) {
                for (var _a = 0, _b = this.selectedSerise; _a < _b.length; _a++) {
                    var se = _b[_a];
                    if (set.serisList[se.name]) {
                        if (Sname.length)
                            Sname += "-";
                        Sname += set.serisList[se.name];
                    }
                }
            }
            var _loop_2 = function (label) {
                //     debugger;
                var final = Sname;
                if (this_2.selectedArgument && this_2.selectedArgument.length) {
                    var agru = "";
                    var inx = set.data.findIndex(function (o) { return o.x == label; });
                    if (inx != -1) {
                        var temp = set.data[inx];
                        if (temp.group) {
                            for (var _i = 0, _a = this_2.selectedArgument; _i < _a.length; _i++) {
                                var agrument = _a[_i];
                                if (temp.group[agrument.name]) {
                                    if (agru.length)
                                        agru += "-";
                                    agru += temp.group[agrument.name];
                                }
                            }
                        }
                    }
                    if (agru && agru.length) {
                        if (final.length)
                            final += "-";
                        final += agru;
                    }
                }
                if (!this_2.AutoColoredMeasure) {
                    if (final.length)
                        final += "-";
                    final += set.Field.FieldName;
                }
                if (!this_2.colorPlatte[final]) {
                    this_2.colorPlatte[final] = { "color": platte_model_1.platte.getColor(this_2.colorCounter), "setByUser": false };
                    this_2.colorCounter++;
                }
                backgroundColor.push(this_2.colorPlatte[final].color);
            };
            var this_2 = this;
            for (var _c = 0, labels_1 = labels; _c < labels_1.length; _c++) {
                var label = labels_1[_c];
                _loop_2(label);
            }
            if (set.type == "line") {
                set.borderColor = backgroundColor[0];
                set.pointBackgroundColor = backgroundColor;
                set.backgroundColor = null;
                set.fill = false;
            }
            else
                set.backgroundColor = backgroundColor;
        }
    };
    DashboardWidget.prototype.createPieData = function (dataSource, chart) {
        var isselected = new Array();
        isselected = isselected.fill(false, 0, isselected.length);
        //var DD = {
        //    labels: this.labels,
        //    datasets: this.data
        //};
        //   //debugger;
        var data2 = {};
        if (!this.isNested) {
            // debugger;
            var T = _.cloneDeep(dataSource);
            T['alterColor'] = T.backgroundColor;
            T.backgroundColor = dataSource.backgroundColor;
            var subData = [];
            for (var _i = 0, _a = T.data; _i < _a.length; _i++) {
                var sub = _a[_i];
                subData.push(sub.y);
            }
            T["FullData"] = dataSource.data;
            T.data = subData;
            data2 = {
                "labels": T.labels,
                'Selected': _.cloneDeep(isselected),
                "datasets": [T],
                source: dataSource
            };
        }
        else {
            //  debugger;
            var labels = [];
            var FULLdatasets = [];
            var T = _.cloneDeep(dataSource);
            if (T && T != null && T[0]) {
                //debugger;
                // this.dataSource = this.dataSource[0];
                var idxx = 0;
                var counter = 0;
                for (var i = 0; i < T.length; i++) {
                    var pie = T[i];
                    var _loop_3 = function (lb) {
                        if (labels.findIndex(function (x) { return x == lb; }) == -1)
                            labels.push(lb);
                    };
                    for (var _b = 0, _c = pie.labels; _b < _c.length; _b++) {
                        var lb = _c[_b];
                        _loop_3(lb);
                    }
                    var subData = [];
                    for (var _d = 0, _e = pie.data; _d < _e.length; _d++) {
                        var sub = _e[_d];
                        subData.push(sub.y);
                    }
                    pie["FullData"] = dataSource[i].data;
                    pie.data = subData;
                    pie.backgroundColor = dataSource[counter].backgroundColor;
                    pie['alterColor'] = _.cloneDeep(dataSource[counter].backgroundColor);
                    FULLdatasets = FULLdatasets.concat(pie);
                    counter++;
                }
                isselected = new Array(labels.length);
                isselected = isselected.fill(false, 0, isselected.length);
                // debugger;
                data2 = {
                    labels: labels,
                    Selected: _.cloneDeep(isselected),
                    datasets: FULLdatasets,
                    source: dataSource
                };
            }
        }
        if (chart) {
            chart.data = data2;
            chart.update();
        }
    };
    return DashboardWidget;
}());
exports.DashboardWidget = DashboardWidget;
var FilterEditingObject = /** @class */ (function () {
    function FilterEditingObject() {
        this.supList = [];
        this.myContext = { $implicit: this.supList };
    }
    return FilterEditingObject;
}());
exports.FilterEditingObject = FilterEditingObject;
var widgetData = /** @class */ (function () {
    function widgetData(labels, datasets, legend, agrument, fields, additionalData) {
        this.labels = labels;
        this.datasets = datasets;
        this.legend = legend;
        this.agrument = agrument;
        this.fields = fields;
        this.additionalData = additionalData;
    }
    return widgetData;
}());
exports.widgetData = widgetData;
var schema = /** @class */ (function () {
    function schema() {
        this.myContext = { $implicit: this.supList };
    }
    return schema;
}());
exports.schema = schema;
var DashboardWidgetSaving = /** @class */ (function () {
    function DashboardWidgetSaving() {
    }
    return DashboardWidgetSaving;
}());
exports.DashboardWidgetSaving = DashboardWidgetSaving;
