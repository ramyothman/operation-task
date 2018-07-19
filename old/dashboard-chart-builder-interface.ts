import {DashboardWidget} from './dashboard.model/dashboard-widget.model'
// abstract that every type of charts should implement 

export interface chartBuilderInterface{
    
     // properties 
     widget : DashboardWidget;
     queries: any[];
     dataSource: any;

     // functions
     buildGridChart();
     buildPivotChart();
     buildPieChart();
     buildExpBarChart();
     buildDigitChart();
     buildActiveTotalChart();
     buildGaugeChart();
     buildFlatChart();
}