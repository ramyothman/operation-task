import {monthNames, DashboardDataFields, OperationTypeEnum, DateGroupEnum, FilterOptions, DataTypeEnum, Measure, data, EnumItem, DimensionField, PreparedDataGroups } from './dashboard.model/dashboard-data-fields';
import { DashboardWidget, 
         widgetData } from './dashboard.model/dashboard-widget.model';
import { DashboardWidgetTypeEnum } from './dashboard.model/dashboard-widget-type.enum'
import * as dash from './dashboard.model/dashboard-data-fields';
import * as numeral from 'numeral';
import { GroupingManager } from './grouping-manager.model';
import { SeriseManager } from './dashboard-serise-manager';
import { LabelManager } from './dashboard-label-manager';
import { Cache } from './dashboard-cache.model';
import { Parser } from "expr-eval";
import { formatDate, toknize, getRemainingDays} from './dashboard.helper';
import * as _ from "lodash";

export class DashBoardWidgetBuilder { // class purpose to build widget chart
    widget: DashboardWidget;
    mapFromEnumToFuncName = new Map();             //  initializes the map pair that contain <Enum, FunctionName> pairs
    private colors = ['#27ae60', '#2980b9', '#8e44ad', '#e74c3c', '#f1c40f', '#f39c12', '#2c3e50'];
    private cache: Cache = Cache.getInstance;

    constructor(widget: DashboardWidget) {   
        this.widget = widget;
        this.intialize();
    }
    
    /*
     *
     *
     * @private
     * @memberof DashBoardWidgetBuilder
     */
    private intialize() :void{     // to intialize map with default enums "types" 
        this.addNewTypeToMap(DashboardWidgetTypeEnum.ActiveTotalChart,'buildActiveTotalChart');
        this.addNewTypeToMap(DashboardWidgetTypeEnum.DigitChart,'buildDigitChart');
        this.addNewTypeToMap(DashboardWidgetTypeEnum.Gauge,'BuildGauge');
        this.addNewTypeToMap(DashboardWidgetTypeEnum.Grid,'BuildGrid');
        this.addNewTypeToMap(DashboardWidgetTypeEnum.Pivot,'buildPivot');
        this.addNewTypeToMap(DashboardWidgetTypeEnum.PieChart,'BuildPieChart_chartjs');
        this.addNewTypeToMap(DashboardWidgetTypeEnum.BarChart,'buildExpBarChart');
        this.addNewTypeToMap(DashboardWidgetTypeEnum.ActiveTotalChart,'buildActiveTotalChart');
    }
    /*
     *
     *
     * @param {number} newEnum
     * @param {String} funcName
     * @memberof DashBoardWidgetBuilder
     */
    public addNewTypeToMap(newEnum:number , funcName:String ):void{    // to add new "enum" chartType to map // paramater ( enum number , build function name)
        this.mapFromEnumToFuncName.set(newEnum,"this."+funcName+"()");
    }

    public checkDataSource():void{    // to check if there is data source 
        if (!this.widget.Datasource)
            alert("no DataSource");
    }

    public build() :void {        //uses the map to excute the correct function corresponding to the enum state
        this.checkDataSource();
        if (this.widget.Operations == null){
            return;
        }
        if (this.widget.WidgetType == DashboardWidgetTypeEnum.BarChart && !this.widget.ExpBar){
            this.buildFlatCharts_chartjs(this.widget.Operations, this.widget.Datasource);
        }
        else{
             eval(this.mapFromEnumToFuncName.get(this.widget.WidgetType));
        }
    }

    public BuildGrid(Quries: dash.Query[], Datasource: any[]): void {
        //
        this.cache.resetCache()//this.restCashe();//Cache.getInstance.resetCache(); //this.cashe = [];   
        var datav = [...Datasource]  
        var res = GroupingManager.getInstance.prepareGroups(Quries, datav); //PrepareGroups(Quries, datav);
        this.widget.CurrentData = this.operate_v2(Quries, res );
        
    }

    public buildPivot():void{
        let DataSource;
        DataSource = {
            fields: this.widget.Operations,
            store: this.widget.Datasource
        }
        this.widget.CurrentData =  DataSource;
    }

