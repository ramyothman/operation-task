import { GridStackItem } from 'ng4-gridstack'
import { DashboardWidgetTypeEnum } from './dashboard-widget-type.enum'
import { Table } from './data-source-schema/table.model';
import { View } from './data-source-schema/view.model';
import { platte } from './platte.model';
import { Query, DashboardDataFields, DataTypeEnum, OperationTypeEnum, QueryTypeEnum, chartType, DimensionField } from './dashboard-data-fields';
import * as _ from 'lodash';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import Chart from 'chart.js';
export class DashboardWidget {
    ID: number;
    PrimaryID: number;
    FilterEditingObject: FilterEditingObject[];
    DisplayID: string;
    Caption: string;
    DatasourceInit: any[];
    Datasource: any;
    OrginalDatasource: any;
    MasterFilter: boolean;
    AcceptFilter: any[] = [];
    charts:any;
    FilterString: string;
    FilterSelectionType: string = "none"
    ChartSeriseSelectionType: string = 'allArgumentPoints';
    CurrentData: any;
    table: Table = new Table();
    view: View = new View();
    isTable: boolean = true;
    CenterRange: boolean = true;
    Operations: any[] = [];
    DataOperations: DashboardDataFields[] = [];
    IsSelected: boolean = false;
    isNested: boolean = false;
    Stacked: boolean = false;
    ExpBar: boolean = false;
    selectedArgument: Array<DimensionField> = new Array<DimensionField>(); //for coloring 
    selectedSerise: Array<DimensionField> = new Array<DimensionField>();   // for coloring
    AutoColoredMeasure: boolean = false;
    ColorschemaList:Array<schema>  = new Array<schema>();
    colorCounter: number = 0;
    colorPlatte:any[]=[]
    Item: GridStackItem;
    WidgetType: DashboardWidgetTypeEnum = DashboardWidgetTypeEnum.None;
    GridStackMainWidth: number;
    ColorContext = { $implicit: null };
    ColorBehavior: boolean;
    widgetLabels: Array<{label:string ,priority:number}> = [];
    syncLabels(source: Array<string>) {
        if (!this.widgetLabels)
            this.widgetLabels = [];
        let newLB = [];
        let sync = [];
        let mx = 0;
        for (let lb of source) {
            let index = this.widgetLabels.findIndex(x => { return x.label == lb })
            if (index != -1) {
                sync.push(this.widgetLabels[index]);
                mx = Math.max(mx, this.widgetLabels[index].priority)
            }
            else
                newLB.push(lb)
        }
        for (let row of newLB) {
           sync.push({ "label": row, "priority": mx++ });
           
        }
        //sync = sync.sort(function (a, b) {
        //  return a.priority - b.priority;
        //});
        this.widgetLabels = sync
    }
    private _fieldTypes: any[] = null;
    get FieldTypes(): any[] {




        if (this._fieldTypes == null) {
            var fieldTypes: any[] = [];
            switch (this.WidgetType) {
                case DashboardWidgetTypeEnum.Grid:
                    fieldTypes.push({ "name": 'Dimension', "class": 'dashboard-icn-dimensions', "type": QueryTypeEnum.Group });
                    fieldTypes.push({ "name": 'Measure', "class": 'dashboard-icn-pivot', "type": QueryTypeEnum.Measure });
                    fieldTypes.push({ "name": 'Delta', "class": 'dashboard-icn-delta', "type": QueryTypeEnum.Delta });
                    fieldTypes.push({ "name": 'Sparkline', "class": 'dashboard-icn-sparkline', "type": QueryTypeEnum.Spark });
                    fieldTypes.push({ "name": 'Chart', "class": 'dashboard-icn-bar-chart', "type": QueryTypeEnum.Chart });
                    fieldTypes.push({ "name": 'Bar Chart', "class": 'dashboard-icn-bar-chart', "type": QueryTypeEnum.BarChart });
                    //fieldTypes.push({ "name": 'Sparkline', "class": 'field-type-icon-calculatedField', "type": QueryTypeEnum.calc });
                    break;
                case DashboardWidgetTypeEnum.Pivot:
                    break;
                case DashboardWidgetTypeEnum.BarChart:
                    fieldTypes.push({ "name": 'Bar Chart', "class": 'dashboard-icn-bar-chart', "type": chartType.bar });
                    fieldTypes.push({ "name": 'Line Chart', "class": 'dashboard-icn-line', "type": chartType.line });

                    break;
                case DashboardWidgetTypeEnum.PieChart:
                case DashboardWidgetTypeEnum.ScatterChart:
                case DashboardWidgetTypeEnum.StatisticsChart:
                case DashboardWidgetTypeEnum.TreeChart:
                    break;
                default:
                    break;
            }

            this._fieldTypes = fieldTypes;
        }
        return this._fieldTypes;
    }

