"use strict";
exports.__esModule = true;
var dashboard_chart_builder_manager_1 = require("./dashboard-chart-builder-manager");
var Test = /** @class */ (function () {
    function Test() {
    }
    Test.prototype.main = function () {
        //   this.widget.Datasource = [1,2,3];
        //  this.widget.WidgetType = DashboardWidgetTypeEnum.Pivot;
        this.test = new dashboard_chart_builder_manager_1.chartBuilderManager(this.widget);
        return 0;
    };
    return Test;
}());
exports.Test = Test;
var kx = new Test();
kx.main();
