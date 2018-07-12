"use strict";
exports.__esModule = true;
var dash = require("./dashboard.model/dashboard-data-fields");
var _ = require("lodash");
var LabelManager = /** @class */ (function () {
    function LabelManager() {
    }
    Object.defineProperty(LabelManager, "getInstance", {
        get: function () {
            if (this.instance == null)
                this.instance = new LabelManager();
            return this.instance;
        },
        enumerable: true,
        configurable: true
    });
    LabelManager.prototype.reSortLabels = function (widget) {
        var labels = [];
        var temp = _.cloneDeep(widget.widgetLabels);
        temp = temp.sort(function (a, b) {
            return a.priority - b.priority;
        });
        widget.widgetLabels = temp;
    };
    LabelManager.prototype.constructExpLabels = function (type) {
        if (type == dash.DateGroupEnum.Month) {
            return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        }
        return null;
    };
    LabelManager.prototype.calculatExpLabels = function (groups, datasets) {
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
        var labels = this.constructExpLabels(groups[0].Operation.Type);
        if (!labels)
            return null;
    };
    return LabelManager;
}());
exports.LabelManager = LabelManager;
