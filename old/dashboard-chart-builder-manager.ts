import { DashboardWidget } from "./dashboard.model/dashboard-widget.model";
import { DashboardWidgetTypeEnum } from "./dashboard.model/dashboard-widget-type.enum";
import { DashboardWidgetChartTypeEnum } from "./dashboard.model/dashboard-widget-chart-type";
import { chartBuilder } from "./dashboard-chart-builder";
import { chartJsBuilder } from "./dashboard-chart-js-builder";


export class chartBuilderManager{
    widget: DashboardWidget;
    mapFromEnumToFuncName = new Map();
    constructor(widget: DashboardWidget){
        this.widget = widget;
        this.intialize();
    }
    private intialize() :void{     // to intialize map with default enums "types" 
        this.addNewTypeToMap(DashboardWidgetTypeEnum.ActiveTotalChart,'buildActiveTotalChart');
        this.addNewTypeToMap(DashboardWidgetTypeEnum.DigitChart,'buildDigitChart');
        this.addNewTypeToMap(DashboardWidgetTypeEnum.Gauge,'buildGaugeChart');
        this.addNewTypeToMap(DashboardWidgetTypeEnum.Grid,'buildGridChart');
        this.addNewTypeToMap(DashboardWidgetTypeEnum.Pivot,'buildPivotChart');
        this.addNewTypeToMap(DashboardWidgetTypeEnum.PieChart,'buildPieChart');
        this.addNewTypeToMap(DashboardWidgetTypeEnum.BarChart,'buildExpBarChart');
    }
    public addNewTypeToMap(newEnum:number , funcName:String ):void{    // to add new "enum" chartType to map // paramater ( enum number , build function name)
        this.mapFromEnumToFuncName.set(newEnum,"builder."+funcName+"()");
    }
    public checkDataSource():void{    // to check if there is data source 
        if (!this.widget.Datasource)
            alert("no DataSource");
    }
    public build(): void{
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
        eval(this.mapFromEnumToFuncName.get(this.widget.WidgetType));
    }
}