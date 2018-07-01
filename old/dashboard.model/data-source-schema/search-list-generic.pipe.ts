import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({

  name: 'searchListGeneric'
})
@Injectable()
export class SearchListGenericPipe implements PipeTransform {

  transform(items: any[], field: string[], value: string): any[] {
    
    if (!items) return [];
    if (!value || value.length == 0 || !field || field.length == 0) return items
    debugger;
    let temp = items.filter(it => this.HandleNull(it[field[0]]).toLowerCase().indexOf(value.toLowerCase()) !== -1);
    for (var i = 1; i < field.length; i++) {
      temp = temp.concat(items.filter(it => this.HandleNull(it[field[i]]).toLowerCase().indexOf(value.toLowerCase()) !== -1));
    }
    items=temp
    return items;
  }
  HandleNull(x: String) {
    if (x == null) return " ";
    else return x
  }

}
