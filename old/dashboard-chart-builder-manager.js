"use strict";
exports.__esModule = true;
var dashboard_widget_type_enum_1 = require("./dashboard.model/dashboard-widget-type.enum");
var dashboard_widget_chart_type_1 = require("./dashboard.model/dashboard-widget-chart-type");
var dashboard_chart_builder_1 = require("./dashboard-chart-builder");
var dashboard_chart_js_builder_1 = require("./dashboard-chart-js-builder");
var chartBuilderManager = /** @class */ (function () {
    function chartBuilderManager(widget) {
        this.mapFromEnumToFuncName = new Map();
        this.widget = widget;
        this.intialize();
        console.log("hello i'am khaled");
        this.build();
    }
    chartBuilderManager.prototype.intialize = function () {
        this.addNewTypeToMap(dashboard_widget_type_enum_1.DashboardWidgetTypeEnum.ActiveTotalChart, 'buildActiveTotalChart');
        this.addNewTypeToMap(dashboard_widget_type_enum_1.DashboardWidgetTypeEnum.DigitChart, 'buildDigitChart');
        this.addNewTypeToMap(dashboard_widget_type_enum_1.DashboardWidgetTypeEnum.Gauge, 'buildGaugeChart');
        this.addNewTypeToMap(dashboard_widget_type_enum_1.DashboardWidgetTypeEnum.Grid, 'buildGridChart');
        this.addNewTypeToMap(dashboard_widget_type_enum_1.DashboardWidgetTypeEnum.Pivot, 'buildPivotChart');
        this.addNewTypeToMap(dashboard_widget_type_enum_1.DashboardWidgetTypeEnum.PieChart, 'buildPieChart');
        this.addNewTypeToMap(dashboard_widget_type_enum_1.DashboardWidgetTypeEnum.BarChart, 'buildExpBarChart');
    };
    chartBuilderManager.prototype.addNewTypeToMap = function (newEnum, funcName) {
        this.mapFromEnumToFuncName.set(newEnum, "builder." + funcName + "()");
    };
    chartBuilderManager.prototype.checkDataSource = function () {
        if (!this.widget.Datasource)
            alert("no DataSource");
    };
    chartBuilderManager.prototype.build = function () {
        var builder;
        this.checkDataSource();
        if (this.widget.WidgetChartType == dashboard_widget_chart_type_1.DashboardWidgetChartTypeEnum["default"]) {
            builder = new dashboard_chart_builder_1.chartBuilder(this.widget);
        }
        else if (this.widget.WidgetChartType == dashboard_widget_chart_type_1.DashboardWidgetChartTypeEnum.js) {
            builder = new dashboard_chart_js_builder_1.chartJsBuilder(this.widget);
        }
        else if (this.widget.WidgetChartType == dashboard_widget_chart_type_1.DashboardWidgetChartTypeEnum.echart) {
            throw new Error("echart not implemented yet.");
        }
        else {
            throw new Error("this type not implemented yet.");
        }
        eval(this.mapFromEnumToFuncName.get(this.widget.WidgetType));
    };
    return chartBuilderManager;
}());
exports.chartBuilderManager = chartBuilderManager;
