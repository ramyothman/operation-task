import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'searchList3'
})
@Injectable()
export class SearchListPipe3 implements PipeTransform {

    transform(items: any[], field: string[], value: string): any[] {
        debugger;
        if (!items) return [];
        if (!value || value.length == 0 || !field || field.length == 0 ) return items
        //if (!field || field.length == 0)  return items
        // else {
        if (field.length == 1) return items.filter(it => this.HandleNull(it[field[0]]).toLowerCase().indexOf(value.toLowerCase()) !== -1);
        if (field.length == 2) return items.filter(it => this.HandleNull(it[field[0]]).toLowerCase().indexOf(value.toLowerCase()) !== -1 || this.HandleNull(it[field[1]]).toLowerCase().indexOf(value.toLowerCase()) !== -1);
        if (field.length == 3) return items.filter(it => this.HandleNull(it[field[0]]).toLowerCase().indexOf(value.toLowerCase()) !== -1 || this.HandleNull(it[field[1]]).toLowerCase().indexOf(value.toLowerCase()) !== -1 || this.HandleNull(it[field[2]]).toLowerCase().indexOf(value.toLowerCase()) !== -1);
        //}
    }
    HandleNull(x:String)
    {
        if (x == null) return " ";
        else return x
    }

}