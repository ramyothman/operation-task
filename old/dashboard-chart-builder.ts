import { DashboardWidget, widgetData } from "./dashboard.model/dashboard-widget.model";
import {chartBuilderInterface} from "./dashboard-chart-builder-abstract"
import {Cache} from "./dashboard-cache.model"
import { GroupingManager } from "./dashboard-grouping-manager.model";
import * as dash from './dashboard.model/dashboard-data-fields';
import { LabelManager } from "./dashboard-label-manager";
import { agro, delta_v1, formatDate, getRemainingDays, toknize } from "./dashboard.helper";
import { DimensionField } from "./dashboard.model/dashboard-data-fields";
import * as numeral from 'numeral';
import { SeriseManager } from "./dashboard-serise-manager";
import * as _ from "lodash";
import { Parser } from "expr-eval";
import { chartJsBuilder } from "./dashboard-chart-js-builder";


export class chartBuilder implements chartBuilderInterface{
    
    
    widget: DashboardWidget;
    queries: any[];
    dataSource: any;
    private cache: Cache = Cache.getInstance;
    constructor(widget: DashboardWidget){
        this.widget = widget;
        this.queries = widget.Operations;
        this.dataSource = widget.Datasource;
    }
    public buildGridChart():void{
        //
        //let this.queries = this.widget.Operations;
        //let this.dataSource = this.widget.Datasource;
        this.cache.resetCache()//this.restCashe();//Cache.getInstance.resetCache(); //this.cashe = [];   
        var datav = [...this.dataSource]  
        var res = GroupingManager.getInstance.prepareGroups(this.queries, datav); //PrepareGroups(this.queries, datav);
        this.widget.CurrentData = this.operate_v2(this.queries, res );
        
    }

