import { DashboardDataFields, OperationTypeEnum, DateGroupEnum, FilterOptions, DataTypeEnum, Measure, data, EnumItem, DimensionField, PreparedDataGroups } from '../../models/dashboard/dashboard-data-fields';
import { DashboardWidget, widgetData,DashboardWidgetTypeEnum } from '../../models/dashboard/dashboard-widget.model';
import * as dash from '../../models/dashboard/dashboard-data-fields';
import * as numeral from 'numeral';


export class DashBoardWidgetBuilder{
    widget:DashboardWidget;
    mapFromEnumToFuncName = new Map();             //  initializes the map pair that contain <Enum, FunctionName> pairs.
    
    constructor(widget:DashboardWidget){   
        this.widget = widget;
        this.intialize();
    }
    private intialize() :void{     // to intialize map with default enums 
        this.addNewTypeToMap(DashboardWidgetTypeEnum.ActiveTotalChart,'buildActiveTotalChart');
        this.addNewTypeToMap(DashboardWidgetTypeEnum.DigitChart,'buildDigitChart');
        this.addNewTypeToMap(DashboardWidgetTypeEnum.Gauge,'BuildGauge');
        this.addNewTypeToMap(DashboardWidgetTypeEnum.Grid,'BuildGrid');
        this.addNewTypeToMap(DashboardWidgetTypeEnum.Pivot,'buildPivot');
        this.addNewTypeToMap(DashboardWidgetTypeEnum.PieChart,'BuildPieChart_chartjs');
        this.addNewTypeToMap(DashboardWidgetTypeEnum.BarChart,'buildBarChart');
        this.addNewTypeToMap(DashboardWidgetTypeEnum.ActiveTotalChart,'buildActiveTotalChart');
    }
    public addNewTypeToMap(newEnum:number , funcName:String ):void{    // to add new chartType to map
        this.mapFromEnumToFuncName.set(newEnum,"this."+funcName+"()");
    }
    public checkDataSource():void{
        if (!this.widget.Datasource)
            alert("no DataSource");
    }
    public build() :void {        //uses the map to excute the correct function corresponding to the enum state
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
    public BuildGrid(Quries: dash.Query[], Datasource: any[]):void{
        //
        //this.cashe = [];   
        var datav = [...Datasource]  
        var res = this.PrepareGroups(Quries, datav);
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
    public BuildPieChart_chartjs(Quries: dash.Query[], DatasourceOrg: any[]):void{
        let PreparedSerises = this.PrepareSerise_withFields(Quries, DatasourceOrg, true);
        let seperation = PreparedSerises.GroupKeyValue;
        let seperationCounter = 0;
        let serisesList: Array<DimensionField>= PreparedSerises.GroupsValue;
        let measureFields: DimensionField;
        let groupFields: Array<DimensionField>;
      //  debugger;
        let Datasource = PreparedSerises.data;
        this.cashe = [];
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

                var res = this.PrepareGroups_withFields(Quries, Datasource[i], true);
                if (!groupFields || !groupFields.length)
                    groupFields = res.GroupsValue;
                else
                    groupFields = this.ConcatDistinctroups(groupFields, res.GroupsValue);

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
            return;
        }
        else {
            for (let i in Datasource) {
                
                let res = this.PrepareGroups_withFields(Quries, Datasource[i], true);
                this.restCashe();
                let serName = "";
                if (ser.length > 0)
                    serName = i;
                if (!groupFields || !groupFields.length)
                    groupFields = res.GroupsValue;
                else
                    groupFields = this.ConcatDistinctroups(groupFields, res.GroupsValue);
                let x = this.operate_Chartjse(Quries, res.data, serName, seperation[seperationCounter++], res.GroupKeyValue);
                datasets = datasets.concat(x);
            }
            result.push([]);
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
            this.widget.selectedArgument = data.agrument;
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
            return;
        }
        let T = this.PrepareGroups_withFields([groupField], DatasourceOrg);
        let DataSource= T.data
        /**********************///
        this.restCashe();
        let labels = this.constructorExpLabels(dash.DateGroupEnum.Month);
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
                if (dash.monthNames[label] == month) {
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
        this.reSortLabels(this.widget);
        this.widget.BuildSchema();
        this.widget.UpdateColors();
    }
    public buildFlatCharts_chartjs(Quries: dash.Query[], DatasourceOrg: any[]):void{
        
        this.cashe = [];
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
            let temp = this.PrepareSerise_withFields(ser, DatasourceOrg, true,false);
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
            
            let T = this.PrepareGroups_withFields(groups, Datasource[row], true,false);
           // debugger;
            if (!groupFields || !groupFields.length)
                groupFields = T.GroupsValue;
            else 
                groupFields = this.ConcatDistinctroups(groupFields, T.GroupsValue);
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
            this.restCashe();
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
        this.reSortLabels(this.widget);
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
        let ans = this.PrepareGroups(Group, Datasource, true);
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
    public BuildGauge(Queries: dash.Query[], dataSource: any[]):void {
        let serise = this.PrepareGroups(Queries, dataSource);
        let layers = [];
    //    debugger;
        for (let Q of Queries) {
           
            if (Q.QueryType == dash.QueryTypeEnum.Delta) {
                let currentLayer = []
                for (let index in serise) {
                    let name = ""
                    this.restCashe();
                    let value = this.Delta_v1(Q.Operation, index, index, serise)
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
      
        this.cashe = [];
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
        var Datasource = this.PrepareGroups(groups, Datasource,true);
        var i = 0;
        //console.log(Datasource)
        for (let row in Datasource) {
            var res = this.PrepareSerise(ser, Datasource[row],true)
          
            agruments.push(row);
            this.restCashe();
            final.push(this.operate_v2(ser.concat(agro), res,true, false, true,true))
        }
        final = this.handleSerise(ser, final, agruments);
        //console.log(final);
        console.log(final)
        this.widget.CurrentData = final;
    }
    public BuildPieChart(Quries: dash.Query[], Datasource: any[]):void {
        
        var Datasource = this.PrepareSerise(Quries, Datasource,true);
      
        this.cashe = [];
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
           var res = this.PrepareGroups(Quries, Datasource[i],true); 
           this.restCashe();
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
    private average(index: string, type: string, field: string, obj: any[]):void {
        if (!this.cashe[index + "avg" + field])
            this.cashe[index + "avg" + field] = this.GetCashe((index + type + field), obj, field) / obj.length;
        return this.cashe[index + "avg" + field]
    }
    private Delta(index1: string, index2: string, base: string, target: string, type: string): any[] {
        if (!this.cashe[index1 + index2 + "delta" + base + target])
            this.cashe[index1 + index2 + "delta" + base + target] = _.round((this.GetCashe((index1 + type + base), this.DataAsGroups[index1], base) / this.GetCashe((index2 + type + target), this.DataAsGroups[index2], target) - 1) * 100, 2);
        return this.cashe[index1 + index2 + "delta" + base + target];
    }
    private agro(op: dash.MeasureOperation, GroupName: string="", GroupData: any[], LastGroupName: string = "", target = 0): number{
        let group = GroupData || new Array<any>();
        let field = op.Field.StoredName;
        let index = (GroupName + dash.QueryTypeEnum.Measure + op.Type + field);
        let lastIndex = (LastGroupName + dash.QueryTypeEnum.Measure + op.Type + field);
        if (!this.cashe[index]) {
            if (op.Type == dash.Measure.Sum)
                this.cashe[index] = _.sumBy(group, field);
            else if (op.Type == dash.Measure.Average) {
                let sumIT = Object.assign({},op);
                sumIT.Type = dash.Measure.Sum
                let length = (group) ? group.length : 0;
                this.cashe[index] = this.agro(sumIT, GroupName, GroupData) / group.length;
            }
            else if (op.Type == dash.Measure.Max) {
                this.cashe[index] = _.maxBy(group, field)[field];
            }
            else if (op.Type == dash.Measure.Min) {
                this.cashe[index] = _.minBy(group, field)[field];
            }
            else if (op.Type == dash.Measure.Count) {
                this.cashe[index] = group.length;
            }
            else if (op.Type == dash.Measure.Accumulative) {
                this.cashe[index] = _.sumBy(group, field);
                if (LastGroupName.length) {
                    this.cashe[index] += +this.cashe[lastIndex];
                }

            }
            else if (op.Type == dash.Measure.Target) {
              
                this.cashe[index] = (target/365)*30;
                if (LastGroupName.length) {
                    this.cashe[index] += +this.cashe[lastIndex];
                }

            }
        }
            
        return this.cashe[index];
    }
    private Delta_v1(op: dash.Delta, GroupName1: string, GroupName2: string ,Groups:any[]):number {
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
        this.restCashe();
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
                        ExpressionTokens = this.Toknize(role.Operation.Expression);
                    }
                    let obj = {};
                    for (let i = 0; i < ExpressionTokens.length; i++) {
                        obj[ExpressionTokens[i]] = this.cashe[(inx1 + dash.QueryTypeEnum.Measure + dash.Measure.Sum + ExpressionTokens[i])] || (this.cashe[(inx1 + dash.QueryTypeEnum.Measure + dash.Measure.Sum + ExpressionTokens[i])] = _.sumBy(group, ExpressionTokens[i]));
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
    private operate_v1(): void {
        for (let role of this.Fields) {
            let count = 0;

            for (let inx1 in this.DataAsGroups) {

                let newR: any = {};
                let group = this.DataAsGroups[inx1];


                for (let field in group[0]) {
                    if (role.FieldName == field) {

                        if (role.OperationType == OperationTypeEnum.Group && !newR[role.DisplayName]) {
                            newR[role.DisplayName] = group[0][field];
                        }
                        else if (role.OperationType == OperationTypeEnum.Measure) {
                            if (role.MeasureType == Measure.Sum)
                                newR[role.DisplayName] = this.GetCashe((inx1 + "sum" + field), group, field);
                            else if (role.MeasureType == Measure.Max) {
                                newR[role.DisplayName] = _.maxBy(group, field)[field];
                            }
                            else if (role.MeasureType == Measure.Min) {
                                newR[role.DisplayName] = _.minBy(group, field)[field];
                            }
                            else if (role.MeasureType == Measure.Average) {
                                newR[role.DisplayName] = this.average(inx1, "sum", field, group);
                            }
                            else if (role.MeasureType == Measure.Count) {
                                newR[role.DisplayName] = group.length;
                            }
                        }

                        else if (role.OperationType == OperationTypeEnum.Delta) {

                            newR[role.DisplayName] = this.Delta(inx1, inx1, field, role.DeltaTargetDataField, "sum");
                        }
                        else if (role.OperationType == OperationTypeEnum.DeltaGroup && (inx1 == role.DeltaGroupsTypeValue[0] || inx1 == role.DeltaGroupsTypeValue[1])) {
                            newR[role.DisplayName] = this.Delta(role.DeltaGroupsTypeValue[0], role.DeltaGroupsTypeValue[1], field, role.DeltaTargetDataField, "sum");
                            // //console.log(_.sumBy(this.DataAsGroups[role.DeltaGroupsTypeValue[1]], role.DeltaTargetDataField));
                        }
                        else if (role.OperationType == OperationTypeEnum.Spark) {
                            newR[role.DisplayName] = {};
                            newR[role.DisplayName]["points"] = [];
                            for (let point in group) {

                                var SparkObj = {};
                                var dt = new Date(group[point][role.SparkDateFieldName]);
                                SparkObj["Fulldate"] = dt;
                                if (role.SparkDateType == DateGroupEnum.QuarterYear) {

                                    SparkObj["value"] = group[point][role.FieldName];
                                    SparkObj["Year"] = dt.getFullYear().toString();
                                    SparkObj["count"] = 1;

                                    SparkObj["date"] = _.ceil((dt.getMonth() + 1) / 3).toString();
                                    let check = _.find(newR[role.DisplayName].points, { 'Year': SparkObj["Year"], 'Quarter': SparkObj["Quarter"] })
                                    if (check) {
                                        check['value'] += SparkObj["value"];
                                        check["count"]++;
                                    }
                                    else
                                        newR[role.DisplayName].points.push(SparkObj);
                                    newR[role.DisplayName]["Date_Type"] = "Quarter";
                                }
                                else if (role.SparkDateType == DateGroupEnum.Year) {

                                    SparkObj["value"] = group[point][role.FieldName];
                                    SparkObj["Year"] = dt.getFullYear().toString();
                                    SparkObj["date"] = SparkObj["Year"];
                                    SparkObj["count"] = 1;
                                    let check = _.find(newR[role.DisplayName].points, { 'Year': SparkObj["Year"] })
                                    if (check) {
                                        check['value'] += SparkObj["value"];
                                        check["count"]++;
                                    }
                                    else
                                        newR[role.DisplayName].points.push(SparkObj);
                                    newR[role.DisplayName]["Date_Type"] = "Year";
                                }
                                else if (role.SparkDateType == DateGroupEnum.MonthYear) {

                                    SparkObj["value"] = group[point][role.FieldName];
                                    SparkObj["Year"] = dt.getFullYear().toString();
                                    SparkObj["date"] = _.ceil(dt.getMonth() + 1).toString();
                                    let check = _.find(newR[role.DisplayName].points, { 'Year': SparkObj["Year"], 'Month': SparkObj["Month"] })
                                    SparkObj["count"] = 1;
                                    if (check) {
                                        check['value'] += SparkObj["value"];
                                        check["count"]++;
                                    }
                                    else
                                        newR[role.DisplayName].points.push(SparkObj);
                                    newR[role.DisplayName]["Date_Type"] = "Month";
                                }
                                // if()
                                // newR[role.DisplayName].points = _.sortBy(newR[role.DisplayName].points, ['date']);
                            }
                            newR[role.DisplayName]["MAX"] = _.maxBy(newR[role.DisplayName].points, 'value');
                            newR[role.DisplayName]["MIN"] = _.minBy(newR[role.DisplayName].points, 'value');
                        }


                    }
                    if (role.OperationType == OperationTypeEnum.calc && !newR[role.DisplayName]) {

                        if (!this.ExpressionTokens.length) {
                            this.ExpressionTokens = this.Toknize(role.Expression);
                        }
                        let obj = {};
                        for (let i = 0; i < this.ExpressionTokens.length; i++) {
                            obj[this.ExpressionTokens[i]] = this.GetCashe((inx1 + "sum" + this.ExpressionTokens[i]), group, this.ExpressionTokens[i]);
                        }
                        var parser = new Parser();
                        var expr = parser.parse(role.Expression);
                        newR[role.DisplayName] = expr.evaluate(obj)

                    }
                }
                if (this.FinalView.length > count) {
                    this.FinalView[count] = {
                        ...this.FinalView[count],
                        ...newR
                    };
                }
                else {
                    newR["count"] = group.length;
                    this.FinalView.push(newR);
                }
                count++;
            }

        }
        // //console.log(this.FinalView);
        ////console.log(this.cashe);

    }
    


}
