"use strict";
exports.__esModule = true;
var dash = require("./dashboard.model/dashboard-data-fields");
var _ = require("lodash");
var dashboard_helper_1 = require("./dashboard.helper");
var dashboard_chart_builder_manager_1 = require("./dashboard-chart-builder-manager");
var FilterManager = /** @class */ (function () {
    function FilterManager() {
    } // private to prevent to create more than one instance by access constructor from outside
    Object.defineProperty(FilterManager, "getInstance", {
        get: function () {
            if (this.instance == null) {
                this.instance = new FilterManager();
            }
            return this.instance;
        },
        enumerable: true,
        configurable: true
    });
    FilterManager.prototype.applyFilters = function (widget, Updating) {
        if (Updating === void 0) { Updating = false; }
        var changed = false;
        var operate = [];
        ///chech for strign filter
        //check if there  are master filter to Aplay   
        if (widget.MasterFilter) {
            var data = widget.OrginalDatasource;
            operate = jQuery.extend(true, [], FilterManager.MasterFilter);
            operate['F' + widget.ID] = [];
            changed = true;
        }
        //check for local selected components filter
        else if (Object.keys(widget.AcceptFilter).length > 0) {
            for (var id in widget.AcceptFilter) {
                if (widget.AcceptFilter[id]) {
                    if (FilterManager.MasterFilter[id]) {
                        operate.push(_.cloneDeep(FilterManager.MasterFilter[id]));
                        if (!changed)
                            changed = true;
                    }
                }
            }
        }
        var widgetBuilder;
        if (changed) {
            var finalData = _.cloneDeep(widget.OrginalDatasource);
            if (widget.FilterString && widget.FilterString.length > 3) {
                finalData = this.filterByString(widget.FilterString, finalData);
            }
            widget.Datasource = this.filterLists(operate, finalData);
            // widgetBuilder = new DashBoardWidgetBuilder(widget)
            //widgetBuilder.build();//this.BuildWidget(widget);
        }
        else if (Updating) {
            var finalData = _.cloneDeep(widget.OrginalDatasource);
            if (widget.FilterString && widget.FilterString.length > 3) {
                finalData = this.filterByString(widget.FilterString, finalData);
            }
            widget.Datasource = finalData;
            // widgetBuilder = new DashBoardWidgetBuilder(widget)
            //widgetBuilder.build();//this.BuildWidget(widget);
        }
        widgetBuilder = new dashboard_chart_builder_manager_1.chartBuilderManager(widget);
        widgetBuilder.build();
    };
    FilterManager.prototype.filterByString = function (FilterString, data) {
        if (FilterString.length > 3)
            return jQuery.grep(data, function (o) { return eval(FilterString); });
    };
    FilterManager.prototype.filterLists = function (FilterList, Datasource) {
        //console.log(FilterList);
        var data = _.cloneDeep(Datasource);
        //console.log(data)
        var Filtered = [];
        for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
            var row = data_1[_i];
            var isValid = true;
            for (var list in FilterList) {
                isValid = (isValid && this.checkFilterValidity(FilterList[list], row));
            }
            if (isValid)
                Filtered.push(row);
        }
        //console.log(Filtered)
        return Filtered;
    };
    FilterManager.prototype.checkFilterValidity = function (list, data) {
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
                        if (obj[head].date != dashboard_helper_1.formatDate(data[head], obj[head].type)) {
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
    FilterManager.prototype.constructFilterString = function (expr, obj) {
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
            else if (dashboard_helper_1.isAlpha(expr[i] || expr[i] == '_')) {
                var buffer = "";
                while (dashboard_helper_1.isAlpha(expr[i] || expr[i] == '_') && i < expr.length) {
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
    FilterManager.MasterFilter = [];
    FilterManager.MasterFilterListIDs = [];
    return FilterManager;
}());
exports.FilterManager = FilterManager;
