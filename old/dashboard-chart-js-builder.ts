import { DashboardWidget, widgetData } from "./dashboard.model/dashboard-widget.model";
import { chartBuilderInterface } from "./dashboard-chart-builder-abstract";
import { GroupingManager } from './dashboard-grouping-manager.model'
import { SeriseManager } from "./dashboard-serise-manager";
import { DimensionField } from "./dashboard.model/dashboard-data-fields";
import * as dash from './dashboard.model/dashboard-data-fields';
import { Parser } from "expr-eval";
import { LabelManager } from "./dashboard-label-manager";
import { toknize, agro, sortXY } from "./dashboard.helper";
import {Cache} from './dashboard-cache.model'
import * as _ from "lodash";
// to build chart js
export class chartJsBuilder implements chartBuilderInterface{
    widget: DashboardWidget;
    queries: dash.Query[];
    dataSource: any;
    private colors = ['#27ae60', '#2980b9', '#8e44ad', '#e74c3c', '#f1c40f', '#f39c12', '#2c3e50'];
    private cache: Cache = Cache.getInstance;
    constructor(widget: DashboardWidget){
        this.widget = widget;
        this.queries = widget.Operations;
        this.dataSource = widget.Datasource;
    }
    public buildPieChart() {
       
       // let this.queries = this.widget.Operations;
        //let this.dataSource = this.widget.Datasource;
        let PreparedSerises = SeriseManager.getInstance.prepareSerise_withFields(this.queries, this.dataSource, true);//this.prepareSerise_withFields(this.queries, this.dataSource, true);
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
        for (let i of this.queries) {
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

                var res = GroupingManager.getInstance.prepareGroupsWithFields(this.queries, Datasource[i], true);//this.PrepareGroups_withFields(this.queries, Datasource[i], true);
                if (!groupFields || !groupFields.length)
                    groupFields = res.GroupsValue;
                else
                    groupFields =   GroupingManager.getInstance.concatDistinctGroups(groupFields, res.GroupsValue);  //this.ConcatDistinctroups(groupFields, res.GroupsValue);

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
                
                let res = GroupingManager.getInstance.prepareGroupsWithFields(this.queries, Datasource[i], true);//this.PrepareGroups_withFields(this.queries, Datasource[i], true);
                this.cache.resetCache()//this.restCashe();//Cache.getInstance.resetCache();
                let serName = "";
                if (ser.length > 0)
                    serName = i;
                if (!groupFields || !groupFields.length)
                    groupFields = res.GroupsValue;
                else
                    groupFields = GroupingManager.getInstance.concatDistinctGroups(groupFields, res.GroupsValue) //this.ConcatDistinctroups(groupFields, res.GroupsValue);
                let x = this.operate_Chartjse(this.queries, res.data, serName, seperation[seperationCounter++], res.GroupKeyValue);
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
    public buildFlatChart() {
        
        //let this.queries = this.widget.Operations;
       // let this.dataSource = this.widget.Datasource;
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
        for (let i of this.queries) {
            if (i.QueryType == dash.QueryTypeEnum.Group)
                groups.push(i);
            else if (i.QueryType == dash.QueryTypeEnum.Serise)
                ser.push(i);
            else {
                agro.push(i);
                if (agro.length == 1)
                 this.dataSource.sort((a, b) => { return a[i.Operation.Field.StoredName] - b[i.Operation.Field.StoredName]});
                if (!measureFields)
                    measureFields = new DimensionField("Measure", dash.QueryTypeEnum.Measure, new Array<string>(), false);
                measureFields.value.push(i.Operation.GetFieldName());
            }
        }
      
        if (ser.length) {
            let temp = SeriseManager.getInstance.prepareSerise_withFields(ser, this.dataSource, true,false);//this.prepareSerise_withFields(ser, this.dataSource, true,false);
            seriseFields = temp.GroupsValue;
            Datasource = temp.data;
            seperation = temp.GroupKeyValue;
        }
           
        else {
            Datasource = [];
            Datasource['all'] = this.dataSource;
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
                groupFields = GroupingManager.getInstance.concatDistinctGroups(groupFields, T.GroupsValue);//this.ConcatDistinctroups(groupFields, T.GroupsValue);
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
        sortXY(dataset, agruments, additionalData);
     //buil   debugger;
        this.widget.CurrentData =  new widgetData(agruments, dataset, seriseFields, groupFields, measureFields, additionalData);
        this.widget.syncLabels(this.widget.CurrentData.labels);
        //this.reSortLabels(this.widget);
        LabelManager.getInstance.reSortLabels(this.widget);
        this.widget.BuildSchema();
        this.widget.UpdateColors();
    
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

                    newCalculation = agro(role.Operation, inx1, group, lastGroup);
                    
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
    buildGridChart() {
        throw new Error("Method not implemented.");
    }
    buildPivotChart() {
        throw new Error("Method not implemented.");
    }
    buildExpBarChart() {
        throw new Error("Method not implemented.");
    }
    buildDigitChart() {
        throw new Error("Method not implemented.");
    }
    buildActiveTotalChart() {
        throw new Error("Method not implemented.");
    }
    buildGaugeChart() {
        throw new Error("Method not implemented.");
    }

   

    


}