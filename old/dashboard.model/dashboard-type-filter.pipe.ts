import { Pipe, PipeTransform } from '@angular/core';
import { DataTypeEnum } from './dashboard-data-fields';
@Pipe({
  name: 'dashboardTypeFilter'
})
export class DashboardTypeFilterPipe implements PipeTransform {

    transform(items: any, field: string, value: number[], args?: any): any {
      
        if (!items) return [];
        if (!value || value.length == 0)
            return items
        return items.filter(it => value.indexOf(it[field]) !== -1);
    
  }

}

