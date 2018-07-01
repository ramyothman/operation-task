
import { DashboardDataFields, OperationTypeEnum, DateGroupEnum, FilterOptions, DataTypeEnum, Measure, data, EnumItem, DimensionField, PreparedDataGroups } from '../../models/dashboard/dashboard-data-fields';
import { DashboardWidgetTypeEnum } from '../../models/dashboard/dashboard-widget-type.enum';

import * as dash from '../../models/dashboard/dashboard-data-fields';
import { DashboardWidget, widgetData } from '../../models/dashboard/dashboard-widget.model';
import * as _ from "lodash";
import { Parser } from "expr-eval";
import * as moment from 'moment';
import { AppSettings } from '../../settings/app/app.settings';
import * as numeral from 'numeral';

declare var $: any;
declare var jQuery: any;
export class Operations {
    /***Input Section**/
  private  GroupFields: {};
  private Fields: DashboardDataFields[];

  private data: any[];
  private DataAsGroups: any;
  private FinalView: any[];
  private cashe: any;
  private ExpressionTokens: string[];

    /*** end Input Section**/


  constructor() { }
  public EnumToArray(Enum: any): EnumItem[] {
      var arr: EnumItem[] = []
      for (let o in Enum)
          arr.push({ id: Enum[o], name: o });
      return arr.splice(arr.length / 2);
  }
   
  public GroupBy_v1(GroupFields: dash.GroupOperation[], DataSource: any[], removeNull: boolean=false):any[] {
        let counter = 0;
        
      let resualt: any[]=[];
      var Data = [...DataSource];
      if (GroupFields.length == 0) {
          resualt.push(Data);
          return resualt;
      }

      for (let row of Data) {
          let counter = 0;
          let grouped: string = "";
          let isNull = false;
          for (let role of GroupFields) {
              let value: string = "";
              let FieldVal = "";
              if (removeNull && row[role.Field.StoredName] == null) {
                  isNull = true;
                  break;
              }
              if (role.Field.FieldType == dash.DataTypeEnum.object && role.Type) {

                  var dat = new Date(row[role.Field.StoredName]);
                  value = this.formatDate(row[role.Field.StoredName], role.Type);
                  row[role.Field.FieldName] = value;
              }
              else {
                  value = row[role.Field.StoredName];
              }
              if (value && value.length) {
                  if (grouped && grouped.length)
                      grouped += " - ";
                  grouped += value.toString();

              }

          }
          if (isNull)
              continue;
          if (grouped.length > 0) {
              grouped= grouped.toString();
              if (!resualt.hasOwnProperty(grouped)) {
                  resualt[grouped] = [];
              }
              resualt[grouped].push(row);
          }
          else {
              resualt[counter] = [];
              resualt[counter++].push(row);
          }
      }
     

      return this.SortGroups(resualt);


  }

  public GroupBy_Single(GroupQuery: dash.Query, DataSource: any[], removeNull: boolean = false): any[] {
      let counter = 0;
      GroupQuery
      let resualt: any[] = [];
      var Data = [...DataSource];
      if (!GroupQuery && !(GroupQuery.QueryType == dash.QueryTypeEnum.Group || GroupQuery.QueryType == dash.QueryTypeEnum.Serise)) {
          resualt.push(Data);
          return resualt;
      }
      let role = GroupQuery.Operation;

      for (let row of Data) {
          let counter = 0;
          let grouped: string = "";
          let isNull = false;
        
          let value: string = "";
          let FieldVal = "";
          if (removeNull && row[role.Field.StoredName] == null) {
              isNull = true;
              continue;
          }
          if (role.Field.FieldType == dash.DataTypeEnum.object && role.Type) {

              var dat = new Date(row[role.Field.StoredName]);
              value = this.formatDate(row[role.Field.StoredName], role.Type);
              row[role.Field.FieldName] = value;
          }
          else {
              value = row[role.Field.StoredName];
          }
          if (value && value.length) {
             
              grouped = value.toString();

          }

          if (grouped.length > 0) {
              grouped = grouped.toString();
              if (!resualt.hasOwnProperty(grouped)) {
                  resualt[grouped] = [];
              }
              resualt[grouped].push(row);
          }
          else {
              resualt[counter] = [];
              resualt[counter++].push(row);
          }
      }


      return this.SortGroups(resualt, GroupQuery.Customization.SortType);


  }

