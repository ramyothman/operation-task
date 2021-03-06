import { DashboardWidget } from "./dashboard.model/dashboard-widget.model";
import { DashboardWidgetTypeEnum } from "./dashboard.model/dashboard-widget-type.enum";
import { DashboardWidgetChartTypeEnum } from "./dashboard.model/dashboard-widget-chart-type";
import { chartBuilder } from "./dashboard-chart-builder";
import { chartJsBuilder } from "./dashboard-chart-js-builder";


export class chartBuilderManager{
    widget: DashboardWidget;
    mapFromEnumToFuncName = new Map();
    public constructor(widget: DashboardWidget){
        this.widget = widget;
        this.intialize();
        console.log("builderManager is here");
        this.build();
    }
    private intialize() :void{     // to intialize map with default enums "types" 
        this.addNewTypeToMap(DashboardWidgetTypeEnum.ActiveTotalChart,'buildActiveTotalChart');
        this.addNewTypeToMap(DashboardWidgetTypeEnum.DigitChart,'buildDigitChart');
        this.addNewTypeToMap(DashboardWidgetTypeEnum.Gauge,'buildGaugeChart');
        this.addNewTypeToMap(DashboardWidgetTypeEnum.Grid,'buildGridChart');
        this.addNewTypeToMap(DashboardWidgetTypeEnum.Pivot,'buildPivotChart');
        this.addNewTypeToMap(DashboardWidgetTypeEnum.PieChart,'buildPieChart');
        this.addNewTypeToMap(DashboardWidgetTypeEnum.BarChart,'buildExpBarChart');
        this.addNewTypeToMap(DashboardWidgetTypeEnum.Flat,'buildFlatChart');
    }
    public addNewTypeToMap(newEnum:number , funcName:String ):void{    // to add new "enum" chartType to map // paramater ( enum number , build function name)
        this.mapFromEnumToFuncName.set(newEnum,"builder."+funcName+"()");
    }
    public checkDataSource():void{    // to check if there is data source 
        if (!this.widget.Datasource)
            alert("no DataSource");
    }
    public build(): void{ // build widget according to widget and chart type
        if(this.widget.Operations == null){
            return;
        }
        let builder;
        this.checkDataSource();
        if(this.widget.WidgetChartType == DashboardWidgetChartTypeEnum.default) {
             builder = new chartBuilder(this.widget);
        }
        else if(this.widget.WidgetChartType == DashboardWidgetChartTypeEnum.js){
             builder = new chartJsBuilder(this.widget);
        }
        else if(this.widget.WidgetChartType == DashboardWidgetChartTypeEnum.echart){
            throw new Error("echart not implemented yet.");
        }
        else{
            throw new Error("this type not implemented yet.");
        }
        console.log(this.mapFromEnumToFuncName.get(this.widget.WidgetType)); // for testing
        eval(this.mapFromEnumToFuncName.get(this.widget.WidgetType));  // eval : excute string 
    }
}