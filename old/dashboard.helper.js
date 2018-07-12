"use strict";
exports.__esModule = true;
var dashboard_data_fields_1 = require("./dashboard.model/dashboard-data-fields");
var dashboard_cache_model_1 = require("./dashboard-cache.model");
var _ = require("lodash");
var moment = require("moment");
var expr_eval_1 = require("expr-eval");
var dash = require("./dashboard.model/dashboard-data-fields");
function isAlpha(character) {
    return ((character >= 'a' && character <= 'z') || (character >= 'A' && character <= 'Z'));
}
exports.isAlpha = isAlpha;
function enumToArray(enums) {
    var arr = [];
    for (var e in enums) {
        arr.push({ id: enums[e], name: e });
    }
    return arr.splice(arr.length / 2);
}
exports.enumToArray = enumToArray;
function toknize(str) {
    var buffer = "";
    var result = [];
    for (var i = 0; i < str.length; i++) {
        if (str[i] == "_" || (str[i] >= 'a' && str <= 'z') || (str[i] >= 'A' && str[i] <= 'Z')) {
            buffer += str[i];
        }
        else if (buffer.length > 0) {
            result.push(buffer);
            buffer = "";
        }
    }
    if (buffer.length > 0) {
        result.push(buffer);
    }
    return result;
}
exports.toknize = toknize;
function formatDate(date, type, dashes) {
    if (dashes === void 0) { dashes = true; }
    var dat = new Date(date);
    var DateFormated = "";
    if (!dashes) {
        if (type == dashboard_data_fields_1.DateGroupEnum.MonthYear) {
            DateFormated += "Year_" + (dat.getFullYear()).toString();
            DateFormated += "_" + (dat.getMonth() + 1).toString();
        }
        else if (type == dashboard_data_fields_1.DateGroupEnum.QuarterYear) {
            DateFormated += "Year_" + (dat.getFullYear()).toString();
            DateFormated += "_" + "Quarter_" + (_.ceil((dat.getMonth() + 1) / 3)).toString();
        }
        else if (type == dashboard_data_fields_1.DateGroupEnum.none) {
            DateFormated += "Year_" + (dat.getFullYear()).toString();
            DateFormated += "_" + (dat.getMonth() + 1).toString();
            DateFormated += "_" + (dat.getDay()).toString();
        }
        else if (type == dashboard_data_fields_1.DateGroupEnum.Year) {
            DateFormated += "Year_" + (dat.getFullYear()).toString();
        }
        else if (type == dashboard_data_fields_1.DateGroupEnum.Month) {
            DateFormated = dashboard_data_fields_1.monthNames[(dat.getMonth() + 1)];
        }
    }
    else {
        if (type == dashboard_data_fields_1.DateGroupEnum.QuarterYear) {
            DateFormated = dat.getFullYear().toString();
            DateFormated += "/ Q " + (_.ceil((dat.getMonth() + 1) / 3)).toString();
        }
        else if (type == dashboard_data_fields_1.DateGroupEnum.MonthYear) {
            DateFormated = dat.getFullYear().toString();
            DateFormated += "/" + (dat.getMonth() + 1).toString();
        }
        else if (type == dashboard_data_fields_1.DateGroupEnum.none) {
            DateFormated = dat.getFullYear().toString();
            DateFormated += "/" + (dat.getMonth() + 1).toString();
            DateFormated += "/" + (dat.getDay()).toString();
        }
        else if (type == dashboard_data_fields_1.DateGroupEnum.Month) {
            DateFormated = dashboard_data_fields_1.monthNames[(dat.getMonth() + 1)];
        }
        else if (type == dashboard_data_fields_1.DateGroupEnum.Year) {
            DateFormated = dat.getFullYear().toString();
        }
    }
    return DateFormated;
}
exports.formatDate = formatDate;
function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
exports.getRandomColor = getRandomColor;
function getRemainingDays(compareDate, orderActivationDate, daystoDelivery) {
    if (daystoDelivery === void 0) { daystoDelivery = 30; }
    //console.log(CompareDate, OrderActivationDate, DaystoDelivery)
    var difference = 0;
    if (compareDate && compareDate != null && orderActivationDate && orderActivationDate != null) {
        var a = moment(compareDate);
        var b = moment(orderActivationDate);
        var days = a.diff(b, 'days');
        difference = daystoDelivery - days;
    }
    return difference;
}
exports.getRemainingDays = getRemainingDays;
function average(index, type, field, obj) {
    // if (!this.cashe[index + "avg" + field])
    //     this.cashe[index + "avg" + field] = this.GetCashe((index + type + field), obj, field) / obj.length;
    // return this.cache[index + "avg" + field];
    if (!dashboard_cache_model_1.Cache.getInstance.getCacheValue(index + "avg" + field)) {
        dashboard_cache_model_1.Cache.getInstance.setCache(index + "avg" + field, dashboard_cache_model_1.Cache.getInstance.getCache((index + type + field), obj, field) / obj.length);
    }
    return dashboard_cache_model_1.Cache.getInstance.getCacheValue(index + "avg" + field);
}
exports.average = average;
function delta(index1, index2, base, target, type) {
    if (!dashboard_cache_model_1.Cache.getInstance.getCacheValue(index1 + index2 + "delta" + base + target))
        dashboard_cache_model_1.Cache.getInstance.setCache(index1 + index2 + "delta" + base + target, _.round((dashboard_cache_model_1.Cache.getInstance.getCache((index1 + type + base), this.DataAsGroups[index1], base) / dashboard_cache_model_1.Cache.getInstance.getCache((index2 + type + target), this.DataAsGroups[index2], target) - 1) * 100, 2));
    //this.cashe[index1 + index2 + "delta" + base + target] = _.round(( Cache.getInstance.getCache((index1 + type + base), this.DataAsGroups[index1], base) /  Cache.getInstance.getCache((index2 + type + target), this.DataAsGroups[index2], target)-1)*100,2);
    return dashboard_cache_model_1.Cache.getInstance.getCacheValue(index1 + index2 + "delta" + base + target);
    //this.cashe[index1 + index2 + "delta" + base + target];
}
exports.delta = delta;
function calculateExpression(exp, data) {
    var ExpressionTokens = toknize(exp.Expression);
    var obj = {};
    for (var i = 0; i < ExpressionTokens.length; i++) {
        obj[ExpressionTokens[i]] = _.sumBy(data, ExpressionTokens[i]);
    }
    var parser = new expr_eval_1.Parser();
    var expr = parser.parse(exp.Expression);
    return expr.evaluate(obj);
}
exports.calculateExpression = calculateExpression;
function agro(op, GroupName, GroupData, LastGroupName, target) {
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
}
exports.agro = agro;
function sortXY(data, agru, last) {
    if (last === void 0) { last = []; }
    var counter = 0;
    var prioiry = [];
    // debugger;
    for (var _i = 0, agru_1 = agru; _i < agru_1.length; _i++) {
        var label = agru_1[_i];
        prioiry[label] = counter++;
    }
    var setcounter = 0;
    for (var _a = 0, data_1 = data; _a < data_1.length; _a++) {
        var set = data_1[_a];
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
}
exports.sortXY = sortXY;
function delta_v1(op, GroupName1, GroupName2, Groups) {
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
}
exports.delta_v1 = delta_v1;
function construct_layer(data, agrument) {
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
}
exports.construct_layer = construct_layer;