  public ConstructGroups_WithFields(GroupFields: dash.GroupOperation[], DataSource: any[], Qtype: dash.QueryTypeEnum = dash.QueryTypeEnum.Group, removeNull: boolean = false,sortGroups=true): PreparedDataGroups {
      let counter = 0;
      let fields: Array<DimensionField> = new Array<DimensionField>();
      let seperatedFields = [];
      let resualt: any[] = [];
      let sort = false;
      var Data = [...DataSource];
      if (GroupFields.length == 0) {
          resualt.push(Data);
          return new PreparedDataGroups(resualt, fields, seperatedFields);
         
      }
      GroupFields = _.sortBy(GroupFields, x => { return x.GetFieldName()})
      for (let row of Data) {
          let counter = 0;
          let grouped: string = "";
          let isNull = false;
          let RowGoups = [];
          let rowOut = false;
          for (let role of GroupFields) {
              sort = sort || role.sort;
              let value:string = "";
              let FieldVal = "";
              if (removeNull && row[role.Field.StoredName] == null) {
                  isNull = true;
                  break;
              }
              if (role.Field.FieldType == dash.DataTypeEnum.object && role.Type) {

                  var dat = new Date(row[role.Field.StoredName]);
                  if (role.Type == dash.DateGroupEnum.Month) {
                     // debugger;
                      let today = new Date();
                      if (dat.getFullYear() != today.getFullYear()) {
                          rowOut = true;
                          break;
                      }
                  }
                  value = this.formatDate(row[role.Field.StoredName], role.Type);
                  row[role.Field.FieldName] = value;
              }
              else {
                  value = row[role.Field.StoredName];
              }
             
              if (value && value.length) {
                  RowGoups[role.GetFieldName()] = value;
                  if (grouped.length)
                      grouped += " - ";
                  grouped += value;
                  if (!fields[counter]) {
                      fields[counter] = new DimensionField(role.Field.FieldName, Qtype, new Array<string>(),true);
                  }
                  if (fields[counter].value.findIndex(x => { return x == value }) == -1) {
                      fields[counter].value.push(value);
                      
                  }
                     
              }
              counter++;
          }
         
          if (isNull || rowOut)
              continue;
          if (grouped.length > 0) {
              if (!resualt.hasOwnProperty(grouped)) {
                 //debugger;
                  resualt[grouped] = [];
                  seperatedFields.push(RowGoups);
              }
            
              resualt[grouped].push(row);
          }
          else {
              resualt[counter] = [];
              resualt[counter++].push(row);
          }
      }
     // if (!resualt.length && sort)
      if (sortGroups) {
          let t = this.SortGroupedObjectKeys(resualt, seperatedFields);
          resualt = t.data;
          seperatedFields = t.sperated;
      }
    
      return new PreparedDataGroups(resualt, fields, seperatedFields);


  }

  SortGroups(Groups: any[], type: dash.SortingType = dash.SortingType.ascending) {
      let Keys = new Array<string>();
      let resualt1 = [];
      let res = type;
     
      for (let key in Groups) {
          Keys.push(key);
      }

      Keys.sort(function (a, b) { return res*((a<b)?-1:(a>b)?1:0)  });
      for (let key of Keys) {
          resualt1[key] = _.cloneDeep(Groups[key]);
      }
      return resualt1;

  }
  
