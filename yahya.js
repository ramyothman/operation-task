var oo = /** @class */ (function () {
    function oo() {
    }
    return oo;
}());
var all = {
    product: ["a", "b", "a", "b", "b"],
    year1: [1, 2, 3, 4, 5],
    year2: [5, 6, 7, 8, 9],
    year3: [11, 22, 33, 44, 55]
};
var years = ["product", "year1", "year2", "year3"];
var out_all = [];
for (var j = 1; j < years.length; j++) {
    console.log(j + "    " + years[j]);
    var out = [];
    var _loop_1 = function (i) {
        var left = out.filter(function (x) { return x.name == all["product"][i]; });
        if (!left.length) {
            var x = { name: all["product"][i], values: [all[years[j]][i]] };
            out.push(x);
        }
        else {
            left[0].values.push(all[years[j]][i]);
        }
    };
    for (var i = 0; i < all["product"].length; i++) {
        _loop_1(i);
    }
    out_all[years[j]] = out;
}
console.log(out_all);
