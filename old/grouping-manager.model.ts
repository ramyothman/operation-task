
import { GroupOperation, 
         DataTypeEnum, 
         Query, 
         QueryTypeEnum, 
         DateGroupEnum, 
         PreparedDataGroups, 
         DimensionField,
         SortingType,
         OperationTypeEnum,
         Measure,
         DashboardDataFields} from './dashboard.model/dashboard-data-fields';
import {toknize,average,formatDate} from './dashboard.helper'
import {FilterManager} from './dashboard-filter-manager'
import * as _ from "lodash";
import { Parser } from "expr-eval";
import {Cache} from './dashboard-cache.model'


export class GroupingManager {
    private Fields: DashboardDataFields[];
     private data: any[];
     private DataAsGroups: any;
     private FinalView: any[];
     private ExpressionTokens: string[];
     private  GroupFields: {};

    private static instance: GroupingManager;

    private GroupingManager() {}

    public static get getInstance(): GroupingManager {
        return this.instance || (this.instance = new this());
    }

    public groupByOperations(groupFields: GroupOperation[], dataSource: any[], removeNull: boolean = false): any[] {
        let result: any[] = [];
        var Data = [...dataSource];
        if (groupFields.length == 0) {
            result.push(Data);
            return result;
        }
        for (let row of Data) {
            let counter = 0;
            let grouped: string = "";
            let isNull = false;
            for (let role of groupFields) {
                let value: string = "";
                let FieldVal = "";
                if (removeNull && row[role.Field.StoredName] == null) {
                    isNull = true;
                    break;
                }
                if (role.Field.FieldType == DataTypeEnum.object && role.Type) {
                    value = formatDate(row[role.Field.StoredName], role.Type);
                    row[role.Field.FieldName] = value;
                } else {
                    value = row[role.Field.StoredName];
                }
                if (value && value.length) {
                    if (grouped && grouped.length)
                        grouped += " - ";
                    grouped += value.toString();
                }
            }
            if (isNull)
                continue;
            if (grouped.length > 0) {
                grouped= grouped.toString();
                if (!result.hasOwnProperty(grouped)) {
                    result[grouped] = [];
                }
                result[grouped].push(row);
            }
            else {
                result[counter] = [];
                result[counter++].push(row);
            }
        }
        return result;
    }

    public groupByQuery(groupQuery: Query, dataSource: any[], removeNull: boolean = false): any[] {
        groupQuery
        let resualt: any[] = [];
        var Data = [...dataSource];
        if (!groupQuery && !(groupQuery.QueryType == QueryTypeEnum.Group || groupQuery.QueryType == QueryTypeEnum.Serise)) {
            resualt.push(Data);
            return resualt;
        }
        let role = groupQuery.Operation;
        for (let row of Data) {
            let counter = 0;
            let grouped: string = "";
            let isNull = false;
            let value: string = "";
            let FieldVal = "";
            if (removeNull && row[role.Field.StoredName] == null) {
                isNull = true;
                continue;
            }
            if (role.Field.FieldType == DataTypeEnum.object && role.Type) {
                var dat = new Date(row[role.Field.StoredName]);
                value = formatDate(row[role.Field.StoredName], role.Type);
                row[role.Field.FieldName] = value;
            } else {
                value = row[role.Field.StoredName];
            }
            if (value && value.length) {
                grouped = value.toString();
            }
            if (grouped.length > 0) {
                grouped = grouped.toString();
                if (!resualt.hasOwnProperty(grouped)) {
                    resualt[grouped] = [];
                }
                resualt[grouped].push(row);
            } else {
                resualt[counter] = [];
                resualt[counter++].push(row);
            }
        }
        return resualt
    }

    public prepareGroups(queries: Query[], data: any[], removeNull: boolean = false): any[] {
        let groupOperations: GroupOperation[] = this.convertChartQueryToOperation(queries);
        groupOperations = groupOperations.concat(this.convertGroupQueryToOperation(queries));
        let result = this.groupByOperations(groupOperations, data, removeNull);
        return this.sortGroups(result);
    }

