import { chartBuilderManager } from "./dashboard-chart-builder-manager";
import { DashboardWidget } from "./dashboard.model/dashboard-widget.model";
import { DashboardWidgetChartTypeEnum } from "./dashboard.model/dashboard-widget-chart-type";
import { DashboardWidgetTypeEnum } from "./dashboard.model/dashboard-widget-type.enum";
import { Operations } from "./dashboard-operations";

export class Test{
     test: Operations;
    widget:DashboardWidget;
    constructor(){
        this.widget = new DashboardWidget();
        this.widget.WidgetChartType = DashboardWidgetChartTypeEnum.default;
        this.widget.WidgetType = DashboardWidgetTypeEnum.ActiveTotalChart;
        this.widget.Operations = [1,2,3];
        this.widget.Datasource = [4,5,6];
    }
    
    public main(): number {
        this.test = new Operations();
        this.test.BuildWidget(this.widget);
        return 0;
    }
}
let kx = new Test();
kx.main();