"use strict";
exports.__esModule = true;
var platte = /** @class */ (function () {
    function platte() {
    }
    platte.getColor = function (index) {
        if (isNaN(index) || platte.colors.length <= index)
            return platte.getRandomColor();
        return platte.colors[index];
    };
    platte.getRandomColor = function () {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };
    platte.colors = ['#27ae60', '#2980b9', '#8e44ad', '#e74c3c', '#f1c40f', '#f39c12', '#2c3e50'];
    return platte;
}());
exports.platte = platte;
