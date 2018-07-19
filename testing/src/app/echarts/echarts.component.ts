import { Component, OnInit, ElementRef } from '@angular/core';
import * as echarts from 'echarts';
import { OptionComponent, Data, Series, DataObject, DataOption } from '../option/option.component';
import { MyserviceService } from '../myservice.service';
@Component({
  selector: 'app-echarts',
  templateUrl: './echarts.component.html',
  styleUrls: ['./echarts.component.css']
})
export class EchartsComponent implements OnInit {
  data:any[];
  xAxis:any;
  yAxis:any[];
  grouping:any;
  myData:Data = new Data();
  constructor(private myService: MyserviceService ) {
    
    this.data = myService.getData();    // input data ; 
    this.xAxis = ['state'];             // x-axis fields;
    this.yAxis = ['year1998','year2001','year2004'];  // y-axis fields
    //this.grouping = 'product';                      // grouping field
    this.myData.xAxis = this.getXaxis();              // x-axis of echart
    this.myData.yAxis = this.getYaxis();              // y-axis of echart
   // this.myData.yAxis = this.groupBy();
    console.log(this.myData)              
    console.log(this.myData.xAxis);
    console.log(this.myData.yAxis);
    
  }
  ngOnInit() {
  }
  ngAfterViewInit() {           // to make sure html DOM finish loading 
    this.DrawEChart();
  }
  getXaxis(): any{
    const newX = { [this.xAxis] : this.data.map( data => data[this.xAxis])};   // extract from every record x-axis value of echart
    return newX;
  }
  getYaxis():any[]{           // extract from every record, series of echart
    const newY = [] ;
    for(let y of this.yAxis){
      const arr =  this.data.map( data => data[y] );
      newY[y] = arr;
    }
    return newY ;
  }
  groupBy():any{

    let newY =[];
    let oldY = this.myData.yAxis;
    for( let i = 0 ; i < this.yAxis.length ; i++ ) {
      if(this.yAxis[i] == this.grouping)
          continue;
      let arr = []
      for(let j = 0 ; j < oldY[this.grouping].length ; j++) {
        let filtered = arr.filter( (record : DataObject) => record.name == oldY[this.grouping][j])
        if(filtered.length){
          filtered[0].value.push(oldY[this.yAxis[i]][j]);
        }
        else {
          let x :DataObject = { name : oldY[this.grouping][j] , value:[ oldY[this.yAxis[i]][j] ] };
          arr.push(x);
        }
        newY[this.yAxis[i]] = (arr);
      }
    }
    return newY;
  }
  setColor(data:any[]){
    let color = ['red','blue','orange','black' ,'purple'];
    let arr :any[] = [];
    for(let i = 0 ; i <data.length ; i++ )
    {
      arr.push({value: data[i] , itemStyle:{ color:color[Math.floor(Math.random()*5)] } });
    }
    console.log(arr);
    return arr;
  }
  DrawEChart(){
    let dom = document.getElementById('main');        // get html element to draw in
    let myData = this.myData;
    const myChart = echarts.init(dom);                 // tell echart what html element you will draw in
    let option = new OptionComponent();                 
    option.tooltip.trigger = 'item';                  // when hover on chart, data appear
    option.xAxis.data = myData.xAxis[this.xAxis];     // assign x-axis to echarts
    for(let y of this.yAxis){
      option.series.push({name: y , type: 'bar' , data: this.setColor(myData.yAxis[y]) }); // push every series with name, echart type and color 
    }
    myChart.setOption(option);        // option contain series [x-axis data ,y-axis data , color , type]
  }
    
}
