"use strict";
exports.__esModule = true;
var _ = require("lodash");
var Cache = /** @class */ (function () {
    function Cache() {
    }
    Cache.prototype.Cache = function () { };
    Object.defineProperty(Cache, "getInstance", {
        get: function () {
            return this.instance || (this.instance = new this());
        },
        enumerable: true,
        configurable: true
    });
    Cache.prototype.getCache = function (index, obj, field) {
        if (!this.cache[index])
            this.cache[index] = _.sumBy(obj, field);
        return this.cache[index];
    };
    Cache.prototype.setCache = function (index, value) {
        this.cache[index] = value;
    };
    Cache.prototype.getCacheValue = function (index) {
        return this.cache[index];
    };
    Cache.prototype.resetCache = function () {
        this.cache = [];
    };
    return Cache;
}());
exports.Cache = Cache;
