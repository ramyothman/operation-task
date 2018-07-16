"use strict";
exports.__esModule = true;
var dashboard_chart_builder_manager_1 = require("./dashboard-chart-builder-manager");
var dashboard_widget_model_1 = require("./dashboard.model/dashboard-widget.model");
var dashboard_widget_chart_type_1 = require("./dashboard.model/dashboard-widget-chart-type");
var dashboard_widget_type_enum_1 = require("./dashboard.model/dashboard-widget-type.enum");
var Test = /** @class */ (function () {
    function Test() {
        this.widget = new dashboard_widget_model_1.DashboardWidget();
        this.widget.WidgetChartType = dashboard_widget_chart_type_1.DashboardWidgetChartTypeEnum["default"];
        this.widget.WidgetType = dashboard_widget_type_enum_1.DashboardWidgetTypeEnum.Pivot;
        this.widget.Operations = ['khaled'];
        this.widget.Datasource = ['a', 'b', 'c'];
    }
    Test.prototype.main = function () {
        this.test = new dashboard_chart_builder_manager_1.chartBuilderManager(this.widget);
        return 0;
    };
    return Test;
}());
exports.Test = Test;
var kx = new Test();
kx.main();
