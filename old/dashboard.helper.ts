
import { EnumItem, 
         DateGroupEnum, 
         monthNames,
         CalculatedField } from './dashboard.model/dashboard-data-fields';
import { Cache } from './dashboard-cache.model';
import * as _ from "lodash";
import * as moment from 'moment';
import { Parser } from "expr-eval";
import * as dash from './dashboard.model/dashboard-data-fields';

export function isAlpha(character: any): boolean {
    return ((character >= 'a' && character <= 'z') || (character >= 'A' && character <= 'Z'));
}

export function enumToArray(enums: any[]): EnumItem[] {
    var arr: EnumItem[] = [];
    for (let e in enums) {
        arr.push({ id: enums[e], name: e });
    }
    return arr.splice(arr.length / 2);
}

export function toknize(str: string): string[] {
    let buffer = "";
    let result: string[] = [];
    for (let i = 0; i < str.length; i++) {
        if (str[i] == "_" || (str[i] >= 'a' && str <= 'z') || (str[i] >= 'A' && str[i] <= 'Z')) {
            buffer += str[i];
        } else if (buffer.length > 0) {
            result.push(buffer);
            buffer = "";
        }
    }
    if (buffer.length > 0) {
        result.push(buffer);
    }
    return result;
}

export function formatDate(date: any, type: DateGroupEnum, dashes: boolean = true): string {
    var dat = new Date(date);
    var DateFormated = "";
    if (!dashes) {
        if (type == DateGroupEnum.MonthYear) {
            DateFormated += "Year_" + (dat.getFullYear()).toString();
            DateFormated += "_" + (dat.getMonth() + 1).toString();
        } else if (type == DateGroupEnum.QuarterYear) {
            DateFormated += "Year_" + (dat.getFullYear()).toString();
            DateFormated += "_" + "Quarter_" + (_.ceil((dat.getMonth() + 1) / 3)).toString();
        } else if (type == DateGroupEnum.none) {
            DateFormated += "Year_" + (dat.getFullYear()).toString();
            DateFormated += "_" + (dat.getMonth() + 1).toString();
            DateFormated += "_" + (dat.getDay()).toString();
        } else if (type == DateGroupEnum.Year) {
            DateFormated += "Year_" + (dat.getFullYear()).toString();
        } else if (type == DateGroupEnum.Month) {
            DateFormated = monthNames[(dat.getMonth()+1)];
        }
    } else {
        if (type == DateGroupEnum.QuarterYear) {
            DateFormated = dat.getFullYear().toString();
            DateFormated += "/ Q " + (_.ceil((dat.getMonth() + 1) / 3)).toString();
        } else if (type == DateGroupEnum.MonthYear) {
            DateFormated = dat.getFullYear().toString();
            DateFormated += "/" + (dat.getMonth() + 1).toString();
        } else if (type == DateGroupEnum.none) {
            DateFormated = dat.getFullYear().toString();
            DateFormated += "/" + (dat.getMonth() + 1).toString();
            DateFormated += "/" + (dat.getDay()).toString();
            
        } else if (type == DateGroupEnum.Month) {
            DateFormated = monthNames[(dat.getMonth()+1)];
        } else if (type == DateGroupEnum.Year) {
            DateFormated = dat.getFullYear().toString();
        }
    }
    return DateFormated;
}

