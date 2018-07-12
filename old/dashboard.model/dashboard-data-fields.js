"use strict";
exports.__esModule = true;
var DateGroupEnum;
(function (DateGroupEnum) {
    DateGroupEnum[DateGroupEnum["Month"] = 5] = "Month";
    DateGroupEnum[DateGroupEnum["MonthYear"] = 1] = "MonthYear";
    DateGroupEnum[DateGroupEnum["QuarterYear"] = 2] = "QuarterYear";
    DateGroupEnum[DateGroupEnum["Year"] = 3] = "Year";
    DateGroupEnum[DateGroupEnum["none"] = 4] = "none";
})(DateGroupEnum = exports.DateGroupEnum || (exports.DateGroupEnum = {}));
var DataTypeEnum;
(function (DataTypeEnum) {
    DataTypeEnum[DataTypeEnum["string"] = 1] = "string";
    DataTypeEnum[DataTypeEnum["number"] = 2] = "number";
    DataTypeEnum[DataTypeEnum["object"] = 3] = "object";
})(DataTypeEnum = exports.DataTypeEnum || (exports.DataTypeEnum = {}));
var QueryTypeEnum;
(function (QueryTypeEnum) {
    QueryTypeEnum[QueryTypeEnum["Group"] = 1] = "Group";
    QueryTypeEnum[QueryTypeEnum["Measure"] = 2] = "Measure";
    QueryTypeEnum[QueryTypeEnum["Delta"] = 3] = "Delta";
    QueryTypeEnum[QueryTypeEnum["Spark"] = 4] = "Spark";
    QueryTypeEnum[QueryTypeEnum["DeltaGroup"] = 5] = "DeltaGroup";
    QueryTypeEnum[QueryTypeEnum["calc"] = 6] = "calc";
    QueryTypeEnum[QueryTypeEnum["Serise"] = 7] = "Serise";
    QueryTypeEnum[QueryTypeEnum["Chart"] = 8] = "Chart";
    QueryTypeEnum[QueryTypeEnum["Expectaion"] = 9] = "Expectaion";
    QueryTypeEnum[QueryTypeEnum["BarChart"] = 10] = "BarChart";
    QueryTypeEnum[QueryTypeEnum["ActiveTotal"] = 11] = "ActiveTotal";
})(QueryTypeEnum = exports.QueryTypeEnum || (exports.QueryTypeEnum = {}));
var OperationTypeEnum;
(function (OperationTypeEnum) {
    OperationTypeEnum[OperationTypeEnum["Group"] = 1] = "Group";
    OperationTypeEnum[OperationTypeEnum["Measure"] = 2] = "Measure";
    OperationTypeEnum[OperationTypeEnum["Delta"] = 3] = "Delta";
    OperationTypeEnum[OperationTypeEnum["Spark"] = 4] = "Spark";
    OperationTypeEnum[OperationTypeEnum["DeltaGroup"] = 5] = "DeltaGroup";
    OperationTypeEnum[OperationTypeEnum["calc"] = 6] = "calc";
    OperationTypeEnum[OperationTypeEnum["Serise"] = 7] = "Serise";
    OperationTypeEnum[OperationTypeEnum["chart"] = 8] = "chart";
    OperationTypeEnum[OperationTypeEnum["Expectaion"] = 9] = "Expectaion";
    OperationTypeEnum[OperationTypeEnum["BarChart"] = 10] = "BarChart";
    OperationTypeEnum[OperationTypeEnum["ActiveTotal"] = 11] = "ActiveTotal";
})(OperationTypeEnum = exports.OperationTypeEnum || (exports.OperationTypeEnum = {}));
var Measure;
(function (Measure) {
    Measure[Measure["Sum"] = 1] = "Sum";
    Measure[Measure["Average"] = 2] = "Average";
    Measure[Measure["Count"] = 3] = "Count";
    Measure[Measure["Min"] = 4] = "Min";
    Measure[Measure["Max"] = 5] = "Max";
    Measure[Measure["Accumulative"] = 6] = "Accumulative";
    Measure[Measure["Target"] = 7] = "Target";
})(Measure = exports.Measure || (exports.Measure = {}));
var chartType;
(function (chartType) {
    chartType[chartType["bar"] = 1] = "bar";
    chartType[chartType["stackedBar"] = 2] = "stackedBar";
    chartType[chartType["fullStackedBar"] = 3] = "fullStackedBar";
    chartType[chartType["point"] = 4] = "point";
    chartType[chartType["line"] = 5] = "line";
    chartType[chartType["stackedLine"] = 6] = "stackedLine";
    chartType[chartType["fullStackedLine"] = 7] = "fullStackedLine";
    chartType[chartType["stepLine"] = 8] = "stepLine";
    chartType[chartType["spLine"] = 9] = "spLine";
    chartType[chartType["area"] = 10] = "area";
    chartType[chartType["stackedArea"] = 11] = "stackedArea";
    chartType[chartType["fullStackedArea"] = 12] = "fullStackedArea";
    chartType[chartType["stepArea"] = 13] = "stepArea";
    chartType[chartType["spLineArea"] = 14] = "spLineArea";
    chartType[chartType["stackedSpLineArea"] = 15] = "stackedSpLineArea";
    chartType[chartType["fullStackedSpLineArea"] = 16] = "fullStackedSpLineArea";
})(chartType = exports.chartType || (exports.chartType = {}));
var expectedFieldType;
(function (expectedFieldType) {
    expectedFieldType[expectedFieldType["funcation"] = 1] = "funcation";
})(expectedFieldType = exports.expectedFieldType || (exports.expectedFieldType = {}));
var DeltaTypeEnum;
(function (DeltaTypeEnum) {
    DeltaTypeEnum[DeltaTypeEnum["PercentVariation"] = 1] = "PercentVariation";
})(DeltaTypeEnum = exports.DeltaTypeEnum || (exports.DeltaTypeEnum = {}));
var MeasureInt;
(function (MeasureInt) {
    MeasureInt[MeasureInt["Sum"] = 1] = "Sum";
    MeasureInt[MeasureInt["Count"] = 3] = "Count";
    MeasureInt[MeasureInt["Average"] = 2] = "Average";
    MeasureInt[MeasureInt["Min"] = 4] = "Min";
    MeasureInt[MeasureInt["Max"] = 5] = "Max";
    MeasureInt[MeasureInt["Accumulative"] = 6] = "Accumulative";
    MeasureInt[MeasureInt["Target"] = 7] = "Target";
})(MeasureInt = exports.MeasureInt || (exports.MeasureInt = {}));
var MeasureString;
(function (MeasureString) {
    MeasureString[MeasureString["Count"] = 3] = "Count";
    MeasureString[MeasureString["Min"] = 4] = "Min";
    MeasureString[MeasureString["Max"] = 5] = "Max";
})(MeasureString = exports.MeasureString || (exports.MeasureString = {}));
var SortingType;
(function (SortingType) {
    SortingType[SortingType["ascending"] = 1] = "ascending";
    SortingType[SortingType["descending"] = -1] = "descending";
})(SortingType = exports.SortingType || (exports.SortingType = {}));
var MeasureDate;
(function (MeasureDate) {
    MeasureDate[MeasureDate["Count"] = 3] = "Count";
})(MeasureDate = exports.MeasureDate || (exports.MeasureDate = {}));
var DimensionField = /** @class */ (function () {
    function DimensionField(name, type, value, AutoColored) {
        this.AutoColored = true;
        this.name = name;
        this.type = type;
        this.value = value;
        this.AutoColored = AutoColored;
    }
    return DimensionField;
}());
exports.DimensionField = DimensionField;
var PreparedDataGroups = /** @class */ (function () {
    function PreparedDataGroups(data, GroupsValue, GroupKeyValue) {
        this.data = data;
        this.GroupsValue = GroupsValue;
        this.GroupKeyValue = GroupKeyValue;
    }
    return PreparedDataGroups;
}());
exports.PreparedDataGroups = PreparedDataGroups;
var Customization = /** @class */ (function () {
    function Customization() {
        this.Sort = false;
        this.SortType = SortingType.ascending;
        this.DateFormat = "dd/MM/yyyy";
    }
    return Customization;
}());
exports.Customization = Customization;
var Query = /** @class */ (function () {
    function Query() {
        this.Customization = new Customization();
        this["new"] = true;
    }
    return Query;
}());
exports.Query = Query;
var QuerySubTypeEnum;
(function (QuerySubTypeEnum) {
    QuerySubTypeEnum[QuerySubTypeEnum["TargetExp"] = 1] = "TargetExp";
    QuerySubTypeEnum[QuerySubTypeEnum["ActualExp"] = 2] = "ActualExp";
    QuerySubTypeEnum[QuerySubTypeEnum["DigitActual"] = 3] = "DigitActual";
    QuerySubTypeEnum[QuerySubTypeEnum["DigitTarget"] = 4] = "DigitTarget";
})(QuerySubTypeEnum = exports.QuerySubTypeEnum || (exports.QuerySubTypeEnum = {}));
var Field = /** @class */ (function () {
    //in data
    function Field(StoredName, FieldName, FieldType, Caption, hidden) {
        this.StoredName = StoredName;
        this.FieldName = FieldName;
        this.FieldType = FieldType;
        this.Caption = Caption;
        this.hidden = hidden;
    }
    return Field;
}());
exports.Field = Field;
var expectationOperation = /** @class */ (function () {
    function expectationOperation(Field, Type, callback) {
        var _this = this;
        this.Field = Field;
        this.Type = Type;
        this.GetStoredName = function () {
            if (_this.Field.StoredName)
                return _this.Field.StoredName;
            return "";
        };
        this.callback = callback;
    }
    expectationOperation.prototype.SetStoredName = function (name) {
        this.Field.StoredName = name;
    };
    ;
    expectationOperation.prototype.GetFieldName = function () {
        if (this.Field.FieldName)
            return this.Field.FieldName;
        return "";
    };
    ;
    expectationOperation.prototype.SetFieldName = function (name) {
        this.Field.FieldName = name;
    };
    expectationOperation.prototype.GetType = function () {
        return this.Type;
    };
    expectationOperation.prototype.SetType = function (type) {
        this.Type = type;
    };
    expectationOperation.prototype.GetCaption = function () {
        return this.Field.Caption;
    };
    expectationOperation.prototype.SetCaption = function (input) {
        this.Field.Caption = input;
    };
    expectationOperation.prototype.SetDataType = function (ty) {
        this.Field.FieldType = ty;
    };
    expectationOperation.prototype.GetDataType = function () {
        return this.Field.FieldType;
    };
    expectationOperation.prototype.isHidden = function () {
        return this.Field.hidden;
    };
    expectationOperation.prototype.setHidden = function (flag) {
        this.Field.hidden = flag;
    };
    return expectationOperation;
}());
exports.expectationOperation = expectationOperation;
var GroupOperation = /** @class */ (function () {
    function GroupOperation(Field, Type, sort) {
        var _this = this;
        this.Field = Field;
        this.Type = Type;
        this.sort = sort;
        this.GetStoredName = function () {
            if (_this.Field.StoredName)
                return _this.Field.StoredName;
            return "";
        };
        this.sort = false;
    }
    GroupOperation.prototype.SetStoredName = function (name) {
        this.Field.StoredName = name;
    };
    ;
    GroupOperation.prototype.GetFieldName = function () {
        if (this.Field.FieldName)
            return this.Field.FieldName;
        return "";
    };
    ;
    GroupOperation.prototype.SetFieldName = function (name) {
        this.Field.FieldName = name;
    };
    GroupOperation.prototype.GetType = function () {
        return this.Type;
    };
    GroupOperation.prototype.SetType = function (type) {
        this.Type = type;
    };
    GroupOperation.prototype.GetCaption = function () {
        return this.Field.Caption;
    };
    GroupOperation.prototype.SetCaption = function (input) {
        this.Field.Caption = input;
    };
    GroupOperation.prototype.SetDataType = function (ty) {
        this.Field.FieldType = ty;
    };
    GroupOperation.prototype.GetDataType = function () {
        return this.Field.FieldType;
    };
    GroupOperation.prototype.isHidden = function () {
        return this.Field.hidden;
    };
    GroupOperation.prototype.setHidden = function (flag) {
        this.Field.hidden = flag;
    };
    return GroupOperation;
}());
exports.GroupOperation = GroupOperation;
var MeasureOperation = /** @class */ (function () {
    function MeasureOperation(Field, Type) {
        this.Field = Field;
        this.Type = Type;
    }
    MeasureOperation.prototype.isHidden = function () {
        return this.Field.hidden;
    };
    MeasureOperation.prototype.setHidden = function (flag) {
        this.Field.hidden = flag;
    };
    MeasureOperation.prototype.GetStoredName = function () {
        if (this.Field.StoredName)
            return this.Field.StoredName;
        return "";
    };
    ;
    MeasureOperation.prototype.SetStoredName = function (name) {
        this.Field.StoredName = name;
    };
    ;
    MeasureOperation.prototype.GetFieldName = function () {
        if (this.Field.FieldName)
            return this.Field.FieldName;
        return "";
    };
    ;
    MeasureOperation.prototype.SetFieldName = function (name) {
        this.Field.FieldName = name;
    };
    MeasureOperation.prototype.GetType = function () {
        return this.Type;
    };
    MeasureOperation.prototype.SetType = function (type) {
        this.Type = type;
    };
    MeasureOperation.prototype.GetCaption = function () {
        return this.Field.Caption;
    };
    MeasureOperation.prototype.SetCaption = function (input) {
        this.Field.Caption = input;
    };
    MeasureOperation.prototype.SetDataType = function (ty) {
        this.Field.FieldType = ty;
    };
    MeasureOperation.prototype.GetDataType = function () {
        return this.Field.FieldType;
    };
    return MeasureOperation;
}());
exports.MeasureOperation = MeasureOperation;
var Delta = /** @class */ (function () {
    function Delta(FieldName, Type, ActualField, TargetField, ActualGroup, TargetGroup, Caption, hidden) {
        this.FieldName = FieldName;
        this.Type = Type;
        this.ActualField = ActualField;
        this.TargetField = TargetField;
        this.ActualGroup = ActualGroup;
        this.TargetGroup = TargetGroup;
        this.Caption = Caption;
        this.hidden = hidden;
    }
    Delta.prototype.isHidden = function () {
        return this.hidden;
    };
    Delta.prototype.setHidden = function (flag) {
        this.hidden = flag;
    };
    Delta.prototype.GetStoredName = function () {
        return this.ActualField.GetStoredName();
    };
    ;
    Delta.prototype.SetStoredName = function (name) {
        this.ActualField.SetStoredName(name);
    };
    ;
    Delta.prototype.GetFieldName = function () {
        if (this.FieldName)
            return this.FieldName;
        return "";
    };
    ;
    Delta.prototype.SetFieldName = function (name) {
        this.FieldName = name;
    };
    Delta.prototype.GetType = function () {
        return this.Type;
    };
    Delta.prototype.SetType = function (type) {
        this.Type = type;
    };
    Delta.prototype.GetCaption = function () {
        return this.Caption;
    };
    Delta.prototype.SetCaption = function (input) {
        this.Caption = input;
    };
    Delta.prototype.SetDataType = function (ty) {
        this.ActualField.SetDataType(ty);
    };
    Delta.prototype.GetDataType = function () {
        return this.ActualField.GetDataType();
    };
    Delta.prototype.GetFieldNameTarget = function () {
        return this.TargetField.GetFieldName();
    };
    ;
    Delta.prototype.SetFieldNameTarget = function (name) {
        this.TargetField.SetFieldName(name);
    };
    ;
    Delta.prototype.GetStoredNameTarget = function () {
        return this.TargetField.GetFieldName();
    };
    ;
    Delta.prototype.SetStoredNameTarget = function (name) {
        this.TargetField.SetFieldName(name);
    };
    ;
    return Delta;
}());
exports.Delta = Delta;
var ActiveTotal = /** @class */ (function () {
    function ActiveTotal(FieldName, ActualField, TargetField, Caption) {
        this.FieldName = FieldName;
        this.ActualField = ActualField;
        this.TargetField = TargetField;
        this.Caption = Caption;
    }
    ActiveTotal.prototype.GetStoredName = function () {
        return this.ActualField.GetStoredName();
    };
    ;
    ActiveTotal.prototype.SetStoredName = function (name) {
        this.ActualField.SetStoredName(name);
    };
    ;
    ActiveTotal.prototype.GetFieldName = function () {
        if (this.FieldName)
            return this.FieldName;
        return "";
    };
    ;
    ActiveTotal.prototype.SetFieldName = function (name) {
        this.FieldName = name;
    };
    ActiveTotal.prototype.GetType = function () {
        return this.Type;
    };
    ActiveTotal.prototype.SetType = function (type) {
        this.Type = type;
    };
    ActiveTotal.prototype.GetCaption = function () {
        return this.Caption;
    };
    ActiveTotal.prototype.SetCaption = function (input) {
        this.Caption = input;
    };
    ActiveTotal.prototype.SetDataType = function (ty) {
        this.ActualField.SetDataType(ty);
    };
    ActiveTotal.prototype.GetDataType = function () {
        return this.ActualField.GetDataType();
    };
    ActiveTotal.prototype.GetFieldNameTarget = function () {
        return this.TargetField.GetFieldName();
    };
    ;
    ActiveTotal.prototype.SetFieldNameTarget = function (name) {
        this.TargetField.SetFieldName(name);
    };
    ;
    ActiveTotal.prototype.GetStoredNameTarget = function () {
        return this.TargetField.GetFieldName();
    };
    ;
    ActiveTotal.prototype.SetStoredNameTarget = function (name) {
        this.TargetField.SetFieldName(name);
    };
    ;
    return ActiveTotal;
}());
exports.ActiveTotal = ActiveTotal;
var Chart = /** @class */ (function () {
    function Chart(FieldName, CompareDate, CompareToDate, DaysRange, TakeToday, Caption, hidden) {
        if (DaysRange === void 0) { DaysRange = 0; }
        if (TakeToday === void 0) { TakeToday = false; }
        this.FieldName = FieldName;
        this.CompareDate = CompareDate;
        this.CompareToDate = CompareToDate;
        this.DaysRange = DaysRange;
        this.Caption = Caption;
        this.hidden = hidden;
    }
    Chart.prototype.isHidden = function () {
        return this.hidden;
    };
    Chart.prototype.setHidden = function (flag) {
        this.hidden = flag;
    };
    Chart.prototype.GetStoredName = function () {
        return this.CompareDate.GetStoredName();
    };
    ;
    Chart.prototype.SetStoredName = function (name) {
        this.CompareDate.SetStoredName(name);
    };
    ;
    Chart.prototype.GetComparedFieldName = function () {
        return this.CompareDate.GetFieldName();
    };
    ;
    Chart.prototype.SetComparedFieldName = function (name) {
        this.CompareDate.SetFieldName(name);
    };
    ;
    Chart.prototype.GetFieldName = function () {
        if (this.FieldName)
            return this.FieldName;
        return "";
    };
    ;
    Chart.prototype.SetFieldName = function (name) {
        this.FieldName = name;
    };
    Chart.prototype.GetCaption = function () {
        return this.Caption;
    };
    Chart.prototype.SetCaption = function (input) {
        this.Caption = input;
    };
    Chart.prototype.SetDataType = function (ty) {
        this.CompareDate.SetDataType(ty);
    };
    Chart.prototype.GetDataType = function () {
        return this.CompareDate.GetDataType();
    };
    Chart.prototype.GetFieldNameAgru = function () {
        return this.CompareToDate.GetFieldName();
    };
    ;
    Chart.prototype.SetFieldNameAgru = function (name) {
        this.CompareToDate.SetFieldName(name);
    };
    ;
    Chart.prototype.GetStoredNameAgru = function () {
        return this.CompareToDate.GetStoredName();
    };
    ;
    Chart.prototype.SetStoredNameAgru = function (name) {
        this.CompareToDate.SetStoredName(name);
    };
    ;
    Chart.prototype.GetTypeAgru = function () {
        return this.CompareToDate.GetType();
    };
    ;
    Chart.prototype.SetTypeAgru = function (dt) {
        this.CompareToDate.SetType(dt);
    };
    ;
    return Chart;
}());
exports.Chart = Chart;
var Spark = /** @class */ (function () {
    function Spark(FieldName, Type, ActualField, ArgumentField, Caption, hidden) {
        this.FieldName = FieldName;
        this.Type = Type;
        this.ActualField = ActualField;
        this.ArgumentField = ArgumentField;
        this.Caption = Caption;
        this.hidden = hidden;
    }
    Spark.prototype.isHidden = function () {
        return this.hidden;
    };
    Spark.prototype.setHidden = function (flag) {
        this.hidden = flag;
    };
    Spark.prototype.GetStoredName = function () {
        return this.ActualField.GetStoredName();
    };
    ;
    Spark.prototype.SetStoredName = function (name) {
        this.ActualField.SetStoredName(name);
    };
    ;
    Spark.prototype.GetFieldName = function () {
        return this.FieldName;
    };
    ;
    Spark.prototype.SetFieldName = function (name) {
        this.FieldName = name;
    };
    Spark.prototype.GetType = function () {
        return this.ActualField.GetType();
    };
    Spark.prototype.SetType = function (ty) {
        this.ActualField.SetType(ty);
    };
    Spark.prototype.GetCaption = function () {
        return this.Caption;
    };
    Spark.prototype.SetCaption = function (input) {
        this.Caption = input;
    };
    Spark.prototype.SetDataType = function (ty) {
        this.ActualField.SetDataType(ty);
    };
    Spark.prototype.GetDataType = function () {
        return this.ActualField.GetDataType();
    };
    Spark.prototype.GetFieldNameAgru = function () {
        return this.ArgumentField.GetFieldName();
    };
    ;
    Spark.prototype.SetFieldNameAgru = function (name) {
        this.ArgumentField.SetFieldName(name);
    };
    ;
    Spark.prototype.GetStoredNameAgru = function () {
        return this.ArgumentField.GetStoredName();
    };
    ;
    Spark.prototype.SetStoredNameAgru = function (name) {
        this.ArgumentField.SetStoredName(name);
    };
    ;
    Spark.prototype.GetTypeAgru = function () {
        return this.ArgumentField.GetType();
    };
    ;
    Spark.prototype.SetTypeAgru = function (dt) {
        this.ArgumentField.SetType(dt);
    };
    ;
    return Spark;
}());
exports.Spark = Spark;
var CalculatedField = /** @class */ (function () {
    function CalculatedField() {
    }
    return CalculatedField;
}());
exports.CalculatedField = CalculatedField;
var DashboardDataFields = /** @class */ (function () {
    function DashboardDataFields() {
    }
    return DashboardDataFields;
}());
exports.DashboardDataFields = DashboardDataFields;
;
var FilterOptions = /** @class */ (function () {
    function FilterOptions() {
    }
    return FilterOptions;
}());
exports.FilterOptions = FilterOptions;
var monthNames;
(function (monthNames) {
    monthNames[monthNames["January"] = 1] = "January";
    monthNames[monthNames["February"] = 2] = "February";
    monthNames[monthNames["March"] = 3] = "March";
    monthNames[monthNames["April"] = 4] = "April";
    monthNames[monthNames["May"] = 5] = "May";
    monthNames[monthNames["June"] = 6] = "June";
    monthNames[monthNames["July"] = 7] = "July";
    monthNames[monthNames["August"] = 8] = "August";
    monthNames[monthNames["September"] = 9] = "September";
    monthNames[monthNames["October"] = 10] = "October";
    monthNames[monthNames["November"] = 11] = "November";
    monthNames[monthNames["December"] = 12] = "December";
})(monthNames = exports.monthNames || (exports.monthNames = {}));
;
/********************************* Pivot *********************************************************/
var openedBinding;
(function (openedBinding) {
    openedBinding[openedBinding["values"] = 1] = "values";
    openedBinding[openedBinding["agrument"] = 2] = "agrument";
    openedBinding[openedBinding["serise"] = 3] = "serise";
    openedBinding[openedBinding["target"] = 4] = "target";
})(openedBinding = exports.openedBinding || (exports.openedBinding = {}));
var pivotString;
(function (pivotString) {
    pivotString[pivotString["count"] = 3] = "count";
    pivotString[pivotString["min"] = 4] = "min";
    pivotString[pivotString["max"] = 5] = "max";
})(pivotString = exports.pivotString || (exports.pivotString = {}));
var pivotint;
(function (pivotint) {
    pivotint[pivotint["sum"] = 1] = "sum";
    pivotint[pivotint["count"] = 3] = "count";
    pivotint[pivotint["min"] = 4] = "min";
    pivotint[pivotint["max"] = 5] = "max";
    pivotint[pivotint["average"] = 2] = "average";
})(pivotint = exports.pivotint || (exports.pivotint = {}));
var pivotdate;
(function (pivotdate) {
    pivotdate[pivotdate["count"] = 3] = "count";
})(pivotdate = exports.pivotdate || (exports.pivotdate = {}));
exports.data = [
    {
        "name": "Malawi",
        "address": "a1",
        "date": new Date("2017-5-17"),
        "sales": 7489,
        "target": 6603
    },
    {
        "name": "France",
        "address": "a1",
        "date": new Date("2017-2-17"),
        "sales": 4784,
        "target": 8965
    },
    {
        "name": "Syria",
        "address": "a1",
        "date": new Date("2017-11-17"),
        "sales": 2064,
        "target": 7611
    },
    {
        "name": "France",
        "address": "a1",
        "date": new Date("2016-1-17"),
        "sales": 4785,
        "target": 8965
    },
    {
        "name": "Syria",
        "address": "a1",
        "date": new Date("2017-12-17"),
        "sales": 2064,
        "target": 7611
    },
    {
        "name": "art3",
        "address": "a1",
        "date": new Date("2017-12-17"),
        "sales": 2064,
        "target": 7611
    },
    {
        "name": "Egypt",
        "address": "bike",
        "date": "2017-3-17",
        "sales": 9544,
        "target": 6541
    },
    {
        "name": "Egypt",
        "address": "moto",
        "date": "2017-2-17",
        "sales": 3265,
        "target": 6541
    },
    {
        "name": "Egypt",
        "address": "car",
        "date": "2017-7-17",
        "sales": 56787,
        "target": 6541
    },
    {
        "name": "Egypt",
        "address": "car",
        "date": "2017-8-17",
        "sales": 5672,
        "target": 6641
    }
];
var testFilter = [
    [
        {
            'id': 1,
            'city': "Cairo",
            'country': "EGY"
        },
        {
            'id': 1,
            'city': "Alex",
            'country': "EGY"
        },
        {
            'id': 1,
            'city': "California",
            'country': "USA"
        },
    ],
    [
        {
            'Vendor': "BMW"
        },
        {
            'Vendor': "Mercedes"
        },
    ],
];
var testData = [
    {
        'country': "USA",
        'Vendor': "BMW",
        'address': "ad1"
    },
    {
        'country': "EGY",
        'Vendor': "BMW",
        'address': "ad1"
    },
    {
        'country': "EGY",
        'Vendor': "Honda",
        'address': "ad1"
    },
];
