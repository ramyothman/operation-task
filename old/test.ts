import { chartBuilderManager } from "./dashboard-chart-builder-manager";
import { DashboardWidget } from "./dashboard.model/dashboard-widget.model";
import { DashboardWidgetChartTypeEnum } from "./dashboard.model/dashboard-widget-chart-type";
import { DashboardWidgetTypeEnum } from "./dashboard.model/dashboard-widget-type.enum";

export class Test{
    test: chartBuilderManager;
    widget:DashboardWidget;
    constructor(){}
    
    public main(): number {
        this.widget.Datasource = [1,2,3];
        this.widget.WidgetType = DashboardWidgetTypeEnum.Pivot;
        this.test = new chartBuilderManager(this.widget);
        return 0;
    }
}
let kx = new Test();
kx.main();