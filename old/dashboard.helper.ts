
import { EnumItem, DateGroupEnum, monthNames } from './dashboard.model/dashboard-data-fields';
import * as _ from "lodash";
import * as dash from './dashboard.model/dashboard-data-fields'
import * as moment from 'moment';

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

export function  getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

export function getRemainingDays(CompareDate: any, OrderActivationDate: any, DaystoDelivery: number = 30): number {
    //console.log(CompareDate, OrderActivationDate, DaystoDelivery)
    let Difference = 0;
    if (CompareDate && CompareDate != null && OrderActivationDate && OrderActivationDate != null) {

        let a = moment(CompareDate);
        let b = moment(OrderActivationDate);
        let days = a.diff(b, 'days');
        Difference = DaystoDelivery - days;
    }
    return Difference;
}
export function average(index: string, type: string, field: string, obj: any[]):void {
    if (!this.cashe[index + "avg" + field])
        this.cashe[index + "avg" + field] = this.GetCashe((index + type + field), obj, field) / obj.length;
    return this.cashe[index + "avg" + field]
}
