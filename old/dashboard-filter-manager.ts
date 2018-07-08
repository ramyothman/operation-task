
import { DashboardWidget} from './dashboard.model/dashboard-widget.model';
import * as dash from './dashboard.model/dashboard-data-fields';
import * as numeral from 'numeral';
import * as _ from "lodash";
import {formatDate , isAlpha} from './dashboard.helper'
import { DashBoardWidgetBuilder } from './dashboard-widget-builder';

declare var jQuery:any;
export class FilterManager{
    public static MasterFilter: any[] = [];
    public static MasterFilterListIDs: any[] = [];
    private static instance : FilterManager;
    private constructor(){} // private to prevent to create more than one instance by access constructor from outside
    public static getInstance(): FilterManager{   // can create one and only one instance " singleton "
        if(this.instance == null){
            this.instance = new FilterManager();
        }
        return this.instance;
    }
    public applyFilters(widget: DashboardWidget, Updating:boolean=false) {
       
        var changed: boolean= false;
        var operate: any[] = [];
      
        ///chech for strign filter
       

        //check if there  are master filter to Aplay   
        if (widget.MasterFilter) {
            let data = widget.OrginalDatasource 
            operate = jQuery.extend(true, [], FilterManager.MasterFilter);
            operate['F' + widget.ID] = [];
            changed = true;
        }
        //check for local selected components filter
        else if (Object.keys(widget.AcceptFilter).length > 0) {
            for (let id in widget.AcceptFilter) {
                if (widget.AcceptFilter[id]){ 
                if (FilterManager.MasterFilter[id]) {
                    operate.push(_.cloneDeep(FilterManager.MasterFilter[id]));
                    if (!changed)
                        changed = true;
                }
              }
            }
        }
        let widgetBuilder;
        if (changed) {
            var finalData= _.cloneDeep(widget.OrginalDatasource);
            if (widget.FilterString && widget.FilterString.length > 3) { finalData = this.filterByString(widget.FilterString, finalData); }
            widget.Datasource = this.filterLists(operate, finalData);
            widgetBuilder = new DashBoardWidgetBuilder(widget)
            
            widgetBuilder.build();//this.BuildWidget(widget);
        }
        else if (Updating) {
            var finalData = _.cloneDeep(widget.OrginalDatasource);
            if (widget.FilterString && widget.FilterString.length > 3) { finalData = this.filterByString(widget.FilterString, finalData); }
            widget.Datasource = finalData;

            widgetBuilder = new DashBoardWidgetBuilder(widget)
            
            widgetBuilder.build();//this.BuildWidget(widget);
        }
           
    }
    public filterByString(FilterString: string, data: any[]): any[] {
        if (FilterString.length > 3)
            return jQuery.grep(data, (o) => { return eval(FilterString) });
    }
    public filterLists(FilterList: any[], Datasource: any[]): any[] {
        //console.log(FilterList);
       
        let data = _.cloneDeep(Datasource);
        //console.log(data)
        var Filtered: any[] = []
        for (let row of data) {
            var isValid: boolean = true;
           
            for (let list in FilterList) {
               
                isValid = (isValid && this.checkFilterValidity(FilterList[list], row))
            }
            if (isValid)
                Filtered.push(row);
        }
        //console.log(Filtered)
        return Filtered;
    }
    private checkFilterValidity(list: any[], data: any): boolean {    // check if filter apply to the data
        if (list.length == 0)
            return true;
        for (let obj of list) {
            var acepted: boolean = true;
            for (let head in obj) {
               
                if (data.hasOwnProperty(head)) {
                    if (dash.DataTypeEnum[typeof (obj[head])] != dash.DataTypeEnum.object) {
                        if (obj[head] != data[head]) { acepted = false; break; }
                    }
                    else {
                        if (obj[head].date != formatDate(data[head], obj[head].type)) {
                            { acepted = false; break; }
                        }
                    }
                      
                }
            }
            if (acepted)
                return true;
        }
        if (!acepted)
            return false;
        return true;
    }
    private constructFilterString(expr: string, obj: string): string {
        let res: string = ""
        for (let i = 0; i < expr.length; i++) {
            if (expr[i] == '\'') {
                res += expr[i++];
                while (expr[i] != '\'' && i < expr.length) { res += expr[i++]; }
                if (expr[i] == '\'')
                    res += expr[i];
            }
            else if (isAlpha(expr[i] || expr[i] == '_')) {
                var buffer = "";
                while (isAlpha(expr[i] || expr[i] == '_') && i < expr.length) { buffer += expr[i++]; }
                if (buffer == "and")
                    res += " && ";
                else if (buffer == "or")
                    res += " || ";
                else {
                    res += obj + buffer;

                }
                i--;
            }
            else
                res += expr[i];
        }

        return res;
    }
    

}