    public buildPivotChart():void{
        let DataSource;
        DataSource = {
            fields: this.queries,
            store: this.dataSource
        }
        this.widget.CurrentData =  DataSource;
    }
    public buildExpBarChart():void{
        //let this.queries = this.widget.Operations;
        //let this.dataSource = this.widget.Datasource;
        let actual: dash.Query;
        let target: dash.Query;
        let groupField: dash.Query;
       // debugger;
        for (let q of this.queries) {
            if (q.QueryType == dash.QueryTypeEnum.Measure && q.QuerySubType == dash.QuerySubTypeEnum.ActualExp) {
                actual = q;
            }
            else if (q.QueryType == dash.QueryTypeEnum.Measure && q.QuerySubType == dash.QuerySubTypeEnum.TargetExp) {
                target = q;
            }
            else if (q.QueryType == dash.QueryTypeEnum.Group && q.Operation.Type == dash.DateGroupEnum.Month) {
                groupField = q;
            }
        }
        if (!groupField || !actual || !target){

            //this.buildFlatCharts_chartjs();
            let chartJS = new chartJsBuilder(this.widget); 
            chartJS.buildFlatChart();
            return; // buildFlatChart_chartjs already has last 4 lines
        }
        let T =  GroupingManager.getInstance.prepareGroupsWithFields([groupField], this.dataSource);  //this.PrepareGroups_withFields([groupField], this.dataSource);
        let DataSource= T.data
        /**********************///
        this.cache.resetCache()//this.restCashe();//Cache.getInstance.resetCache();
        let labels = LabelManager.getInstance.constructExpLabels(dash.DateGroupEnum.Month);//this.constructorExpLabels(dash.DateGroupEnum.Month);
        let dataset: any[] = [];
        let actualData = []
        let targetData = []
       
        let expData = []
        let lastGroup = ""
        let lastExp = 0;
        let totalExp = 0;
        let targetConst = 0;
        
       //debugger;
        for (let inx in DataSource) {
            let g = DataSource[inx];
            if (g.length) {
                targetConst =g[0][target.Operation.Field.StoredName];
                break;
            }
        }
        if (typeof targetConst != "number")
            targetConst = 0;
        let date = new Date();
        let month = date.getMonth()+1;
        let today = date.getDay();
        let rate:number = null;

        for (let label of labels) {
            let groupSep = [];
            groupSep[groupField.Operation.Field.FieldName] = label;
            let targetValue = agro(target.Operation, label, DataSource[label], lastGroup, targetConst);
            let ActualValue = 0;
            let ExpValue = 0;
            if (dash.monthNames[label] <= month) {
                ActualValue = agro(actual.Operation, label, DataSource[label], lastGroup);
                ExpValue = ActualValue;
            }
            if (dash.monthNames[label] >= month){
                if (<any> dash.monthNames[label] == month) {
                    ExpValue = ActualValue
                    rate = (ActualValue /(((month - 1) * 30) + today)) ;
                   // rate /= 360;
                    //console.log(rate);
                    ExpValue = ActualValue+(rate * (30-today)) + lastExp;
                }
                else
                    ExpValue = (rate*30)+ lastExp
            }
            let groups = DataSource[label];
         
            actualData.push({ 'y': ActualValue, 'x': label, 'group': groupSep })
            targetData.push({ 'y': targetValue, 'x': label, 'group': groupSep })
            expData.push({ 'y': ExpValue, 'x': label, 'group': groupSep })
            lastGroup = label;
            lastExp = ExpValue;
           
        }
        let ExpField = new dash.Field();
        ExpField.FieldName = "Exp OF " + actual.Operation.Field.FieldName;

        dataset.push({ "label": "Target", type: "line", 'data': targetData,  'Field': target.Operation.Field, 'serise': "", 'serisList': [], 'backgroundColor': [], "labels": labels, "role": target });

        dataset.push({ "label": "Expected Value" , type: "line", 'data': expData,  'Field': ExpField, 'serise': "", 'serisList': [], 'backgroundColor': [], "labels": labels, "role": actual });
        dataset.push({ "label": "Value", 'data': actualData, 'Field': actual.Operation.Field, 'serise': "", 'serisList': [], 'backgroundColor': [], "labels": labels, "role": actual });

        let measureFields = new DimensionField("Measure", dash.QueryTypeEnum.Measure, new Array<string>(), false);
        measureFields.value.push(actual.Operation.GetFieldName());
        measureFields.value.push(target.Operation.GetFieldName());
        measureFields.value.push(ExpField.FieldName);
        /*********************///
        this.widget.CurrentData = new widgetData(labels, dataset, [], T.GroupsValue, measureFields,[]);
        this.widget.syncLabels(this.widget.CurrentData.labels);
        LabelManager.getInstance.reSortLabels(this.widget);//this.reSortLabels(this.widget);
        this.widget.BuildSchema();
        this.widget.UpdateColors();
    }
    public buildDigitChart():void{
        //let this.queries = this.widget.Operations;
        //let this.dataSource = this.widget.Datasource;
        let result=this.operate_v2(this.queries, [this.dataSource],false);
        let target:number = 0;
        let actual:number = 0;
        if (result && result.length>0)
        for (let Q of this.queries) {
            if (Q.QueryType == dash.QueryTypeEnum.Measure) {
                if (Q.QuerySubType == dash.QuerySubTypeEnum.DigitActual)
                    actual = +result[0][Q.Operation.GetFieldName()];
                else if (Q.QuerySubType == dash.QuerySubTypeEnum.DigitTarget)
                    target = +result[0][Q.Operation.GetFieldName()];
            }
            }
        this.widget.CurrentData = numeral(actual - target).format('0.0a');
    }
    public buildActiveTotalChart():void {
     //   let this.queries = this.widget.Operations;
       // let this.dataSource = this.widget.Datasource;
        let result = [];
        let Active = 0;
        let total = 0
        //debugger;
        let Measure = [];
        let Group = []
        for (let Q of this.queries) {
            if (Q.QueryType == dash.QueryTypeEnum.ActiveTotal) {
                let q = new dash.Query();
                q.QueryType = dash.QueryTypeEnum.Measure;
                q.Operation = Q.Operation.ActualField;
                Measure.push(q);
                q = new dash.Query();
                q.QueryType = dash.QueryTypeEnum.Measure;
                q.Operation = Q.Operation.TargetField;
                Measure.push(q);
            }
            else if (Q.QueryType == dash.QueryTypeEnum.Group) {
                Group.push(Q);
                //Group.push(Q.Operation.TargetField);
            }
        }
        let ans = GroupingManager.getInstance.prepareGroups(Group, this.dataSource, true);   //this.PrepareGroups(Group, this.dataSource, true);
        ans = this.operate_v2(Measure.concat(Group), ans);
        for (let Q of this.queries) {
            if (ans && ans[0] && Q.QueryType == dash.QueryTypeEnum.ActiveTotal) {
                Active = ans[0][Q.Operation.ActualField.GetFieldName()] || 0;
                total = ans[0][Q.Operation.TargetField.GetFieldName()] || 0;
                result.push({ "Query": Q, "active": Active, "total": total });
            }
        }
        console.log(result);
        this.widget.CurrentData =  result;

    }
    public buildGaugeChart():void {
     //   let this.queries = this.widget.Operations;
       // let this.dataSource = this.widget.Datasource;
        let serise =  GroupingManager.getInstance.prepareGroups(this.queries, this.dataSource)//this.PrepareGroups(this.queries, dataSource);
        let layers = [];
    //    debugger;
        for (let Q of this.queries) {
           
            if (Q.QueryType == dash.QueryTypeEnum.Delta) {
                let currentLayer = []
                for (let index in serise) {
                    let name = ""
                    this.cache.resetCache()//this.restCashe(); // Cache.getInstance.resetCache();
                    let value = delta_v1(Q.Operation, index, index, serise)
                    if (index != "0")
                        name = index;
                    let actualSum = agro(Q.Operation.ActualField, index, serise) || 0
                    let TargetSum = agro(Q.Operation.TargetField, index, serise) || 0
                    currentLayer.push({ 'name': name, 'value': value, 'TargetValue': TargetSum, 'ActualValue': actualSum})

                }
                layers.push({ "name": Q.Operation.GetFieldName(),"data": currentLayer });
            }

        }
     //   debugger;
        this.widget.CurrentData =  layers;
    }
    public buildFlatChart() :void{
       // let this.queries = this.widget.Operations;
        //let this.dataSource = this.widget.Datasource;
        this.cache.resetCache()//this.cashe = [];// Cache.getInstance.resetCache();
        var groups: dash.Query[] = []
        var agro: dash.Query[] = [];
        var ser: dash.Query[] = [];
        var final = [];
        var result = [];
        var agruments = [];
        var all_serise: string[] = [];
        for (let i of this.queries) {
            if (i.QueryType == dash.QueryTypeEnum.Group)
                groups.push(i);
            else if (i.QueryType == dash.QueryTypeEnum.Serise)
                ser.push(i);
            else
                agro.push(i);
        }
        let Datasource = GroupingManager.getInstance.prepareGroups(groups, this.dataSource,true);//this.PrepareGroups(groups, Datasource,true);
        var i = 0;
        //console.log(Datasource)
        for (let row in Datasource) {
            var res = SeriseManager.getInstance.prepareSerise(ser, Datasource[row],true);//this.prepareSerise(ser, Datasource[row],true)
          
            agruments.push(row);
            this.cache.resetCache()//this.restCashe();//Cache.getInstance.resetCache();
            final.push(this.operate_v2(ser.concat(agro), res,true, false, true,true))
        }
        final = SeriseManager.getInstance.handleSerise(ser, final, agruments)//this.handleSerise(ser, final, agruments);
        //console.log(final);
        console.log(final)
        this.widget.CurrentData = final;
    }
    private operate_v2(Roles: dash.Query[], DataSource: any[],formatNumbers=true, withIndex?: boolean, seriseIsGroups?:boolean,HideGroupValue?:boolean): any[] {
        
        
        let result: any[] = []
        let ExpressionTokens: any[] = [];
        let count1 = 0;
        this.cache.resetCache()//this.restCashe();//Cache.getInstance.resetCache();
        for (let role of Roles) {
            let count = 0;
            let maxVal = null;
            let minVal = null;
            if (role.QueryType == dash.QueryTypeEnum.Serise && !seriseIsGroups)
                continue;
            for (let inx1 in DataSource) {

                let newR: any = {};
                let group = DataSource[inx1];
               
                if ((role.QueryType == dash.QueryTypeEnum.Group || role.QueryType == dash.QueryTypeEnum.Serise) && !newR[role.Operation.Field.FieldName]) {
                    var recored = "";
                    if (role.Operation.Field.FieldType == dash.DataTypeEnum.object && role.Operation.Type) {

                        var dt = new Date(group[0][role.Operation.Field.StoredName]);
                        recored = formatDate(group[0][role.Operation.Field.StoredName], role.Operation.Type);
                    }
                    else
                        recored = group[0][role.Operation.Field.StoredName];
                    if (role.QueryType == dash.QueryTypeEnum.Serise && seriseIsGroups) {
                        if (!newR["serise"])
                            newR["serise"] = "" + recored;
                        else
                            newR["serise"] += "-" + recored;
                    }
                    if (!HideGroupValue)
                        newR[role.Operation.Field.FieldName] = recored;
                }
                else if (role.Operation.Field && inx1.indexOf("null") != -1) {
                    newR[role.Operation.Field.FieldName] = 0;
                }
                else if (role.QueryType == dash.QueryTypeEnum.Measure && !newR[role.Operation.Field.FieldName]) {
                
                     newR[role.Operation.Field.FieldName] = agro(role.Operation, inx1, group);
                   
                }
                else if (role.QueryType == dash.QueryTypeEnum.Delta && !newR[role.Operation.FieldName]) {
                    if (role.Operation.ActualGroup == inx1 || role.Operation.TargetGroup == inx1) {
                        let ans = delta_v1(role.Operation, role.Operation.ActualGroup || role.Operation.TargetGroup, role.Operation.TargetGroup || role.Operation.ActualGroup, DataSource);
                      
                            newR[role.Operation.Field.FieldName] = ans;
                    }
                    else {
                        let ans = delta_v1(role.Operation, inx1, inx1, DataSource);
                        
                            newR[role.Operation.Field.FieldName] = ans;
                    }
                }

                else if (role.QueryType == dash.QueryTypeEnum.Spark) {
                    newR[role.Operation.FieldName] = this.sparkLine(role.Operation.ActualField, role.Operation.ArgumentField, _.cloneDeep(group));
                  
                }
                else if (role.QueryType == dash.QueryTypeEnum.Chart) {
                    // debugger;
                    let val = getRemainingDays(group[0][role.Operation.CompareDate.GetStoredName()], group[0][role.Operation.CompareToDate.GetStoredName()], role.Operation.DaysRange)
                    let comp = { "value": val, "range": role.Operation.DaysRange }
                    if (maxVal == null)
                        maxVal = val;
                    if (minVal == null)
                        minVal = val;
                    maxVal = Math.max(maxVal, val);
                    minVal = Math.min(minVal, val);
                    newR[role.Operation.FieldName] = comp ;

                }
                else if (role.QueryType == dash.QueryTypeEnum.BarChart) {
                    // debugger;
                    let val = agro(role.Operation, inx1, group);
                   
                  
                    if (maxVal == null)
                        maxVal = val;
                    if (minVal == null)
                        minVal = val;
                    maxVal = Math.max(maxVal, val);
                    minVal = Math.min(minVal, val);
                    newR[role.Operation.Field.FieldName] = { "value": val || 0 };
                }
                
                else if (role.QueryType == dash.QueryTypeEnum.calc && !newR[role.Operation.FieldName]) {
                   
                    if (!ExpressionTokens.length) {
                        ExpressionTokens = toknize(role.Operation.Expression);
                    }
                    let obj = {};
                    for (let i = 0; i <ExpressionTokens.length; i++) {
                        // obj[ExpressionTokens[i]] = this.cashe[(inx1 + dash.QueryTypeEnum.Measure + dash.Measure.Sum + ExpressionTokens[i])] || (this.cashe[(inx1 + dash.QueryTypeEnum.Measure + dash.Measure.Sum + ExpressionTokens[i])] = _.sumBy(group, ExpressionTokens[i]));
                        // test this
                        if(!this.cache.getCacheValue(inx1 + dash.QueryTypeEnum.Measure + dash.Measure.Sum + ExpressionTokens[i])) {
                            this.cache.setCache(inx1 + dash.QueryTypeEnum.Measure + dash.Measure.Sum + ExpressionTokens[i], _.sumBy(group, ExpressionTokens[i]));
                        }
                        obj[ExpressionTokens[i]] = this.cache.getCacheValue(inx1 + dash.QueryTypeEnum.Measure + dash.Measure.Sum + ExpressionTokens[i]);
                    }
                   
                    var parser = new Parser();
                    var expr = parser.parse(role.Operation.Expression);
                    newR[role.Operation.FieldName] = expr.evaluate(obj)
                }
                if (count1 > count) {
                    if (withIndex) {
                        result[inx1] = {
                            ...result[inx1],
                            ...newR
                        };
                    }
                    else {
                        result[count] = {
                            ...result[count],
                            ...newR
                        };
                    }
                }
                else {
                    count1++;
                    if (withIndex)
                        result[inx1]=newR;
                    else
                        result.push(newR);
                }
                count++;
               
            }
            if (role.QueryType == dash.QueryTypeEnum.BarChart || role.QueryType == dash.QueryTypeEnum.Chart) {
                for (let row in result) {
                    result[row][role.Operation.GetFieldName()]["max"] = maxVal;
                    result[row][role.Operation.GetFieldName()]["min"] = minVal;
                }
            }
           
            
        }
        //console.log(result);
        return result;
    }
    private sparkLine(Field: dash.MeasureOperation, Agru: dash.GroupOperation, data: any[]) {
      

        Agru.Field.FieldName = "agrumentField";
        Field.Field.FieldName = "target";
        data = GroupingManager.getInstance.groupByOperations([Agru], data);//this.GroupBy_v1([Agru], data);
        data = GroupingManager.getInstance.sortGroups(data);
        let Queries: dash.Query[] = []
        let Q = new dash.Query;
        Q.Operation = Field;
        Q.QueryType = dash.QueryTypeEnum.Measure;
        Queries.push(Q);
        Q = new dash.Query;
        Q.Operation = Agru;
        Q.QueryType = dash.QueryTypeEnum.Group;
        Queries.push(Q);
      
        

        return this.operate_v2(Queries, data);
        
    }
    buildPieChart() {
        throw new Error("Method not implemented.");
    }
    
    


}