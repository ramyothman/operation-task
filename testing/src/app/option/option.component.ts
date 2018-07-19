import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-option',
  templateUrl: './option.component.html',
  styleUrls: ['./option.component.css']
})
export class OptionComponent {
  title: Title = new Title();
  tooltip: Tooltip = new Tooltip();
  legend: Legend = new Legend();
  series: Array<Series> = new Array<Series>();
  xAxis: Axis = new Axis();
  yAxis: Axis = new Axis();
  color?: any[];
}
export class Data {
  xAxis: any[] ;
  yAxis: any[] ;
}
class Title {
  text: any;
}
class Legend {
  data: any[];
}
export class Series {
  name?: string;
  type?: string;
  data?: Array<DataOption> = new Array<DataOption>();
  stack?: number;
}
export class DataObject{
  name: string;
  value: any[];
}
export class Axis{
  data: any[];
  show: boolean = true;
}
export class Tooltip{
  trigger?: string;
}
export class DataOption{
  value: any[]
  itemStyle: Color = new Color();
}
export class Color{
  color: any;
}



