
import { GroupOperation, 
         DataTypeEnum, 
         Query, 
         QueryTypeEnum, 
         DateGroupEnum, 
         PreparedDataGroups, 
         DimensionField,
         SortingType } from './dashboard.model/dashboard-data-fields';
import { formatDate } from './dashboard.helper';
import * as _ from "lodash";

export class GroupingManager {

    private static instance: GroupingManager;

    private GroupingManager() {}

    public static get getInstance() {
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
        return this.groupByOperations(groupOperations, data, removeNull);
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

    public sortGroups(groups: any[], type: SortingType = SortingType.ascending) {
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
}