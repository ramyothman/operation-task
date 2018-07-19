import * as echarts from 'echarts'
import { chartBuilderInterface } from './dashboard-chart-builder-interface';
import { Option } from './dashboard.model/dashboard-echart-model';



export class EchartBuilder implements chartBuilderInterface{
    widget;
    queries: any[];
    dataSource: any;
    option: Option = new Option();
    public constructor(xAxis:any[] , yAxis:any[] , series:any[]){}
    buildGridChart() {
        throw new Error("Method not implemented.");
    }
    buildPivotChart() {
        throw new Error("Method not implemented.");
    }
    buildPieChart() {
        this.option.series.type = 'pie';
        this.option.xAxis.show = false ;
        this.option.yAxis.show = false ;
    }
    buildExpBarChart() {
        this.option.series.type = 'bar';
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
    buildFlatChart() {
        throw new Error("Method not implemented.");
    }

    
    

}