    public groupWithFields(groupFields: GroupOperation[], dataSource: any[], Qtype: QueryTypeEnum = QueryTypeEnum.Group, removeNull: boolean = false, sortGroups = true): PreparedDataGroups {
        let fields: Array<DimensionField> = new Array<DimensionField>();
        let seperatedFields = [];
        let result: any[] = [];
        let sort = false;
        var Data = [...dataSource];
        if (groupFields.length == 0) {
            result.push(Data);
            return new PreparedDataGroups(result, fields, seperatedFields);
        }
        groupFields = _.sortBy(groupFields, x => { return x.GetFieldName()})
        for (let row of Data) {
            let counter: number = 0;
            let grouped: string = "";
            let isNull: boolean = false;
            let RowGoups = [];
            let rowOut: boolean = false;
            for (let role of groupFields) {
                sort = sort || role.sort;
                let value:string = "";
                let FieldVal = "";
                if (removeNull && row[role.Field.StoredName] == null) {
                    isNull = true;
                    break;
                }
                if (role.Field.FieldType == DataTypeEnum.object && role.Type) {
                    var dat = new Date(row[role.Field.StoredName]);
                    if (role.Type == DateGroupEnum.Month) {
                        let today = new Date();
                        if (dat.getFullYear() != today.getFullYear()) {
                            rowOut = true;
                            break;
                        }
                    }
                    value = formatDate(row[role.Field.StoredName], role.Type);
                    row[role.Field.FieldName] = value;
                } else {
                    value = row[role.Field.StoredName];
                }
                if (value && value.length) {
                    RowGoups[role.GetFieldName()] = value;
                    if (grouped.length)
                        grouped += " - ";
                    grouped += value;
                    if (!fields[counter]) {
                        fields[counter] = new DimensionField(role.Field.FieldName, Qtype, new Array<string>(),true);
                    }
                    if (fields[counter].value.findIndex(x => { return x == value }) == -1) {
                        fields[counter].value.push(value);
                        
                    }
                        
                }
                counter++;
            }
            if (isNull || rowOut)
                continue;
            if (grouped.length > 0) {
                if (!result.hasOwnProperty(grouped)) {
                    //debugger;
                    result[grouped] = [];
                    seperatedFields.push(RowGoups);
                }
                result[grouped].push(row);
            } else {
                result[counter] = [];
                result[counter++].push(row);
            }
        }
        // if (!resualt.length && sort)
        if (sortGroups) {
            let t = this.sortWithFields(result, seperatedFields);
            result = t.data;
            seperatedFields = t.sperated;
        }
        return new PreparedDataGroups(result, fields, seperatedFields);
    }

    public prepareGroupsWithFields(queries: Query[], data: any[], removeNull: boolean = false, sortGroups: boolean = true): PreparedDataGroups {
        let groupOperations: GroupOperation[] = this.convertGroupQueryToOperation(queries);
        return this.groupWithFields(groupOperations, data, QueryTypeEnum.Group, removeNull, sortGroups);
    }

    public sortWithFields(data: any[], seperated: any[]) {
        let keys = new Array<string>();
        let result1 = [];
        let result2 =  []
        let temp_seperation= []
        for (let key in data) {
            keys.push(key);
        }
        let counter = 0;
        for (let sp of seperated) {
            temp_seperation[keys[counter]] =sp;
            counter++;
        }
        keys.sort();
        for (let key of keys) {
            result1[key] = _.cloneDeep(data[key]);
            result2.push(temp_seperation[key]);
        }
        return { data: result1, sperated: result2 };
    }

    public sortGroups(groups: any[], type: SortingType = SortingType.ascending): any[] {
        let keys = new Array<string>();
        let result = [];
        let res = type;
        for (let key in groups) {
            keys.push(key);
        }
        keys.sort(function (a, b) { return res * ((a < b) ? - 1 : (a > b) ? 1 : 0) });
        for (let key of keys) {
            result[key] = _.cloneDeep(groups[key]);
        }
        return result;
    }

    public concatDistinctroups(T: DimensionField[], S: DimensionField[]): DimensionField[] {
        for (let RT of T) {
            for (let RS of S) {
                if (RT.name == RS.name) {
                    for (let val of RS.value) {
                        var found = RT.value.findIndex(x => { return x == val });
                        if ( found == -1)
                            RT.value.push(val);
                    }
                }
            }
        }
        return T;
    }

    private convertGroupQueryToOperation(queries: Query[]): GroupOperation[] {
        let Q: GroupOperation[] = [];
        for (let query of queries) {
            if (query.QueryType == QueryTypeEnum.Group) {
                Q.push(query.Operation);     
            }
        }
        return Q;
    }