  SortGroupedObjectKeys(data: any[],seperated:any[]) {
      let Keys = new Array<string>();
      let resualt1 = [];
      let resulat2 =  []
      let temp_seperation= []
      for (let key in data) {
          Keys.push(key);
      }
      let counter = 0;
      for (let sp of seperated) {
          temp_seperation[Keys[counter]] =sp;
          counter++;
      }
      Keys.sort();
      for (let key of Keys) {
          resualt1[key] = _.cloneDeep(data[key]);
          resulat2.push(temp_seperation[key]);
      }
      return { data: resualt1, sperated: resulat2 };
  }
    //Atia was HERE
  getRemainingDays(CompareDate: any, OrderActivationDate: any, DaystoDelivery: number = 30): number {
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
    private Toknize(stat: string): string[] {
        let buffer = "";
        let res: string[] = [];
        for (let i = 0; i < stat.length; i++) {
            if (stat[i] == "_" || (stat[i] >= 'a' && stat <= 'z') || (stat[i] >= 'A' && stat[i] <= 'Z')) {
                buffer += stat[i];
            }
            else if (buffer.length > 0) {
                res.push(buffer);
                buffer = "";
            }
        }
        if (buffer.length > 0) 
            res.push(buffer);
        
        return res;
    }
    public SparkLine(Field: dash.MeasureOperation, Agru: dash.GroupOperation, data: any[]) {
      

        Agru.Field.FieldName = "agrumentField";
        Field.Field.FieldName = "target";
        data = this.GroupBy_v1([Agru], data);
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
    //normal column structure
    private operate_v2(Roles: dash.Query[], DataSource: any[],formatNumbers=true, withIndex?: boolean, seriseIsGroups?:boolean,HideGroupValue?:boolean): any[] {
        
        
        let result: any[] = []
        let ExpressionTokens: any[] = [];
        let count1 = 0;
        this.restCashe();
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
                        recored = this.formatDate(group[0][role.Operation.Field.StoredName], role.Operation.Type);
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
                        let ans = this.Delta_v1(role.Operation, role.Operation.ActualGroup || role.Operation.TargetGroup, role.Operation.TargetGroup || role.Operation.ActualGroup, DataSource);
                      
                            newR[role.Operation.Field.FieldName] = ans;
                    }
                    else {
                        let ans = this.Delta_v1(role.Operation, inx1, inx1, DataSource);
                        
                            newR[role.Operation.Field.FieldName] = ans;
                    }
                }

                else if (role.QueryType == dash.QueryTypeEnum.Spark) {
                    newR[role.Operation.FieldName] = this.SparkLine(role.Operation.ActualField, role.Operation.ArgumentField, _.cloneDeep(group));
                  
                }
                else if (role.QueryType == dash.QueryTypeEnum.Chart) {
                    // debugger;
                    let val = this.getRemainingDays(group[0][role.Operation.CompareDate.GetStoredName()], group[0][role.Operation.CompareToDate.GetStoredName()], role.Operation.DaysRange)
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
                        ExpressionTokens = this.Toknize(role.Operation.Expression);
                    }
                    let obj = {};
                    for (let i = 0; i <ExpressionTokens.length; i++) {
                        obj[ExpressionTokens[i]] = this.cashe[(inx1 + dash.QueryTypeEnum.Measure + dash.Measure.Sum + ExpressionTokens[i])] || (this.cashe[(inx1 + dash.QueryTypeEnum.Measure + dash.Measure.Sum + ExpressionTokens[i])] = _.sumBy(group, ExpressionTokens[i]));
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
    //row structure
    private  colors = ['#27ae60', '#2980b9', '#8e44ad', '#e74c3c', '#f1c40f', '#f39c12', '#2c3e50'];
    
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
   
    public getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
  
    public CalculateExpression(exp: dash.CalculatedField ,data:any[]) {

        var ExpressionTokens = this.Toknize(exp.Expression);
       
        let obj = {};
        for (let i = 0; i < ExpressionTokens.length; i++) {
            obj[ExpressionTokens[i]] = _.sumBy(data, ExpressionTokens[i]);
        }

        var parser = new Parser();
        var expr = parser.parse(exp.Expression);
        return  expr.evaluate(obj)
    }
    public PrepareGroups(Queries: dash.Query[], Data: any[], removeNull: boolean = false): any[] {
        let Q: dash.GroupOperation[]=[]
        for (let query of Queries) {
            if (query.QueryType == dash.QueryTypeEnum.Group) {
                Q.push(query.Operation)
                     
            }
            else if (query.QueryType == dash.QueryTypeEnum.Chart) {
                query.Operation.CompareDate.Type = dash.DateGroupEnum.none;
                query.Operation.CompareToDate.Type = dash.DateGroupEnum.none;
                Q.push(query.Operation.CompareDate);
                Q.push(query.Operation.CompareToDate);
            }
        }
       
        return Data = this.GroupBy_v1(Q, Data, removeNull);
    }
    public PrepareSerise(Queries: dash.Query[], Data: any[], removeNull: boolean = false): any[] {
        let Q: dash.GroupOperation[] = []
        for (let query of Queries) {
            if (query.QueryType == dash.QueryTypeEnum.Serise) {
                Q.push(query.Operation)
            }
        }
       
       
        return Data = this.GroupBy_v1(Q, Data, removeNull);
       
         
    }
    public PrepareGroups_withFields(Queries: dash.Query[], Data: any[], removeNull: boolean = false, sortGroups: boolean = true): PreparedDataGroups {
        let Q: dash.GroupOperation[] = []
        for (let query of Queries) {
            if (query.QueryType == dash.QueryTypeEnum.Group) {
                Q.push(query.Operation)

            }
        }

        return this.ConstructGroups_WithFields(Q, Data, dash.QueryTypeEnum.Group, removeNull, sortGroups);
    }
    public PrepareSerise_withFields(Queries: dash.Query[], Data: any[], removeNull: boolean = false, sortGroups: boolean = true): PreparedDataGroups {
        let Q: dash.GroupOperation[] = []
        for (let query of Queries) {
            if (query.QueryType == dash.QueryTypeEnum.Serise) {
                Q.push(query.Operation)
            }
        }


        return this.ConstructGroups_WithFields(Q, Data, dash.QueryTypeEnum.Serise, removeNull, sortGroups);


    }
    public BuildGrid(Quries: dash.Query[], Datasource: any[]): any[]{
    //    //debugger;
        this.cashe = [];
       
        var datav = [...Datasource]
      
        var res = this.PrepareGroups(Quries, datav);

      //  debugger
        return this.operate_v2(Quries, res );
    }
    public BuildPieChart(Quries: dash.Query[], Datasource: any[]): any[] {
        
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
           return layers;
    }

   
    public BuildPieChart_chartjs(Quries: dash.Query[], DatasourceOrg: any[]): widgetData {
         //debugger;
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
            return new widgetData([], layers, serisesList, groupFields, measureFields,[]);
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
        return new  widgetData([], layers, serisesList, groupFields, measureFields,[]);
    }

    public static MasterFilter: any[] = [];
    public static MasterFilterListIDs: any[] = [];
    public BuildWidget(widget: DashboardWidget) {
        if (!widget.Datasource)
            alert("no DataSource ");
        if (widget.WidgetType == DashboardWidgetTypeEnum.Grid) {
            if (widget.Operations != null) {
                //console.log(widget);

                widget.CurrentData = this.BuildGrid(widget.Operations, widget.Datasource);

            }
            //  console.log(widget.CurrentData);
        }
        else if (widget.WidgetType == DashboardWidgetTypeEnum.Pivot) {
            let DataSource
            if (widget.Operations != null) {
                DataSource = {
                    fields: widget.Operations,
                    store: widget.Datasource
                }

            }
            widget.CurrentData = DataSource;

        }
        else if (widget.WidgetType == DashboardWidgetTypeEnum.PieChart) {
            if (widget.Operations != null) {
                let data = this.BuildPieChart_chartjs(widget.Operations, widget.Datasource)
                widget.CurrentData = data
                if (!widget.selectedArgument && !widget.selectedArgument && !widget.selectedSerise.length && !widget.selectedArgument.length)
                    widget.selectedArgument = data.agrument;
                //  console.log(widget.CurrentData);
                widget.BuildSchema();
            }
            //   this.PieChartLayer = this.widget.CurrentData.layers[0];
            // var temp = this.Methods.BuildWidget(this.widget.Operations, this.widget.Datasource);

            // //console.log(this.Methods.PrepareSerise(this.widget.Operations, temp));
        }
        else if (widget.WidgetType == DashboardWidgetTypeEnum.BarChart) {
          
            if (widget.Operations != null) {
                var T: widgetData;
                if (widget.ExpBar) {
                    T = this.buildExpBarChart(widget.Operations, widget.Datasource)
                }
                else
                  T = this.buildFlatCharts_chartjs(widget.Operations, widget.Datasource);
                
                

                widget.CurrentData = T;
                widget.syncLabels(T.labels);
                this.reSortLabels(widget);
                widget.BuildSchema();
                widget.UpdateColors();
                //widget.ColorBehavior = true;
                
                
                //if (this.widget.colorPlatte[e.SerialName] && this.widget.colorPlatte[e.SerialName].color && this.widget.colorPlatte[e.SerialName].color.toLowerCase() != e.color.toLowerCase()) {
                //  //debugger;
                //  this.widget.ChangeColor(e.SerialName, e.color)
                //}
            }


            //   this.PieChartLayer = this.widget.CurrentData.layers[0];
            // var temp = this.Methods.BuildWidget(this.widget.Operations, this.widget.Datasource);

            // //console.log(this.Methods.PrepareSerise(this.widget.Operations, temp));
        }
        else if (widget.WidgetType == DashboardWidgetTypeEnum.DigitChart) {
            if (widget.Operations != null) {
                let  T: any;
                T = this.buildDigitChart(widget.Operations, widget.Datasource)

                widget.CurrentData = T;
             //   widget.BuildSchema();
            }
        }
        else if (widget.WidgetType == DashboardWidgetTypeEnum.ActiveTotalChart) {
            if (widget.Operations != null) {
                let T: any;
                T = this.buildActiveTotalChart(widget.Operations, widget.Datasource)

                widget.CurrentData = T;
                //   widget.BuildSchema();
            }
        }
        else if (widget.WidgetType == DashboardWidgetTypeEnum.Gauge) {
            if (widget.Operations != null) {
                let T: any;
                console.log(widget.Operations);
                T = this.BuildGauge(widget.Operations, widget.Datasource);
                widget.CurrentData = T;
                //   widget.BuildSchema();
            }
        }
       // console.log(widget);
    }
    BuildGauge(Queries: dash.Query[], dataSource: any[]) {
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
        return layers;
    }
    reSortLabels(widget: DashboardWidget) {

      //  debugger;
      let labels = [];
      let temp = _.cloneDeep(widget.widgetLabels);
      temp = temp.sort(function (a, b) {
        return a.priority - b.priority;
      });
      widget.widgetLabels = temp;


    }
    construct_layer(data: any[], agrument: any):any[] {
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
    private restCashe() {
        this.cashe = [];
    }
    buildActiveTotalChart(Quries: dash.Query[], Datasource: any[]): any {
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
        return result;

    }
    buildFlatCharts(Quries: dash.Query[], Datasource: any[]): any {
      
        
     
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
        return final;
    }

    handleSerise(ser: dash.Query[], data: any[],argu:any):any {
        var res = [];
        var all_ser: string[] =[];
        var count = 0;
        var check : boolean[] = [];
        for (let recored of data) {
            var seriseName = "";
            let nRow = {};
            for (let row of recored) {
                for (let field in row) {
                    if (field == 'serise')
                        continue
                    if (row['serise'])
                        nRow[row['serise'] + "-" + field] = row[field];
                    else
                        nRow[field] = row[field];
                }
                //delete row[x.Operation.GetFieldName()];
                if (!check[row['serise']]) {
                    check[row['serise']] = true;
                    all_ser.push(row['serise']||"")
                }
            }
            if (!argu[count] || argu[count] == '0')
                nRow['argument'] = 'total';
            else
                nRow['argument'] = argu[count].split('+').join('<br>');
            count++;
            res.push(nRow);
            
        }

        return {'serise': all_ser,'data':res };
    }
    //for Groups
    cloneDeepNotIndexed(arr) {


    }

    ConcatDistinctroups(T: DimensionField[], S: DimensionField[]): DimensionField[] {
        for (let RT of T) {
            for (let RS of S) {
                if (RT.name == RS.name) {
                    for (let val of RS.value) {
                        if (RT.value.findIndex(x => { return x == val }) == -1)
                            RT.value.push(val);
                    }
                }
            }
        }
        return T;
    }
    buildDigitChart(Quries: dash.Query[], DatasourceOrg: any[]): number {
      //debugger;
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
        return numeral(actual - target).format('0.0a');
    }
    buildFlatCharts_chartjs(Quries: dash.Query[], DatasourceOrg: any[]): widgetData {
        // debugger;


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
        return new widgetData(agruments, dataset, seriseFields, groupFields, measureFields, additionalData);
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
    buildExpBarChart(Quries: dash.Query[], DatasourceOrg: any[]): widgetData {
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
        if (!groupField || !actual || !target)
            return this.buildFlatCharts_chartjs(Quries, DatasourceOrg)
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
        return new widgetData(labels, dataset, [], T.GroupsValue, measureFields,[]);
    }
    calculatExp(groups: dash.Query[], datasets:any[]): any {
        if (!groups || !groups.length) {
            return null;
        }
        let actual = null;
        for (let dat of datasets) {
            if (dat.role.QuerySubType == dash.QuerySubTypeEnum.ActualExp) {
                actual = dat;
                break;
           
            }
        }
        if (!actual)
            return null;
        let labels = this.constructorExpLabels(groups[0].Operation.Type);
        if (!labels) return null;

    }
    constructorExpLabels(type: dash.DateGroupEnum) {
        if (type == dash.DateGroupEnum.Month) {
            return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        }
        return null;
    }
    
    public  arrangColors(dataset:any[]) {
        var colors = new dash.GroupOperation(new dash.Field("serise", "serise"));
        this.GroupBy_v1([colors], dataset);
        return  this.GroupBy_v1([colors], dataset);
    }
    ApplyFilters(widget: DashboardWidget, Updating:boolean=false) {
       
        var changed: boolean= false;
        var operate: any[] = [];
      
        ///chech for strign filter
       

        //check if there  are master filter to Aplay   
        if (widget.MasterFilter) {
            let data = widget.OrginalDatasource 
            operate = jQuery.extend(true, [], Operations.MasterFilter);
            operate['F' + widget.ID] = [];
            changed = true;
        }
        //check for local selected components filter
        else if (Object.keys(widget.AcceptFilter).length > 0) {
            for (let id in widget.AcceptFilter) {
                if (widget.AcceptFilter[id]){ 
                if (Operations.MasterFilter[id]) {
                    operate.push(_.cloneDeep(Operations.MasterFilter[id]));
                    if (!changed)
                        changed = true;
                }
              }
            }
        }
        

        if (changed) {
            var finalData= _.cloneDeep(widget.OrginalDatasource);
            if (widget.FilterString && widget.FilterString.length > 3) { finalData = this.FilterByString(widget.FilterString, finalData); }
            widget.Datasource = this.FilterLists(operate, finalData);
            this.BuildWidget(widget);
        }
        else if (Updating) {
            var finalData = _.cloneDeep(widget.OrginalDatasource);
            if (widget.FilterString && widget.FilterString.length > 3) { finalData = this.FilterByString(widget.FilterString, finalData); }
            widget.Datasource = finalData;
            this.BuildWidget(widget);
        }
           
    }
   
    formatDate(date: any, Type: dash.DateGroupEnum,dashes:boolean = true) {
        var dat = new Date(date);
        var DateFormated = "";
        if (!dashes) {
           
            if (Type == DateGroupEnum.MonthYear) {
                DateFormated += "Year_" + (dat.getFullYear()).toString();
                DateFormated += "_" + (dat.getMonth() + 1).toString();
            }
            else if (Type == DateGroupEnum.QuarterYear) {
                DateFormated += "Year_" + (dat.getFullYear()).toString();
                DateFormated += "_" + "Quarter_" + (_.ceil((dat.getMonth() + 1) / 3)).toString();
            }
            else if (Type == DateGroupEnum.none) {
                DateFormated += "Year_" + (dat.getFullYear()).toString();
                DateFormated += "_" + (dat.getMonth() + 1).toString();
                DateFormated += "_" + (dat.getDay()).toString();
              
            }
            else if (Type == DateGroupEnum.Year) {
                DateFormated += "Year_" + (dat.getFullYear()).toString();
            }
            else if (Type == DateGroupEnum.Month) {
                DateFormated = dash.monthNames[(dat.getMonth()+1)];
            }
        }
        else {
          
            if (Type == DateGroupEnum.QuarterYear) {
                DateFormated = dat.getFullYear().toString();
                DateFormated += "/ Q " + (_.ceil((dat.getMonth() + 1) / 3)).toString();
            }
            else if (Type == DateGroupEnum.MonthYear) {
                DateFormated = dat.getFullYear().toString();
                DateFormated += "/" + (dat.getMonth() + 1).toString();
            }
            else if (Type == DateGroupEnum.none) {
                DateFormated = dat.getFullYear().toString();
                DateFormated += "/" + (dat.getMonth() + 1).toString();
                DateFormated += "/" + (dat.getDay()).toString();
               
            }
            else if (Type == DateGroupEnum.Month) {
                DateFormated = dash.monthNames[(dat.getMonth()+1)];
            }
            else if (Type == DateGroupEnum.Year) {
                DateFormated = dat.getFullYear().toString();
            }
        }
        return DateFormated;

    }
//wanna role 
     //private Sum(op: dash.MeasureOperation, GroupName: string) {
    //    var index = (GroupName + dash.QueryTypeEnum.Measure + op.Type + op.Field.StoredName);
    //    if (!this.cashe[index])
    //        this.cashe[index] = _.sumBy(this.DataAsGroups[GroupName], op.Field.StoredName);
    //    return this.cashe[index];
    //}
    
//"sales > 5 && xsd<56 ! "
   /*
    list of -
    list of data 1 &   ID - Country - City
                        1    EGY      Cairo
                        2    EGY      Alexandria
                        3    USA      California
    list of data 2     Vendor
                       BMW
                       Mercedes
    Type: string or date group by ;



    Input Data
                     ID Country Vendor  Price
                      1  EGY    BMW      1000
                      1  EGY    Honda    500
                      2  USA    BMW     20000
    -------------------------------------------
    FilterString

    */

    ///olllllllllllllllld
    private BuildGroups() {
        let counter = 0;
        for (let row of this.data) {

            let grouped: string = "";
            for (let entity of this.Fields) {
                let FieldVal = "";
                if (entity.OperationType == OperationTypeEnum.Group) {
                    if (entity.DataType && entity.DataType == DataTypeEnum.object) {
                        var dat = new Date(row[entity.FieldName]);
                        grouped += (dat.getFullYear()).toString()
                        if (entity.GroupedDateType == DateGroupEnum.MonthYear) {
                            grouped += (dat.getMonth() + 1).toString();
                        }
                        else if (entity.GroupedDateType == DateGroupEnum.QuarterYear) {
                            grouped += (_.ceil((dat.getMonth() + 1) / 3)).toString();
                        }

                    }
                    else
                        grouped += row[entity.FieldName];
                }
            }
            
            if (grouped.length > 0) {
                if (!this.DataAsGroups.hasOwnProperty(grouped)) {
                    this.DataAsGroups[grouped] = [];
                }
                this.DataAsGroups[grouped].push(row);
            }
            else {
                this.DataAsGroups[counter] = [];
                this.DataAsGroups[counter++].push(row);
            }
        }

    }
    private BuildGroupFields() {
        for (let entity of this.Fields) {
            if (entity.OperationType == OperationTypeEnum.Group) {
                this.GroupFields[entity.FieldName] = entity.DataType;
            }
        }

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
    //by equtin

    public FilterByString(FilterString: string, data: any[]): any[] {
        if (FilterString.length > 3)
            return jQuery.grep(data, (o) => { return eval(FilterString) });
    }
    public FilterAndGroup(FilterString: string, GroupOptions: DashboardDataFields[], Data: any[], FilterFirst = 1) {
        if (FilterFirst) {
            return this.GroupBy(GroupOptions, this.FilterByString(FilterString, Data));
        }
        else
            return this.FilterByString(FilterString, this.GroupBy(GroupOptions, Data));
    }
    //filter List
    public FilterLists(FilterList: any[], Datasource: any[]): any[] {
        //console.log(FilterList);
       
        let data = _.cloneDeep(Datasource);
        //console.log(data)
        var Filtered: any[] = []
        for (let row of data) {
            var isValid: boolean = true;
           
            for (let list in FilterList) {
               
                isValid = (isValid && this.probertyFilter(FilterList[list], row))
            }
            if (isValid)
                Filtered.push(row);
        }
        //console.log(Filtered)
        return Filtered;
    }
    private probertyFilter(list: any[], data: any): boolean {
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
                        if (obj[head].date != this.formatDate(data[head], obj[head].type)) {
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
    private average(index: string, type: string, field: string, obj: any[]) {
        if (!this.cashe[index + "avg" + field])
            this.cashe[index + "avg" + field] = this.GetCashe((index + type + field), obj, field) / obj.length;
        return this.cashe[index + "avg" + field]
    }

    private Delta(index1: string, index2: string, base: string, target: string, type: string): any[] {
        if (!this.cashe[index1 + index2 + "delta" + base + target])
            this.cashe[index1 + index2 + "delta" + base + target] = _.round((this.GetCashe((index1 + type + base), this.DataAsGroups[index1], base) / this.GetCashe((index2 + type + target), this.DataAsGroups[index2], target) - 1) * 100, 2);
        return this.cashe[index1 + index2 + "delta" + base + target];
    }

    private GetCashe(index: string, Obj: any[], field: string) {
        if (!this.cashe[index])
            this.cashe[index] = _.sumBy(Obj, field);
        return this.cashe[index];

    }
    private IsAlpha(ch: any): boolean {
        return ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z'));
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
            else if (this.IsAlpha(expr[i] || expr[i] == '_')) {
                var buffer = "";
                while (this.IsAlpha(expr[i] || expr[i] == '_') && i < expr.length) { buffer += expr[i++]; }
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
    public GroupBy(fields: DashboardDataFields[], Data: any[]): any[] {


        this.FinalView = [];
        this.cashe = {};
        this.DataAsGroups = [];
        this.GroupFields = [];
        this.ExpressionTokens = [];
        this.Fields = fields;
        this.data = Data;
        // this.BuildGroupFields();
        this.BuildGroups();
        // //console.log(this.DataAsGroups);
        this.operate_v1();


        return this.FinalView;
    }
}