    public buildPieChart_chartjs(Quries: dash.Query[], DatasourceOrg: any[]): void {
        let PreparedSerises = SeriseManager.getInstance.prepareSerise_withFields(Quries, DatasourceOrg, true);//this.prepareSerise_withFields(Quries, DatasourceOrg, true);
        let seperation = PreparedSerises.GroupKeyValue;
        let seperationCounter = 0;
        let serisesList: Array<DimensionField>= PreparedSerises.GroupsValue;
        let measureFields: DimensionField;
        let groupFields: Array<DimensionField>;
      //  debugger;
        let Datasource = PreparedSerises.data;
        this.cache.resetCache()//this.cashe = [] // Cache.getInstance.resetCache();
        var groups: dash.Query[] = []
        var agro: dash.Query[] = [];
        var ser: dash.Query[] = [];
        let datasets = [];
        var result = [];
        var ans = [];
        let layers = [];
        for (let i of Quries) {
            if (i.QueryType == dash.QueryTypeEnum.Group)
                groups.push(i);
            else if (i.QueryType == dash.QueryTypeEnum.Serise)
                ser.push(i);
            else {
                agro.push(i);
                if (!measureFields)
                    measureFields = new DimensionField("Measure", dash.QueryTypeEnum.Measure, new Array<string>(), false);
                measureFields.value.push(i.Operation.GetFieldName());
            }
        }
       // debugger;
        if (ser.length > 0 && groups.length > 0) {
            for (let i in Datasource) {

                var res = GroupingManager.getInstance.prepareGroupsWithFields(Quries, Datasource[i], true);//this.PrepareGroups_withFields(Quries, Datasource[i], true);
                if (!groupFields || !groupFields.length)
                    groupFields = res.GroupsValue;
                else
                    groupFields =   GroupingManager.getInstance.concatDistinctroups(groupFields, res.GroupsValue);  //this.ConcatDistinctroups(groupFields, res.GroupsValue);

                let index = 0;
                for (let agrument of agro) {
                    if (!layers[index])
                        layers[index] = [];
                    let T = this.operate_Chartjse([agrument], res.data, i, seperation[seperationCounter++], res.GroupKeyValue);
                    if (T)
                        layers[index]=  layers[index].concat(T);
                    index++;
                }

            }
            console.log(layers);
            this.widget.CurrentData =  new widgetData([], layers, serisesList, groupFields, measureFields,[]);
            //return; // here
        }
        else {
            for (let i in Datasource) {
                
                let res = GroupingManager.getInstance.prepareGroupsWithFields(Quries, Datasource[i], true);//this.PrepareGroups_withFields(Quries, Datasource[i], true);
                this.cache.resetCache()//this.restCashe();//Cache.getInstance.resetCache();
                let serName = "";
                if (ser.length > 0)
                    serName = i;
                if (!groupFields || !groupFields.length)
                    groupFields = res.GroupsValue;
                else
                    groupFields = GroupingManager.getInstance.concatDistinctroups(groupFields, res.GroupsValue) //this.ConcatDistinctroups(groupFields, res.GroupsValue);
                let x = this.operate_Chartjse(Quries, res.data, serName, seperation[seperationCounter++], res.GroupKeyValue);
                datasets = datasets.concat(x);
            }
            // serise modifiy if no serise 
            //checking groups
            result.push([]);
            //  seperationCounter=0
            if (groups.length == 0) {
                let label = [];
                let data = [];
                let index = 0; 
                for (let i = 0; i < datasets.length; i++){
                        if (!i) {// set data 
                            result[index] = datasets[i];
                            if (ser.length == index)
                                result[index].label = "Total";
                            else
                                result[index].label = result[0].serise;
                            result[index].labels = [];
                            result[index].labels.push(datasets[i].Field.Caption || datasets[i].Field.FieldName);
                           
                            for (let row of result[index].data)
                               row.x = result[index].Field.FieldName;
                            continue;
                        }
                        //debugger;
                        result[index].backgroundColor.concat(datasets[i].backgroundColor);
                        for (let row of datasets[i].data) {
                            row.x = result[index].Field.FieldName;
                            result[index].data.push(row);
                           
                            result[index].labels.push(datasets[i].Field.Caption || datasets[i].Field.FieldName);
                        }
    
                    }
                    index++;         
                layers.push([result]);
            }
            else {
                layers.push(datasets);
                // layers.push({ 'labels': agruments, 'datasets': dataset });
            }
          //  console.log(layers);
            this.widget.CurrentData= new widgetData([], layers, serisesList, groupFields, measureFields,[]);

        }
        // serise modifiy if no serise 
        //checking groups
        
      //  seperationCounter=0
        
        if (!this.widget.selectedArgument && !this.widget.selectedArgument && !this.widget.selectedSerise.length && !this.widget.selectedArgument.length)
            this.widget.selectedArgument = this.widget.CurrentData.agrument //data.agrument;
                //  console.log(widget.CurrentData);
        this. widget.BuildSchema();
    }