    private convertChartQueryToOperation(queries: Query[]): GroupOperation[] {
        let Q: GroupOperation[] = [];
        for (let query of queries) {
            if (query.QueryType == QueryTypeEnum.Chart) {
                query.Operation.CompareDate.Type = DateGroupEnum.none;
                query.Operation.CompareToDate.Type = DateGroupEnum.none;
                Q.push(query.Operation.CompareDate);
                Q.push(query.Operation.CompareToDate);
            }
        }
        return Q;
    }
    private Delta(index1: string, index2: string, base: string, target: string, type: string): any[] {
        if (!Cache.getInstance.getCacheValue(index1 + index2 + "delta" + base + target))
            Cache.getInstance.setCache(index1 + index2 + "delta" + base + target, _.round(( Cache.getInstance.getCache((index1 + type + base), this.DataAsGroups[index1], base) /  Cache.getInstance.getCache((index2 + type + target), this.DataAsGroups[index2], target)-1)*100,2));
              //this.cashe[index1 + index2 + "delta" + base + target] = _.round(( Cache.getInstance.getCache((index1 + type + base), this.DataAsGroups[index1], base) /  Cache.getInstance.getCache((index2 + type + target), this.DataAsGroups[index2], target)-1)*100,2);
        return Cache.getInstance.getCacheValue(index1 + index2 + "delta" + base + target);
        //this.cashe[index1 + index2 + "delta" + base + target];
    }
    private operate_v1(): void {
        for (let role of this.Fields) {
            let count = 0;

            for (let inx1 in this.DataAsGroups) {

                let newR: any = {};
                let group = this.DataAsGroups[inx1];


                for (let field in group[0]) {
                    if (role.FieldName == field) {

                        if (role.OperationType == OperationTypeEnum.Group && !newR[role.DisplayName]) {
                            newR[role.DisplayName] = group[0][field];
                        }
                        else if (role.OperationType == OperationTypeEnum.Measure) {
                            if (role.MeasureType == Measure.Sum)
                                newR[role.DisplayName] = Cache.getInstance.getCache((inx1 + "sum" + field), group, field);
                            else if (role.MeasureType == Measure.Max) {
                                newR[role.DisplayName] = _.maxBy(group, field)[field];
                            }
                            else if (role.MeasureType == Measure.Min) {
                                newR[role.DisplayName] = _.minBy(group, field)[field];
                            }
                            else if (role.MeasureType == Measure.Average) {
                                newR[role.DisplayName] = average(inx1, "sum", field, group);
                            }
                            else if (role.MeasureType == Measure.Count) {
                                newR[role.DisplayName] = group.length;
                            }
                        }

                        else if (role.OperationType == OperationTypeEnum.Delta) {

                            newR[role.DisplayName] = this.Delta(inx1, inx1, field, role.DeltaTargetDataField, "sum");
                        }
                        else if (role.OperationType == OperationTypeEnum.DeltaGroup && (inx1 == role.DeltaGroupsTypeValue[0] || inx1 == role.DeltaGroupsTypeValue[1])) {
                            newR[role.DisplayName] = this.Delta(role.DeltaGroupsTypeValue[0], role.DeltaGroupsTypeValue[1], field, role.DeltaTargetDataField, "sum");
                            // //console.log(_.sumBy(this.DataAsGroups[role.DeltaGroupsTypeValue[1]], role.DeltaTargetDataField));
                        }
                        else if (role.OperationType == OperationTypeEnum.Spark) {
                            newR[role.DisplayName] = {};
                            newR[role.DisplayName]["points"] = [];
                            for (let point in group) {

                                var SparkObj = {};
                                var dt = new Date(group[point][role.SparkDateFieldName]);
                                SparkObj["Fulldate"] = dt;
                                if (role.SparkDateType == DateGroupEnum.QuarterYear) {

                                    SparkObj["value"] = group[point][role.FieldName];
                                    SparkObj["Year"] = dt.getFullYear().toString();
                                    SparkObj["count"] = 1;

                                    SparkObj["date"] = _.ceil((dt.getMonth() + 1) / 3).toString();
                                    let check = _.find(newR[role.DisplayName].points, { 'Year': SparkObj["Year"], 'Quarter': SparkObj["Quarter"] })
                                    if (check) {
                                        check['value'] += SparkObj["value"];
                                        check["count"]++;
                                    }
                                    else
                                        newR[role.DisplayName].points.push(SparkObj);
                                    newR[role.DisplayName]["Date_Type"] = "Quarter";
                                }
                                else if (role.SparkDateType == DateGroupEnum.Year) {

                                    SparkObj["value"] = group[point][role.FieldName];
                                    SparkObj["Year"] = dt.getFullYear().toString();
                                    SparkObj["date"] = SparkObj["Year"];
                                    SparkObj["count"] = 1;
                                    let check = _.find(newR[role.DisplayName].points, { 'Year': SparkObj["Year"] })
                                    if (check) {
                                        check['value'] += SparkObj["value"];
                                        check["count"]++;
                                    }
                                    else
                                        newR[role.DisplayName].points.push(SparkObj);
                                    newR[role.DisplayName]["Date_Type"] = "Year";
                                }
                                else if (role.SparkDateType == DateGroupEnum.MonthYear) {

                                    SparkObj["value"] = group[point][role.FieldName];
                                    SparkObj["Year"] = dt.getFullYear().toString();
                                    SparkObj["date"] = _.ceil(dt.getMonth() + 1).toString();
                                    let check = _.find(newR[role.DisplayName].points, { 'Year': SparkObj["Year"], 'Month': SparkObj["Month"] })
                                    SparkObj["count"] = 1;
                                    if (check) {
                                        check['value'] += SparkObj["value"];
                                        check["count"]++;
                                    }
                                    else
                                        newR[role.DisplayName].points.push(SparkObj);
                                    newR[role.DisplayName]["Date_Type"] = "Month";
                                }
                                // if()
                                // newR[role.DisplayName].points = _.sortBy(newR[role.DisplayName].points, ['date']);
                            }
                            newR[role.DisplayName]["MAX"] = _.maxBy(newR[role.DisplayName].points, 'value');
                            newR[role.DisplayName]["MIN"] = _.minBy(newR[role.DisplayName].points, 'value');
                        }


                    }
                    if (role.OperationType == OperationTypeEnum.calc && !newR[role.DisplayName]) {

                        if (!this.ExpressionTokens.length) {
                            this.ExpressionTokens = toknize(role.Expression);
                        }
                        let obj = {};
                        for (let i = 0; i < this.ExpressionTokens.length; i++) {
                            obj[this.ExpressionTokens[i]] = Cache.getInstance.getCache((inx1 + "sum" + this.ExpressionTokens[i]), group, this.ExpressionTokens[i]);
                        }
                        var parser = new Parser();
                        var expr = parser.parse(role.Expression);
                        newR[role.DisplayName] = expr.evaluate(obj)

                    }
                }
                if (this.FinalView.length > count) {
                    this.FinalView[count] = {
                        ...this.FinalView[count],
                        ...newR
                    };
                }
                else {
                    newR["count"] = group.length;
                    this.FinalView.push(newR);
                }
                count++;
            }

        }
        // //console.log(this.FinalView);
        ////console.log(this.cashe);

    }
    public FilterAndGroup(FilterString: string, GroupOptions: DashboardDataFields[], Data: any[], FilterFirst = 1) {
        if (FilterFirst) {
            return this.GroupBy(GroupOptions, FilterManager.getInstance.filterByString(FilterString,Data));
        }
        else
            return FilterManager.getInstance.filterByString(FilterString, this.GroupBy(GroupOptions, Data));
    }
    public GroupBy(fields: DashboardDataFields[], Data: any[]): any[] {


        this.FinalView = [];
        Cache.getInstance.resetCache();
        this.DataAsGroups = [];
        this.GroupFields = [];
        this.ExpressionTokens = [];
        this.Fields = fields;
        this.data = Data;
        // this.BuildGroupFields();
        this.BuildGroups();
        // //console.log(this.DataAsGroups);
        this.operate_v1();


        return this.FinalView;
    }
    private BuildGroups() {
        let counter = 0;
        for (let row of this.data) {

            let grouped: string = "";
            for (let entity of this.Fields) {
                let FieldVal = "";
                if (entity.OperationType == OperationTypeEnum.Group) {
                    if (entity.DataType && entity.DataType == DataTypeEnum.object) {
                        var dat = new Date(row[entity.FieldName]);
                        grouped += (dat.getFullYear()).toString()
                        if (entity.GroupedDateType == DateGroupEnum.MonthYear) {
                            grouped += (dat.getMonth() + 1).toString();
                        }
                        else if (entity.GroupedDateType == DateGroupEnum.QuarterYear) {
                            grouped += (_.ceil((dat.getMonth() + 1) / 3)).toString();
                        }

                    }
                    else
                        grouped += row[entity.FieldName];
                }
            }
            
            if (grouped.length > 0) {
                if (!this.DataAsGroups.hasOwnProperty(grouped)) {
                    this.DataAsGroups[grouped] = [];
                }
                this.DataAsGroups[grouped].push(row);
            }
            else {
                this.DataAsGroups[counter] = [];
                this.DataAsGroups[counter++].push(row);
            }
        }

    }
}