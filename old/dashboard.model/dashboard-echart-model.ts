export class Option {
    title: Title = new Title();
    tooltip: ToolTip = new ToolTip();
    legend: Legend = new Legend();
    xAxis: XAxis = new XAxis();
    yAxis: YAxis = new YAxis();
    series: Series = new Series();
  }
  class Title {
    text: string;
  }
  class Legend {
    data: any[];
  }
  class XAxis {
    data: any[];
    show: boolean;
  }
  class YAxis {
    data: any[];
    show: boolean;
  }
  class Series {
    name: string;
    type: string;
    data: any[];
    symbolSize: number;
  }
  class ToolTip{
      trigger: string;
      axisPointer: AxisPointer = new AxisPointer();
  }
  class AxisPointer{
      type: string;
  }
  class Polar{
      center:any[];
      radius:any[];
  }
  