export function getRandomColor(): string {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

export function getRemainingDays(compareDate: any, orderActivationDate: any, daystoDelivery: number = 30): number {
    //console.log(CompareDate, OrderActivationDate, DaystoDelivery)
    let difference = 0;
    if (compareDate && compareDate != null && orderActivationDate && orderActivationDate != null) {
        let a = moment(compareDate);
        let b = moment(orderActivationDate);
        let days = a.diff(b, 'days');
        difference = daystoDelivery - days;
    }
    return difference;
}

export function average(index: string, type: string, field: string, obj: any[]): any {
    // if (!this.cashe[index + "avg" + field])
    //     this.cashe[index + "avg" + field] = this.GetCashe((index + type + field), obj, field) / obj.length;
    // return this.cache[index + "avg" + field];
    if (!Cache.getInstance.getCacheValue(index + "avg" + field)) {
        Cache.getInstance.setCache(index + "avg" + field, Cache.getInstance.getCache((index + type + field), obj, field) / obj.length);
    }
    return Cache.getInstance.getCacheValue(index + "avg" + field);
}

export function delta(index1: string, index2: string, base: string, target: string, type: string): any {
    if (!Cache.getInstance.getCacheValue(index1 + index2 + "delta" + base + target))
        Cache.getInstance.setCache(index1 + index2 + "delta" + base + target, _.round((Cache.getInstance.getCache((index1 + type + base), this.DataAsGroups[index1], base) /  Cache.getInstance.getCache((index2 + type + target), this.DataAsGroups[index2], target) - 1) * 100, 2));
          //this.cashe[index1 + index2 + "delta" + base + target] = _.round(( Cache.getInstance.getCache((index1 + type + base), this.DataAsGroups[index1], base) /  Cache.getInstance.getCache((index2 + type + target), this.DataAsGroups[index2], target)-1)*100,2);
    return Cache.getInstance.getCacheValue(index1 + index2 + "delta" + base + target);
    //this.cashe[index1 + index2 + "delta" + base + target];
}

export function calculateExpression(exp: CalculatedField, data: any[]) {
    var ExpressionTokens = toknize(exp.Expression);
    let obj = {};
    for (let i = 0; i < ExpressionTokens.length; i++) {
        obj[ExpressionTokens[i]] = _.sumBy(data, ExpressionTokens[i]);
    }
    var parser = new Parser();
    var expr = parser.parse(exp.Expression);
    return expr.evaluate(obj);
}
export function agro(op: dash.MeasureOperation, GroupName: string="", GroupData: any[], LastGroupName: string = "", target = 0): number{
    let group = GroupData || new Array<any>();
    let field = op.Field.StoredName;
    let index = (GroupName + dash.QueryTypeEnum.Measure + op.Type + field);
    let lastIndex = (LastGroupName + dash.QueryTypeEnum.Measure + op.Type + field);
    if (!this.cache.getCacheValue(index)) {//this.cashe[index]) {
        if (op.Type == dash.Measure.Sum) {
            // this.cashe[index] = _.sumBy(group, field);
            this.cache.setCache(index, _.sumBy(group, field));
        } else if (op.Type == dash.Measure.Average) {
            let sumIT = Object.assign({},op);
            sumIT.Type = dash.Measure.Sum
            let length = (group) ? group.length : 0;
            // this.cashe[index] = this.agro(sumIT, GroupName, GroupData) / group.length;
            this.cache.setCache(index, this.agro(sumIT, GroupName, GroupData) / group.length);
        } else if (op.Type == dash.Measure.Max) {
            // this.cashe[index] = _.maxBy(group, field)[field];
            this.cache.setCache(index, _.maxBy(group, field)[field]);
        } else if (op.Type == dash.Measure.Min) {
            // this.cashe[index] = _.minBy(group, field)[field];
            this.cache.setCache(index, _.minBy(group, field)[field]);
        } else if (op.Type == dash.Measure.Count) {
            // this.cashe[index] = group.length;
            this.cache.setCache(index, group.length);
        } else if (op.Type == dash.Measure.Accumulative) {
            // this.cashe[index] = _.sumBy(group, field);
            this.cache.setCache(index, _.sumBy(group, field));
            if (LastGroupName.length) {
                // this.cashe[index] += +this.cashe[lastIndex];
                this.cache.setCache(index, this.cache.getCacheValue(index) + +this.cache.getCacheValue(lastIndex));
            }

        } else if (op.Type == dash.Measure.Target) {
            // this.cashe[index] = (target/365)*30;
            this.cache.setCache(index, (target / 365) * 30);
            if (LastGroupName.length) {
                // this.cashe[index] += +this.cashe[lastIndex];
                this.cache.setCache(index, this.cache.getCacheValue(index) + +this.cache.getCacheValue(lastIndex));
            }
        }
    }
        
    return this.cache.getCacheValue(index);//this.cashe[index];
}
export function sortXY(data, agru,last =[]) {
    let counter = 0;
    let prioiry = [];
   // debugger;
   
    for (let label of agru) {
        prioiry[label] = counter++;
    }
    let setcounter = 0;
    for (let set of data) {
        set.data=set.data.sort(function (a, b) {
            return prioiry[a.x] - prioiry[b.x];
        })
      
        let t = 0;
        let temp = []
        for (let row of set.data) {

            while (agru[t] != row.x && t < agru.length) {
                temp.push({ 'x': agru[t]});
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
export function delta_v1(op: dash.Delta, GroupName1: string, GroupName2: string ,Groups:any[]):number {
    var actual = this.agro(op.ActualField, GroupName1, Groups[GroupName1])||0;
    var target = this.agro(op.TargetField, GroupName2, Groups[GroupName2])||0;
    var res:number;
   
    switch (op.Type) {
        case dash.DeltaTypeEnum.PercentVariation:
            res = _.round(((actual - target) / target) * 100),2;
            break;
        default:
            res = _.round(((actual / target)-1)-100,2);
    }
    return res;
}