    public buildExpBarChart(Quries: dash.Query[], DatasourceOrg: any[]):void{
        let actual: dash.Query;
        let target: dash.Query;
        let groupField: dash.Query;
       // debugger;
        for (let q of Quries) {
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
            this.buildFlatCharts_chartjs(Quries, DatasourceOrg);
            return; // buildFlatChart_chartjs already has last 4 lines
        }
        let T =  GroupingManager.getInstance.prepareGroupsWithFields([groupField], DatasourceOrg);  //this.PrepareGroups_withFields([groupField], DatasourceOrg);
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
            let targetValue = this.agro(target.Operation, label, DataSource[label], lastGroup, targetConst);
            let ActualValue = 0;
            let ExpValue = 0;
            if (dash.monthNames[label] <= month) {
                ActualValue = this.agro(actual.Operation, label, DataSource[label], lastGroup);
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

    public buildFlatCharts_chartjs(Quries: dash.Query[], DatasourceOrg: any[]):void{
        
        this.cache.resetCache()//this.cashe = [];//Cache.getInstance.resetCache();
        let groups: dash.Query[] = []
        let agro: dash.Query[] = [];
        let ser: dash.Query[] = [];
        let dataset = [];
        let result = [];
        let Datasource = [];
        let seperation = [];
        let seperationCounter = 0;
        let agruments = new Array<string>();
        let seriseFields: DimensionField[] = new Array<DimensionField>();
        let groupFields: DimensionField[] = new Array<DimensionField>();
        let measureFields: DimensionField;
        let all_serise: string[] = [];
        let additionalData = new Array<any>();
        for (let i of Quries) {
            if (i.QueryType == dash.QueryTypeEnum.Group)
                groups.push(i);
            else if (i.QueryType == dash.QueryTypeEnum.Serise)
                ser.push(i);
            else {
                agro.push(i);
                if (agro.length == 1)
                 DatasourceOrg.sort((a, b) => { return a[i.Operation.Field.StoredName] - b[i.Operation.Field.StoredName]});
                if (!measureFields)
                    measureFields = new DimensionField("Measure", dash.QueryTypeEnum.Measure, new Array<string>(), false);
                measureFields.value.push(i.Operation.GetFieldName());
            }
        }
      
        if (ser.length) {
            let temp = SeriseManager.getInstance.prepareSerise_withFields(ser, DatasourceOrg, true,false);//this.prepareSerise_withFields(ser, DatasourceOrg, true,false);
            seriseFields = temp.GroupsValue;
            Datasource = temp.data;
            seperation = temp.GroupKeyValue;
        }
           
        else {
            Datasource = [];
            Datasource['all'] = DatasourceOrg;
        }
        var i = 0;
       
        //console.log(Datasource)
        seperationCounter = 0;
        for (let row in Datasource) {
            
            let T = SeriseManager.getInstance.prepareSerise_withFields(groups, Datasource[row], true,false);//this.PrepareGroups_withFields(groups, Datasource[row], true,false);
           // debugger;
            if (!groupFields || !groupFields.length)
                groupFields = T.GroupsValue;
            else 
                groupFields = GroupingManager.getInstance.concatDistinctroups(groupFields, T.GroupsValue);//this.ConcatDistinctroups(groupFields, T.GroupsValue);
            if (groups.length > 0) {
                for (let groupName in T.data) {

                    if (agruments.findIndex(x => { return x == groupName }) == -1) {

                        agruments.push(groupName);
                    }
                }
            }
            else {
                let temp = T.data["0"];
                T.data = [];
                T.data["Total"] = temp;
                agruments.push("Total");
            }
             //  //debugger;
             
            let name = "";
            if (row != 'all')
                name = row;
            //debugger;
            this.cache.resetCache()//this.restCashe();//Cache.getInstance.resetCache();
            let x = this.operate_Chartjse(groups.concat(agro), T.data, name, seperation[seperationCounter++], T.GroupKeyValue, additionalData);
           // debugger;
            for (let set of x) {
                dataset.push(set);
               
                set["borderWidth"] = "1";
              

            }
           
        }

       // debugger;
       // final = this.handleSerise(ser, final, agruments);
        //console.log(final);
      
        if (groups.length == 1 && groups[0].Operation.Field.FieldType == dash.DataTypeEnum.object && groups[0].Operation.Type == dash.DateGroupEnum.Month) {
           
            agruments = agruments.sort(function (a, b) {
                return dash.monthNames[a] - dash.monthNames[b];
            })
        }
       
        let last = []
        this.sortXY(dataset, agruments, additionalData);
     //buil   debugger;
        this.widget.CurrentData =  new widgetData(agruments, dataset, seriseFields, groupFields, measureFields, additionalData);
        this.widget.syncLabels(this.widget.CurrentData.labels);
        //this.reSortLabels(this.widget);
        LabelManager.getInstance.reSortLabels(this.widget);
        this.widget.BuildSchema();
        this.widget.UpdateColors();
    }

    public buildDigitChart(Quries: dash.Query[], DatasourceOrg: any[]):void{
        let result=this.operate_v2(Quries, [DatasourceOrg],false);
        let target:number = 0;
        let actual:number = 0;
        if (result && result.length>0)
        for (let Q of Quries) {
            if (Q.QueryType == dash.QueryTypeEnum.Measure) {
                if (Q.QuerySubType == dash.QuerySubTypeEnum.DigitActual)
                    actual = +result[0][Q.Operation.GetFieldName()];
                else if (Q.QuerySubType == dash.QuerySubTypeEnum.DigitTarget)
                    target = +result[0][Q.Operation.GetFieldName()];
            }
            }
        this.widget.CurrentData = numeral(actual - target).format('0.0a');
    }

    public buildActiveTotalChart(Quries: dash.Query[], Datasource: any[]):void {
        let result = [];
        let Active = 0;
        let total = 0
        //debugger;
        let Measure = [];
        let Group = []
        for (let Q of Quries) {
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
        let ans = GroupingManager.getInstance.prepareGroups(Group, Datasource, true);   //this.PrepareGroups(Group, Datasource, true);
        ans = this.operate_v2(Measure.concat(Group), ans);
        for (let Q of Quries) {
            if (ans && ans[0] && Q.QueryType == dash.QueryTypeEnum.ActiveTotal) {
                Active = ans[0][Q.Operation.ActualField.GetFieldName()] || 0;
                total = ans[0][Q.Operation.TargetField.GetFieldName()] || 0;
                result.push({ "Query": Q, "active": Active, "total": total });
            }
        }
        console.log(result);
        this.widget.CurrentData =  result;

    }

    public buildGauge(Queries: dash.Query[], dataSource: any[]):void {
        let serise =  GroupingManager.getInstance.prepareGroups(Queries, dataSource)//this.PrepareGroups(Queries, dataSource);
        let layers = [];
    //    debugger;
        for (let Q of Queries) {
           
            if (Q.QueryType == dash.QueryTypeEnum.Delta) {
                let currentLayer = []
                for (let index in serise) {
                    let name = ""
                    this.cache.resetCache()//this.restCashe(); // Cache.getInstance.resetCache();
                    let value = this.delta_v1(Q.Operation, index, index, serise)
                    if (index != "0")
                        name = index;
                    let actualSum = this.agro(Q.Operation.ActualField, index, serise) || 0
                    let TargetSum = this.agro(Q.Operation.TargetField, index, serise) || 0
                    currentLayer.push({ 'name': name, 'value': value, 'TargetValue': TargetSum, 'ActualValue': actualSum})

                }
                layers.push({ "name": Q.Operation.GetFieldName(),"data": currentLayer });
            }

        }
     //   debugger;
        this.widget.CurrentData =  layers;
    }

    public buildFlatCharts(Quries: dash.Query[], Datasource: any[]) :void{
      
        this.cache.resetCache()//this.cashe = [];// Cache.getInstance.resetCache();
        var groups: dash.Query[] = []
        var agro: dash.Query[] = [];
        var ser: dash.Query[] = [];
        var final = [];
        var result = [];
        var agruments = [];
        var all_serise: string[] = [];
        for (let i of Quries) {
            if (i.QueryType == dash.QueryTypeEnum.Group)
                groups.push(i);
            else if (i.QueryType == dash.QueryTypeEnum.Serise)
                ser.push(i);
            else
                agro.push(i);
        }
        var Datasource = GroupingManager.getInstance.prepareGroups(groups, Datasource,true);//this.PrepareGroups(groups, Datasource,true);
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

    public buildPieChart(Quries: dash.Query[], Datasource: any[]):void {
        
        var Datasource = SeriseManager.getInstance.prepareSerise(Quries, Datasource,true)//this.prepareSerise(Quries, Datasource,true);
      
        this.cache.resetCache()//this.cashe = [];//Cache.getInstance.resetCache();
        var groups: dash.Query[] = []
        var agro: dash.Query[] = [];
        var ser: dash.Query[] = [];
        var final = [];
        var result = [];
        var ans = [];
        for (let i of Quries) {
            if (i.QueryType == dash.QueryTypeEnum.Group)
                groups.push(i);
            else if (i.QueryType == dash.QueryTypeEnum.Serise)
                ser.push(i);
            else 
                agro.push(i);
        }
       for (let i in Datasource) {
           var res = GroupingManager.getInstance.prepareGroups(Quries, Datasource[i],true);//this.PrepareGroups(Quries, Datasource[i],true); 
           this.cache.resetCache();//this.restCashe();//Cache.getInstance.resetCache();
           Datasource[i] = this.operate_v2(Quries, res,true, true);
        }
        // serise modifiy if no serise 
        final = Datasource;
        //checking groups

     
        var layers = [];
      
           result.push([]);
           if (groups.length == 0) {
               var se = 0;
               for (let serise in final) {
                   //  //debugger;
                   result[se] = { 'serise_name': serise.replace("+", " "), 'groups': [] };
                  
                   result[se]['groups'].push({ 'Group_name': "", 'values': [] })
                   for (let agrument of agro) {
                       for (let row of final[serise]) {
                           result[se]['groups'][0].values.push({
                               'agrument': agrument.Operation.GetFieldName(), 'target': row[agrument.Operation.GetFieldName()]
                           });

                       }
                   }
                   se++;
               }
               layers.push(result);
           }
           else if (ser.length>0) {
               for (let agrument of agro) {
                   layers.push(this.construct_layer(final,agrument));
               }
           }
           else {
               var se = 0;
               for (let serise in final) {
                   result.push([]);
                   
                 
                   for (let agrument of agro) { 
                       result[se] = { 'serise_name': serise.replace("+", " "), 'groups': [] };
                       var count = 0;
                       result[se]['groups'].push({ 'agrument': agrument.Operation.GetFieldName(), 'values': [] });
                       for (let row in final[serise]) {
                       result[se]['groups'][count].values.push({
                           'agrument': row, 'target': final[serise][row][agrument.Operation.GetFieldName()]
                       });
                       }
                   count++;
                   se++;
               }
               }
               if (result.length>0)
                 layers.push(result);
           }
              

   
           console.log(layers);
           this.widget.CurrentData =  layers;
    }

    private agro(op: dash.MeasureOperation, GroupName: string="", GroupData: any[], LastGroupName: string = "", target = 0): number{
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

    private delta_v1(op: dash.Delta, GroupName1: string, GroupName2: string ,Groups:any[]):number {
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

    private operate_Chartjse(Roles: dash.Query[], DataSource: any[], seriseName: string = "", seriseSeperation = [], GroupSeperation = [], additionalData=[]): any[] {
        if (seriseName.length)
            seriseName = seriseName.replace('+', ' - ');      
        let dataset: any[] = [];
        let ExpressionTokens: any[] = [];
        let count1 = 0;
        let colorCounter = 0;
        this.cache.resetCache()//this.restCashe();//Cache.getInstance.resetCache();
        for (let role of Roles) {
            let data = [];
          
            let colors = [];
            let labels = [];
            let sepCounter = 0;
            let colorsCounter = 0
            if (role.QueryType == dash.QueryTypeEnum.Serise || role.QueryType == dash.QueryTypeEnum.Group)
                continue;
            let lastGroup=""
            for (let inx1 in DataSource) {
                let groupSep=[];
                if (GroupSeperation) {
                    let x = 0;
                    for (let g in GroupSeperation) {
                        if (x == sepCounter) {
                            groupSep = GroupSeperation[g];
                            break;
                        }
                        x++;
                   }
                }
                let newCalculation: any;
                let group = DataSource[inx1];

                if (role.Operation.Field && inx1.indexOf("null") != -1) {
                    newCalculation = 0;
                }
                else if (role.QueryType == dash.QueryTypeEnum.Measure) {

                    newCalculation = this.agro(role.Operation, inx1, group, lastGroup);
                    
                }
                else if (role.QueryType == dash.QueryTypeEnum.calc) {

                    if (!ExpressionTokens.length) {
                        ExpressionTokens = toknize(role.Operation.Expression);
                    }
                    let obj = {};
                    for (let i = 0; i < ExpressionTokens.length; i++) {
                        // obj[ExpressionTokens[i]] = this.cashe[(inx1 + dash.QueryTypeEnum.Measure + dash.Measure.Sum + ExpressionTokens[i])] || (this.cashe[(inx1 + dash.QueryTypeEnum.Measure + dash.Measure.Sum + ExpressionTokens[i])] = _.sumBy(group, ExpressionTokens[i]));
                        if(!this.cache.getCacheValue(inx1 + dash.QueryTypeEnum.Measure + dash.Measure.Sum + ExpressionTokens[i])) {
                            this.cache.setCache(inx1 + dash.QueryTypeEnum.Measure + dash.Measure.Sum + ExpressionTokens[i], _.sumBy(group, ExpressionTokens[i]));
                        }
                        obj[ExpressionTokens[i]] = this.cache.getCacheValue(inx1 + dash.QueryTypeEnum.Measure + dash.Measure.Sum + ExpressionTokens[i]);
                    }

                    var parser = new Parser();
                    var expr = parser.parse(role.Operation.Expression);
                    newCalculation = expr.evaluate(obj)
                }

                let xAxis = inx1.replace("+", " ");
                if (!additionalData[xAxis])
                    additionalData[xAxis] = {};
                let memo = additionalData[xAxis];
                if (!memo["Counting"])
                    memo["Counting"] = 0;
                if (!memo["Total"])
                    memo["Total"] = 0;
                memo["Total"] += +newCalculation;
                memo["Counting"]++;
                let temp = { 'y': newCalculation, 'x': xAxis, 'group': groupSep}
                data.push(temp);
              
                labels.push(temp.x);
                colors.push(this.colors[colorsCounter % this.colors.length]);
                colorsCounter++;
                sepCounter++;
                lastGroup = inx1;
            }
            let label = seriseName;
            if (label.length)
                label + " - "
            dataset.push({ "label": label + role.Operation.Field.FieldName, type: dash.chartType[role.OptionalType], 'data': data,  'Field': role.Operation.Field, 'serise': seriseName, 'serisList': seriseSeperation, 'backgroundColor': colors, "labels": labels, "role": role })
           
        }
    //    console.log(dataset);
        return dataset;
    }

    private construct_layer(data: any[], agrument: any):any[] {
        var result = [];
        var se = 0;
        for (let serise in data) {
            result.push([]);
            result[se] = { 'serise_name': serise.replace("+", " "), 'groups': [] };
            result[se]['groups'].push({ 'agrument': agrument.Operation.GetFieldName(), 'values': [] })
            for (let row in data[serise]) {
                result[se]['groups'][0].values.push({
                    'agrument': row, 'target': data[serise][row][agrument.Operation.GetFieldName()]
                });
            }
            se++;
        }
        return result

    }

    private sortXY(data, agru,last =[]) {
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
                
                     newR[role.Operation.Field.FieldName] = this.agro(role.Operation, inx1, group);
                   
                }
                else if (role.QueryType == dash.QueryTypeEnum.Delta && !newR[role.Operation.FieldName]) {
                    if (role.Operation.ActualGroup == inx1 || role.Operation.TargetGroup == inx1) {
                        let ans = this.delta_v1(role.Operation, role.Operation.ActualGroup || role.Operation.TargetGroup, role.Operation.TargetGroup || role.Operation.ActualGroup, DataSource);
                      
                            newR[role.Operation.Field.FieldName] = ans;
                    }
                    else {
                        let ans = this.delta_v1(role.Operation, inx1, inx1, DataSource);
                        
                            newR[role.Operation.Field.FieldName] = ans;
                    }
                }

                else if (role.QueryType == dash.QueryTypeEnum.Spark) {
                    newR[role.Operation.FieldName] = this.SparkLine(role.Operation.ActualField, role.Operation.ArgumentField, _.cloneDeep(group));
                  
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
                    let val = this.agro(role.Operation, inx1, group);
                   
                  
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
}