    private _fields: any[] = null;
    get Fields(): any[] {



        if (this._fields == null) {
            var fields: any[] = [];
            /// debugger;

            if (this.isTable && this.table.Columns) {
                for (let col of this.table.Columns) {
                    var tt = col.ColumnDataType.LanguageSpecificType == "Date" ? "object" : col.ColumnDataType.LanguageSpecificType;
                    tt = col.ColumnDataType.LanguageSpecificType == "boolean" ? "number" : tt;
                    fields.push({ "name": col.Name, "type": DataTypeEnum[tt] });
                }
            }
            else if (this.view.Columns) {
                for (let col of this.view.Columns) {
                    var tt = col.ColumnDataType.LanguageSpecificType == "Date" ? "object" : col.ColumnDataType.LanguageSpecificType;
                    tt = col.ColumnDataType.LanguageSpecificType == "boolean" ? "number" : tt;
                    fields.push({ "name": col.Name, "type": DataTypeEnum[tt] });
                }

            }
            //  console.log(fields);
            this._fields = fields;
        }
        return this._fields;
    }
    set Fields(d: any[]) {
        this._fields = d;
    }

    ColumnFields: any[] = [];
    ValueFields: any[] = [];
    GroupByFields: any[] = [];
    XaxisFields: any[] = [];
    YaxisFields: any[] = [];

    DataSourceChanged() {
        this._fields = null;
        this._fieldTypes = null;
    }
    ChangeColor(serial: string, value: string) {
        this.colorPlatte[serial] = { "color": value, "setByUser":true};
        this.applayColors();
        this.updateChartsColor();
    }
    UpdateColors() {
      this.applayColors();
      this.updateChartsColor();
    }
    BuildSchema() {
       //s debugger
        this.colorCounter = 0;
        this.random = [];
        this.CombaineSelection();
        let all_Fields = []
       
        if (this.selectedSerise) {
            all_Fields = all_Fields.concat(_.sortBy(this.selectedSerise, x => { return x.name }));
        }
        if (this.selectedArgument) {
            all_Fields = all_Fields.concat(_.sortBy(this.selectedArgument, x => { return x.name }));
        }
        if (!this.AutoColoredMeasure && this.CurrentData && this.CurrentData.fields) {
            all_Fields.push(this.CurrentData.fields);
        }

        if (all_Fields.length > 0) {
            schema.IDCounter = 0;
            this.ColorschemaList = this._rec(0, "", all_Fields);
            this.ColorContext.$implicit = this.ColorschemaList;
            this.applayColors();
            // console.log(this.colorPlatte);
            this.updateChartsColor();
           
        }
    }
    CombaineSelection() {
        //debugger;
        if (this.selectedSerise) {
            let temp = new Array<DimensionField>();
            for (let row of this.selectedSerise) {
                for (let legend of this.CurrentData.legend) {
                    if (row.name == legend.name) {
                        legend.AutoColored = false;
                        temp.push(legend);
                        break;
                    }
                }
            }
            this.selectedSerise = temp;
        }
        else
            this.selectedSerise = new Array<DimensionField>();
        if (this.selectedArgument) {
            let temp = new Array<DimensionField>();
            for (let row of this.selectedArgument) {
                for (let agrument of this.CurrentData.agrument) {
                    if (row.name == agrument.name) {
                        agrument.AutoColored = false;
                        temp.push(agrument);
                        break;
                    }
                }
            }
            this.selectedArgument = temp;
        }
        else
            this.selectedArgument = new Array<DimensionField>();
    }
   private  _rec(inx: number, name: string, all_Fields) {

        if (inx == all_Fields.length)
            return new Array<schema>();

        let level = new Array<schema>();
        for (let val of all_Fields[inx].value) {
            let node = new schema();
            node.name = val;
            node.SerialName = "";
            if (name.length)
                node.SerialName = name + "-";
            node.SerialName += val;
            level.push(node);
            node.id = "sc" + (schema.IDCounter++);
            node.supList = this._rec(inx + 1, node.SerialName, all_Fields);
            node.myContext.$implicit = node.supList;
        }
       //leaves color
        if (!level[0].supList || level[0].supList.length == 0) {
            for (let node of level) {
                if ((!this.colorPlatte[node.SerialName] || !this.colorPlatte[node.SerialName].setByUser) && !this.random[node.SerialName]) {
                    this.colorPlatte[node.SerialName] = { "color": platte.getColor(this.colorCounter), "setByUser": false };
                    this.random[node.SerialName] = true;
                    this.colorCounter++;
                }
                node.color = this.colorPlatte[node.SerialName].color;
            }
        }
        return level;
    }
   private random = [];
    
   private applayColors() {
      
       if (this.WidgetType == DashboardWidgetTypeEnum.BarChart) {
        
           this.saveDatasetColor(this.CurrentData.datasets, this.CurrentData.labels);
       }
       else if (this.WidgetType == DashboardWidgetTypeEnum.PieChart) {
           for (let layer of this.CurrentData.datasets) {
               for (let charts of layer){
                   this.saveDatasetColor([charts], charts.labels);
               }
           }
               
          
       }

   }
  
