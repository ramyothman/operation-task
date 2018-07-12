"use strict";
exports.__esModule = true;
var dashboard_widget_model_1 = require("./dashboard.model/dashboard-widget.model");
var dashboard_widget_chart_type_1 = require("./dashboard.model/dashboard-widget-chart-type");
var dashboard_widget_type_enum_1 = require("./dashboard.model/dashboard-widget-type.enum");
var dashboard_operations_1 = require("./dashboard-operations");
var Test = /** @class */ (function () {
    function Test() {
        this.widget = new dashboard_widget_model_1.DashboardWidget();
        this.widget.WidgetChartType = dashboard_widget_chart_type_1.DashboardWidgetChartTypeEnum["default"];
        this.widget.WidgetType = dashboard_widget_type_enum_1.DashboardWidgetTypeEnum.ActiveTotalChart;
        this.widget.Operations = [1, 2, 3];
        this.widget.Datasource = [4, 5, 6];
    }
    Test.prototype.main = function () {
        this.test = new dashboard_operations_1.Operations();
        this.test.BuildWidget(this.widget);
        return 0;
    };
    return Test;
}());
exports.Test = Test;
var kx = new Test();
kx.main();