   updateChartsColor() {
       this.ColorBehavior =  !this.ColorBehavior;
       
   }
   private saveDatasetColor(datasets, labels) {
       //debugger;
       this.colorPlatte.findIndex
       for (let set of datasets) {
           let backgroundColor = [];
           let Sname = "";
           if (this.selectedSerise && this.selectedSerise.length) {
               for (let se of this.selectedSerise) {
                   if (set.serisList[se.name]) {
                       if (Sname.length)
                           Sname += "-"
                       Sname += set.serisList[se.name];
                   }
               }
           }

           for (let label of labels) {
             //     debugger;

               let final = Sname;
               if (this.selectedArgument && this.selectedArgument.length) {
                   let agru = "";
                   let inx = set.data.findIndex(o => { return o.x == label })

                   if (inx != -1) {
                       let temp = set.data[inx];
                       if (temp.group) {
                           for (let agrument of this.selectedArgument) {

                               if (temp.group[agrument.name]) {
                                   if (agru.length)
                                       agru += "-"
                                   agru += temp.group[agrument.name];
                               }

                           }
                       }
                   }
                   if (agru && agru.length) {
                       if (final.length)
                           final += "-";
                       final += agru;
                   }
               }
               if (!this.AutoColoredMeasure) {
                   if (final.length)
                       final += "-";
                   final += set.Field.FieldName;
               }
               if (!this.colorPlatte[final]) {
                   this.colorPlatte[final] = { "color": platte.getColor(this.colorCounter), "setByUser": false };
                   this.colorCounter++;
               }
               backgroundColor.push(this.colorPlatte[final].color);
           }
           if (set.type == "line") {
               set.borderColor = backgroundColor[0];
               set.pointBackgroundColor = backgroundColor;
               set.backgroundColor = null;
               set.fill = false;
           }
           else
               set.backgroundColor = backgroundColor;
       }
   }
   public createPieData(dataSource ,chart) {
       
    let isselected = new Array<boolean>();



    isselected = isselected.fill(false, 0, isselected.length);

    //var DD = {
    //    labels: this.labels,
    //    datasets: this.data
    //};
    //   //debugger;
    var data2 = {};
    if (!this.isNested) {
        // debugger;
        let T = _.cloneDeep(dataSource);
        T['alterColor'] = T.backgroundColor;
        T.backgroundColor = dataSource.backgroundColor;

        let subData = [];
        for (let sub of T.data) {
            subData.push(sub.y);
        }
        T["FullData"] = dataSource.data;

        T.data = subData;
        data2 = {
            "labels": T.labels,
            'Selected': _.cloneDeep(isselected),
            "datasets": [T],
            source: dataSource
        }

    }
    else {
        //  debugger;

        let labels: Array<string> = []
        let FULLdatasets = [];
        let T = _.cloneDeep(dataSource);

        if (T && T != null && T[0]) {
            //debugger;
            // this.dataSource = this.dataSource[0];
            let idxx = 0;
            let counter = 0;
            for (let i = 0; i < T.length; i++) {
                let pie = T[i];
                for (let lb of pie.labels) {
                    if (labels.findIndex(x => { return x == lb }) == -1)
                        labels.push(lb);
                }
                let subData = []
                for (let sub of pie.data) {
                    subData.push(sub.y);
                }
                pie["FullData"] = dataSource[i].data;
                pie.data = subData;
                pie.backgroundColor = dataSource[counter].backgroundColor;
                pie['alterColor'] = _.cloneDeep(dataSource[counter].backgroundColor);
                FULLdatasets = FULLdatasets.concat(pie);
                counter++;
            }

            isselected = new Array<boolean>(labels.length);
            isselected = isselected.fill(false, 0, isselected.length);
            // debugger;
            data2 = {
                labels: labels,
                Selected: _.cloneDeep(isselected),
                datasets: FULLdatasets,
                source: dataSource
            };

        }
    }
    if (chart) {
        chart.data = data2;
        chart.update();
    }
}
   
}
export class FilterEditingObject {
    //ID: number;
    // parentID: number;
    root: boolean;
    showGroup: boolean;
    showPlus: boolean;
    parentObject: FilterEditingObject;
    isoper: boolean;
    opnet: string;
    condation: string;
    value1: string;
    value2: string;
    supList: FilterEditingObject[] = [];
    myContext = { $implicit: this.supList };

}








export class widgetData {
    constructor();
    constructor(labels: Array<string>, datasets: any[], legend: Array<DimensionField>, agrument: Array<DimensionField>, fields: DimensionField, additionalData: any[]);
    constructor(labels?: Array<string>, datasets?: any[], legend?: Array<DimensionField>, agrument?: Array<DimensionField>, fields?: DimensionField, additionalData?: any[]) {
        this.labels = labels;
        this.datasets = datasets;
        this.legend = legend;
        this.agrument = agrument;
        this.fields = fields;
        this.additionalData = additionalData;
    } 
    public labels: Array<string>;
    public datasets: any[];
    public legend: Array<DimensionField>;
    public agrument: Array<DimensionField>;
    public fields: DimensionField;
    public additionalData: Array<number>;
}


export class schema {
    name: string;
    SerialName;
    color: string;
    supList: Array<schema>;
    id: string;
    static IDCounter;
    myContext = { $implicit: this.supList };
}



export class DashboardWidgetSaving {
    PrimayID: number;
    CompanyID: number;
    CompanyBranchID: number;
    DataJSON: string;
    Name: string;
}
