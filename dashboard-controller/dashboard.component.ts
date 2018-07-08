import { Component, OnInit, ContentChildren, ViewChildren, QueryList, ViewChild, ChangeDetectorRef, AfterViewInit, ElementRef } from '@angular/core';
import { DxScrollViewComponent } from 'devextreme-angular';
import { DashboardGroup } from '../../models/dashboard/dashboard-group.model';
import { DashboardWidget, FilterEditingObject, DashboardWidgetSaving } from '../../models/dashboard/dashboard-widget.model';
import { Dashboard } from '../../models/dashboard/dashboard.model';
import { Table } from '../../models/dashboard/data-source-schema/table.model';
import { View } from '../../models/dashboard/data-source-schema/view.model';
import { DashboardService } from '../../services/dashboard/dashboard.service';
import { DashboardWidgetService } from '../../services/dashboard/dashboard-widget.service';
import { DataSourceService } from '../../services/dashboard/data-source.service';
import { DashboardWidgetTypeEnum } from '../../models/dashboard/dashboard-widget-type.enum';
import { GridStackItem, GridStackOptions, GridStackItemComponent, GridStackComponent } from 'ng4-gridstack'
import { Query, MeasureOperation, DataTypeEnum, DashboardDataFields, GroupOperation, Delta, Spark, QueryTypeEnum, DimensionField, Chart as chartOperation, ActiveTotal, Customization } from '../../models/dashboard/dashboard-data-fields';
import { Operations } from '../dashboard/dashboard-operations';
import { SharedPopupComponent } from '../shared/shared-popup/shared-popup.component';
import { Column } from '../../models/dashboard/data-source-schema/column.model';
import { ColumnDataType } from '../../models/dashboard/data-source-schema/column-data-type.model'
import * as _ from 'lodash';

import notify from 'devextreme/ui/notify';
import { GetColumnPrameter } from '../../models/dashboard/data-source-schema/get-column-prameter.model';
import { DashboardDataSource } from '../../models/dashboard/data-source-schema/dashboard-data-source.model';
import { DataSourceConnectionComponent } from '../../components/dashboard/data-source-connection/data-source-connection.component';
import { Router, ActivatedRoute } from '@angular/router';
import { AppSettings } from '../../settings/app/app.settings';
import { plainToClass, plainToClassFromExist, classToClass } from "class-transformer";
import { DragulaService } from 'ng2-dragula';
import Chart from 'chart.js';
declare var jQuery: any;
declare var $: any;
@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    host: {
        '(window:resize)': 'CalculateWidgetSizes($event)',
        '(document:click)': 'deSelectWidgets();closeAllSubMenu();',
    }
})
export class DashboardComponent implements OnInit, AfterViewInit {
    @ViewChild('scrollView') scrollView: DxScrollViewComponent;
    @ViewChildren(GridStackItemComponent) items: QueryList<GridStackItemComponent>;
    @ViewChild('gridStackMain') gridStackMain: GridStackComponent;
    ///@ViewChild('PieChart') PieChart: ElementRef;
    dashboardDataSource: DashboardDataSource = new DashboardDataSource();
    area: GridStackOptions = new GridStackOptions();
    public filterObjects: FilterEditingObject[] = new Array<FilterEditingObject>();
    currobj: FilterEditingObject = new FilterEditingObject();
    FilterStack: number[] = new Array<number>();
    StackTop: number = 0;
    methods = new Operations();
    widgets: DashboardWidget[] = [];
    widgetsList: DashboardWidgetSaving[] = [];
    SelectedWidgetID: number = 0;
    private errorMessage: string;
    @ViewChild('newChartPopup') newChartPopup: SharedPopupComponent;
    popup = {
        "name": "",
        "title": "",
        "icon": ""
    };
    widget: DashboardWidget = new DashboardWidget;
    Condations = ["Equal", "Not Equal", "Is Greater Than", "Is Greater Than Or Equal", "Is Less Than", "Is Less Than Or Equal"];
    DashboardWidgetTypeEnum = DashboardWidgetTypeEnum;
    isSelecting = false;
    CurrentComponent = this;
    data: DashboardWidget = new DashboardWidget;
    Olist: number[] = new Array<number>();
    iselect: boolean = false;
    myContext = { $implicit: this.filterObjects };
    showPlus: boolean = false;
    DashboardID: number;
    FiletrCompany: boolean = true;
    showGroup: boolean = false;
    isSettingMenu: boolean = false;
    tables: Table[] = [];
    views: View[] = [];
    st: number = 1;
    modalOptions: any = AppSettings.modal;
    ///////////////
    dashboard: Dashboard = new Dashboard();
    dashboards: Dashboard[] = new Array<Dashboard>();
    selecteddashboards: Dashboard[] = new Array<Dashboard>();
    dashboardgroup: DashboardGroup = new DashboardGroup();
    DashboardColors: Array<string> = new Array<string>();
    ///idx: number = 0;
    Dashboard = {
        Title: "Sales Overview",
        IsDesignMode: true
    };
    get(f: FilterEditingObject) {
        this.myContext.$implicit = f.supList;
        return true;
    }
    changeProb(c: string, f: FilterEditingObject) {
        f.opnet = c;


    }
    inc() {
        this.st++;
        ////console.log(this.st);
    }

    pcik() {
        console.log('Check Usage');
    }

    onSelectionChangedField(e) {

    }
    //createpie() {
    //    let pieCtx = this.PieChart.nativeElement.getContext('2d');

    //    //var DD = {
    //    //    labels: this.labels,
    //    //    datasets: this.data
    //    //};
    //    //debugger;
    //    var data2 = {
    //        labels: [
    //            "Value A",
    //            "Value B"
    //        ],
    //        datasets: [
    //            {
    //                "data": [101342, 55342],   // Example data
    //                "backgroundColor": [
    //                    "#1fc8f8",
    //                    "#76a346"
    //                ]
    //            }]
    //    };

    //    var chart = new Chart(
    //        pieCtx,
    //        {
    //            "type": 'pie',
    //            "data": data2,
    //            "options": {
    //                "cutoutPercentage": 0,
    //                "animation": {
    //                    "animateScale": true,
    //                    "animateRotate": false
    //                }
    //            }
    //        }
    //    );
    //    console.log(chart);
    //   // console.log(DD);
    //    this.cd.detectChanges();

    //}


    //onScroll(e) {
    //    if (e.reachedBottom){
    //        //e.event.stopPropagation();
    //        //e.component._pullDownEnabled = false;
    //        this.scrollView.disabled;
    //    }
    //    if (e.reachedTop){

    //    }
    //    console.log(e.reachedBottom, e.reachedTop, e.scrollOffset.top, e);
        
    //}
    getWidgetList() {
        let id = this.FiletrCompany ? 2 : 1;
        this.dashboardWidgetService.getDashboardWidgetService(id)
            .subscribe(
            value => {
                this.widgetsList = value;
                //notify("Dashboards Getting done!", "success", 600);
            },
            error => {

                this.errorMessage = AppSettings.ParseError(error);

            });
    }
    LoadPreSavedWidget() {
        let id = this.SelectedWidgetID;
        console.log(id);
        let data = this.widgetsList.filter(f => f.PrimayID == id);
        if (data.length > 0) {
            
           
            let jss = JSON.parse(data[0].DataJSON);
            this.loadSelectedwidgetdata(jss);
            //this.getDataSourceData();
        }
        this.SelectedWidgetID = 0;
        

    }
    loadSelectedwidgetdata(w) {
       
      //  debugger;

            if (w)
              
                    // debugger;
                   
                    var W = new DashboardWidget();
                    W.AcceptFilter = w.AcceptFilter;
                    W.Caption = w.Caption;
                    W.ID = 0;
                    W.DisplayID = w.DisplayID;
                    W.PrimaryID = 0;
                    W.MasterFilter = w.MasterFilter;
                    W.FilterString = w.FilterString;
                    W.FilterSelectionType = w.FilterSelectionType;
                    W.ChartSeriseSelectionType = w.ChartSeriseSelectionType;
                    W.isNested = w.isNested;
                    W.Stacked = w.Stacked
                    W.ExpBar = w.ExpBar;
                    W.FilterEditingObject = w.FilterEditingObject || new Array<FilterEditingObject>();
                    W.CenterRange = w.CenterRange || true;
                    if (W.isNested == null) W.isNested = false;
                    if (W.Stacked == null) W.Stacked = false;
                    if (W.ExpBar == null) W.ExpBar = false;
                    ///
                    W.widgetLabels = w.widgetLabels || [];
                    W.table = new Table();
                    W.table.ConName = w.table.ConName;
                    W.table.ConString = w.table.ConString;
                    W.table.Id = W.table.Id;
                    W.table.Name = w.table.Name;
                    W.table.NameSpace = w.table.Namespace;
                    W.table.Schema = w.table.Schema;
                    W.table.TableID = w.table.TableID;
                    W.table.Columns = new Array<Column>();
                    if (w.table.Columns)
                        for (let c of w.table.Columns) {
                            var C = new Column();
                            C.AllowNull = c.AllowNull;
                            C.ColumnFullName = c.ColumnFullName;
                            C.ColumnId = c.ColumnId;
                            C.Id = c.Id;
                            C.IsComputed = c.IsComputed;
                            C.IsForeign = c.IsForeign;
                            C.IsIdentity = c.IsIdentity;
                            C.IsPrimary = c.IsPrimary;
                            C.IsSelected = c.IsSelected;
                            C.Name = c.Name;
                            C.ColumnDataType = new ColumnDataType();
                            C.ColumnDataType.CSharpType = c.ColumnDataType.CSharpType;
                            C.ColumnDataType.DotNetType = c.ColumnDataType.DotNetType;
                            C.ColumnDataType.JavaType = c.ColumnDataType.JavaType;
                            C.ColumnDataType.LanguageSpecificType = c.ColumnDataType.LanguageSpecificType;
                            C.ColumnDataType.SQLType = c.ColumnDataType.SQLType;
                            C.ColumnDataType.VBType = c.ColumnDataType.VBType;
                            W.table.Columns.push(C);
                        }
                    //
                    ///
                    W.view = new View();
                    W.view.ConName = w.view.ConName;
                    W.view.ConString = w.view.ConString;
                    W.view.Id = W.view.Id;
                    W.view.Name = w.view.Name;
                    W.view.NameSpace = w.view.Namespace;
                    W.view.Schema = w.view.Schema;
                    W.view.ViewID = w.view.TableID;
                    W.view.Columns = new Array<Column>();
                    if (w.view.Columns)
                        for (let c of w.view.Columns) {
                            var C = new Column();
                            C.AllowNull = c.AllowNull;
                            C.ColumnFullName = c.ColumnFullName;
                            C.ColumnId = c.ColumnId;
                            C.Id = c.Id;
                            C.IsComputed = c.IsComputed;
                            C.IsForeign = c.IsForeign;
                            C.IsIdentity = c.IsIdentity;
                            C.IsPrimary = c.IsPrimary;
                            C.IsSelected = c.IsSelected;
                            C.Name = c.Name;
                            C.ColumnDataType = new ColumnDataType();
                            C.ColumnDataType.CSharpType = c.ColumnDataType.CSharpType;
                            C.ColumnDataType.DotNetType = c.ColumnDataType.DotNetType;
                            C.ColumnDataType.JavaType = c.ColumnDataType.JavaType;
                            C.ColumnDataType.LanguageSpecificType = c.ColumnDataType.LanguageSpecificType;
                            C.ColumnDataType.SQLType = c.ColumnDataType.SQLType;
                            C.ColumnDataType.VBType = c.ColumnDataType.VBType;
                            W.view.Columns.push(C);
                        }
                    //
                    //
                   // debugger;
                    W.isTable = w.isTable;

                    if (w.Operations && w.Operations[0].QueryType) {
                        //    debugger;
                        W.Operations = w.Operations;
                       
                        for (let i of W.Operations) {
                            if (i.Customization instanceof Array)
                                i.Customization = new Customization();
                            else 
                                i.Customization = Object.assign(new Customization(), i.Customization);
                            switch (i.QueryType) {
                                case QueryTypeEnum.Measure:
                                    {

                                        i.Operation = Object.assign(new MeasureOperation(null, null), i.Operation)
                                        break;
                                    }
                                case QueryTypeEnum.Delta:
                                    {


                                        i.Operation = Object.assign(new Delta(null, null, null, null), i.Operation)
                                        i.Operation.ActualField = Object.assign(new MeasureOperation(null, null), i.Operation.ActualField)
                                        i.Operation.TargetField = Object.assign(new MeasureOperation(null, null), i.Operation.TargetField)
                                        break;
                                    }
                                case QueryTypeEnum.ActiveTotal:
                                    {


                                        i.Operation = Object.assign(new ActiveTotal(null, null, null), i.Operation)
                                        i.Operation.ActualField = Object.assign(new MeasureOperation(null, null), i.Operation.ActualField)
                                        i.Operation.TargetField = Object.assign(new MeasureOperation(null, null), i.Operation.TargetField)
                                        break;
                                    }
                                case QueryTypeEnum.Spark:
                                    {


                                        i.Operation = Object.assign(new Spark(null, null, null, null), i.Operation)
                                        i.Operation.ActualField = Object.assign(new MeasureOperation(null, null), i.Operation.ActualField)
                                        i.Operation.ArgumentField = Object.assign(new MeasureOperation(null, null), i.Operation.ArgumentField)
                                        break;
                                    }
                                case QueryTypeEnum.Group:
                                    {
                                        i.Operation = Object.assign(new GroupOperation(null, null), i.Operation)

                                        break;
                                    }
                                case QueryTypeEnum.Serise:
                                    {
                                        i.Operation = Object.assign(new GroupOperation(null, null), i.Operation)

                                        break;
                                    }
                                case QueryTypeEnum.Chart:
                                    {
                                        i.Operation = Object.assign(new chartOperation("", null, null), i.Operation);
                                        i.Operation.CompareDate = Object.assign(new GroupOperation(null, null), i.Operation.CompareDate);
                                        i.Operation.CompareToDate = Object.assign(new GroupOperation(null, null), i.Operation.CompareToDate);
                                        break;
                                    }
                                case QueryTypeEnum.BarChart:
                                    {

                                        i.Operation = Object.assign(new MeasureOperation(null, null), i.Operation)
                                        break;
                                    }
                                    



                            }
                        }

                    }

                    ///
                    W.DataOperations = new Array<DashboardDataFields>();
                    if (w.DataOperations)
                        for (let d of w.DataOperations) {
                            var D = new DashboardDataFields();
                            D.Caption = d.Caption;
                            D.DataType = d.DataType;
                            D.DeltaActualOperationType = d.DeltaActualOperationType;
                            D.DeltaGroupsTypeValue = d.DeltaGroupsTypeValue;
                            D.DeltaTargetDataField = d.DeltaTargetDataField;
                            D.DeltaTargetOperationType = d.DeltaTargetOperationType;
                            D.DisplayName = d.DisplayName;
                            D.Expression = d.Expression;
                            D.FieldName = d.FieldName;
                            D.GroupedDateType = d.GroupedDateType;
                            D.MeasureType = d.MeasureType;
                            D.OperationType = d.OperationType;
                            D.SparkDateFieldName = d.SparkDateFieldName;
                            D.SparkDateType = d.SparkDateType;
                            W.DataOperations.push(D);
                        }
                    ////
                    W.IsSelected = w.IsSelected;
                    W.Item = new GridStackItem();
                  
                    //W.Item.customId = w.Item.customId;
                   
                    W.Item.height = 6;
                   
                    W.Item.width = 4;
                    W.Item.x = 0;
                    W.Item.y = 0;

                    W.WidgetType = w.WidgetType;


                    this.widgets.push(W);



                    //  this.gridStackMain.makeWidget(item);


                

            //  debugger;
            // this.widgets  = JSON.parse(this.dashboard.DataJSON);
            


            var index = this.widgets.length - 1;
            let ww = this.widgets[index];
           

                if (ww.isTable) {

                    for (let ds of this.dashboardDataSource.SelectedConnection) {
                        for (let table of ds.SelectedTables) {
                            if (ww.table.Name == table.Name) {
                                ww.table.Data = table.Data;
                                ww.DatasourceInit = table.Data;
                                //w.CurrentData = value;
                                ww.OrginalDatasource = table.Data;
                                ww.Datasource = table.Data;
                                if (ww.FilterString && ww.FilterString.length > 0)
                                    this.methods.ApplyFilters(ww, true);
                                this.methods.BuildWidget(ww);
                            }
                        }
                    }

                }
                else {
                    for (let ds of this.dashboardDataSource.SelectedConnection) {
                        for (let view of ds.SelectedViews) {
                            if (ww.view.Name == view.Name) {
                                ww.table.Data = view.Data;
                                ww.DatasourceInit = view.Data;
                                //w.CurrentData = value;
                                ww.OrginalDatasource = view.Data;
                                ww.Datasource = view.Data;
                                if (ww.FilterString && ww.FilterString.length > 0)
                                    this.methods.ApplyFilters(ww, true);
                                this.methods.BuildWidget(ww);
                            }
                        }
                    }
                }

             
               
                var arr = this.items.toArray();
                var item = arr[this.items.length - 1];
                item.option.autoPosition = false;
                item.option.customId = "10";
                item.option.height = 5;
                item.option.width = 4;
                item.option.x = arr[this.items.length - 2].option.x + 10;
                item.option.y = arr[this.items.length - 2].option.y + 10;
                debugger;
                this.gridStackMain.AddWidget(item);
               // this.gridStackMain.AddWidget(item);
               

            
        
    }
    selectText(e) {
        // console.log(e);
        $(e.element).find('input.dx-texteditor-input').first().select();
    }
    
    saveDashboard() {
      console.log(this.widgets);
      debugger;
        //for (let wdgt of this.widgets) {
        // //  debugger
        //    if (wdgt.PrimaryID == undefined || wdgt.PrimaryID == null) wdgt.PrimaryID = 0;
        //    let temp = _.cloneDeep(wdgt);
        //    temp.CurrentData = null;
        //    temp.Datasource = null;
        //    temp.DatasourceInit = null;
        //    temp.OrginalDatasource = null;
        //    temp.table.Data = null;
        //    temp.view.Data = null;
        //    temp.DataSourceChanged();
        //    temp.chart = null;
        //    temp.ColorschemaList = null;
        //    temp.ColorContext = null;
        //    temp.colorPlatte = [];
        //    for (let inx in wdgt.colorPlatte) {
        //        temp.colorPlatte.push({ 'name': inx, 'value': wdgt.colorPlatte[inx] });
        //    }
           
        //    let WdgtJSON = JSON.stringify(temp);
        //  //  console.log(WdgtJSON);
        //    let SavingWidget: DashboardWidgetSaving = {
        //        DataJSON: WdgtJSON,
        //        PrimayID: wdgt.PrimaryID,
        //        Name: wdgt.Caption,
        //        CompanyBranchID: AppSettings.CompanyBranchId,
        //        CompanyID: AppSettings.CompanyId
                
                
        //    }
        //    this.dashboardWidgetService.saveDashboardWidgetService(SavingWidget)
        //        .subscribe(
        //        value => {
        //            if (wdgt.PrimaryID == 0) wdgt.PrimaryID = value.PrimaryID;
        //            //notify("Dashboards Getting done!", "success", 600);
        //        },
        //        error => {
                   
        //            this.errorMessage = AppSettings.ParseError(error);
                    
        //        });

        //}
      
      var wdg: DashboardWidget[] = _.cloneDeep(this.widgets);
      //for (let wl of this.widgets) {
      //  var wli = classToClass(wl);
      //  wdg.push(wli);
      //}
      var wdgCount = 0;
        for (let w of wdg) {
            w.CurrentData = null;
            w.Datasource = null;
            w.DatasourceInit = null;
            w.OrginalDatasource = null;
            w.table.Data = null;
            w.view.Data = null;
            w.charts = null;
            //w.colorPlatte = _.cloneDeep(this.widgets[wdgCount].colorPlatte);
            //w.ColorschemaList = null;
            w.DataSourceChanged();
            wdgCount++;
        }
        /////console.log(wdg);
        var dts: DashboardDataSource = _.cloneDeep(this.dashboardDataSource);
        if (dts != null) {
            for (let conn of dts.SelectedConnection) {
                for (let table of conn.SelectedTables) {
                    table.Data = null;
                }

                for (let view of conn.SelectedViews) {
                    view.Data = null;
                }
            }
        }
        let colors = [];
        for (let name in this.DashboardColors) {
            colors.push({ "name": name, "value": this.DashboardColors[name] });
        }
        
        var objDashboard = {
            Widgets: wdg,
            DataSource: dts,
            colorsPlatte: colors
        }
        //console.log('saving dashboard...');
        console.log(objDashboard);
        this.dashboard.DataJSON = JSON.stringify(objDashboard);
        //console.log(this.dashboard.DataJSON.length);
        this.dashboardservice.saveDashboardService(this.dashboard)
            .subscribe(
            value => {
                notify("Dashboard Saved!", "success", 600);
            },
            error => {
                notify("saving Failed!", "error", 600);
                 this.errorMessage = AppSettings.ParseError(error);
            });


    }
    SaveTableviewtowidget() {
        ////console.log(this.dashboardDataSource);
        this.widget.DataSourceChanged();
        if (this.tables.length > 0) {
            this.widget.table = this.tables[0];
            this.widget.isTable = true;
            let e = new GetColumnPrameter();

            e.Connection = this.widget.table.ConName;
            e.Id = this.widget.table.Id;
            e.Name = this.widget.table.Name;
            e.ObjectID = this.widget.table.TableID;
            e.Schema = this.widget.table.Schema;

            this.dataSourceService.getAllTableColumns(e)
                .subscribe(
                value => {
                    this.widget.table.Columns = value;
                },
                error => this.errorMessage = <any>error);

            let ee = new GetColumnPrameter();
            ee.Id = this.widget.table.Id
            ee.Name = this.widget.table.Name;
            ee.ObjectID = this.widget.table.TableID;
            ee.Schema = this.widget.table.Schema;
            ee.Connection = this.widget.table.ConString;

            this.dataSourceService.getAllTableData(ee)
                .subscribe(
                value => {
                    this.widget.table.Data = value;
                    this.widget.DatasourceInit = value;
                    // this.widget.CurrentData = value;
                    this.widget.OrginalDatasource = value;
                    this.widget.Datasource = value;
                },
                error => this.errorMessage = <any>error);
        }
        else if (this.views.length > 0) {
            this.widget.view = this.views[0];
            this.widget.isTable = false;
            let e = new GetColumnPrameter();
            e.Connection = this.widget.view.ConName;
            e.Id = this.widget.view.Id;
            e.Name = this.widget.view.Name;
            e.ObjectID = this.widget.view.ViewID;
            e.Schema = this.widget.view.Schema;

            this.dataSourceService.getAllViewColumns(e)
                .subscribe(
                value => {
                    this.widget.view.Columns = value;
                },
                error => this.errorMessage = <any>error);

            let ee = new GetColumnPrameter();
            ee.Id = this.widget.view.Id
            ee.Name = this.widget.view.Name;
            ee.ObjectID = this.widget.view.ViewID;
            ee.Schema = this.widget.view.Schema;
            ee.Connection = this.widget.view.ConString;

            this.dataSourceService.getAllTableData(ee)
                .subscribe(
                value => {

                    this.widget.view.Data = value;
                    this.widget.DatasourceInit = value;
                    // this.widget.CurrentData = value;
                    this.widget.OrginalDatasource = value;
                    this.widget.Datasource = value;
                },
                error => this.errorMessage = <any>error);

        }

    }
    getwidgetdata(wdgs) {
        
        if (this.dashboard) {
            this.widgets.length = 0;
            
            if (wdgs)
                for (let w of wdgs) {
                  let userWidget = plainToClass(DashboardWidget, w);
                  var entityWidget = new DashboardWidget(); 
                  var W = plainToClassFromExist(entityWidget, w as Object)
                  //var W = new DashboardWidget();
                  //if (userWidget.length > 0) {
                  //  W = userWidget[0];
                  //}
                   //debugger;
                   //var tempWidgets: any[] = [];
                   //tempWidgets[0] = userWidget;
                   //if (W == null)
                    {
                     //var W = tempWidgets[0];//new DashboardWidget();
                      W.AcceptFilter = w.AcceptFilter;
                      if (w.Caption[0] == 'O') console.log(w);
                      W.Caption = w.Caption;
                      W.ID = w.ID;
                      W.DisplayID = w.DisplayID;
                      W.PrimaryID = w.PrimaryID;
                      W.MasterFilter = w.MasterFilter;
                      W.FilterString = w.FilterString;
                      W.FilterSelectionType = w.FilterSelectionType;
                      W.ChartSeriseSelectionType = w.ChartSeriseSelectionType;
                      W.isNested = w.isNested;
                      W.Stacked = w.Stacked
                      W.ExpBar = w.ExpBar
                      W.FilterEditingObject = w.FilterEditingObject || new Array<FilterEditingObject>();
                      W.CenterRange = w.CenterRange || true;
                      W.widgetLabels = w.widgetLabels||[];
                      W.AutoColoredMeasure = W.AutoColoredMeasure || false;
                      if (W.isNested == null) W.isNested = false;
                      if (W.ExpBar == null) W.ExpBar = false;
                      if (W.Stacked == null) W.Stacked = false;
                      ///
                      W.colorPlatte = this.DashboardColors || [];

                      W.table = new Table();
                      W.table.ConName = w.table.ConName;
                      W.table.ConString = w.table.ConString;
                      W.table.Id = W.table.Id;
                      W.table.Name = w.table.Name;
                      W.table.NameSpace = w.table.Namespace;
                      W.table.Schema = w.table.Schema;
                      W.table.TableID = w.table.TableID;
                      W.table.Columns = new Array<Column>();
                      if (w.table.Columns)
                        for (let c of w.table.Columns) {
                          var C = new Column();
                          C.AllowNull = c.AllowNull;
                          C.ColumnFullName = c.ColumnFullName;
                          C.ColumnId = c.ColumnId;
                          C.Id = c.Id;
                          C.IsComputed = c.IsComputed;
                          C.IsForeign = c.IsForeign;
                          C.IsIdentity = c.IsIdentity;
                          C.IsPrimary = c.IsPrimary;
                          C.IsSelected = c.IsSelected;
                          C.Name = c.Name;
                          C.ColumnDataType = new ColumnDataType();
                          C.ColumnDataType.CSharpType = c.ColumnDataType.CSharpType;
                          C.ColumnDataType.DotNetType = c.ColumnDataType.DotNetType;
                          C.ColumnDataType.JavaType = c.ColumnDataType.JavaType;
                          C.ColumnDataType.LanguageSpecificType = c.ColumnDataType.LanguageSpecificType;
                          C.ColumnDataType.SQLType = c.ColumnDataType.SQLType;
                          C.ColumnDataType.VBType = c.ColumnDataType.VBType;
                          W.table.Columns.push(C);
                        }
                      //
                      ///
                      W.view = new View();
                      W.view.ConName = w.view.ConName;
                      W.view.ConString = w.view.ConString;
                      W.view.Id = W.view.Id;
                      W.view.Name = w.view.Name;
                      W.view.NameSpace = w.view.Namespace;
                      W.view.Schema = w.view.Schema;
                      W.view.ViewID = w.view.TableID;
                      W.view.Columns = new Array<Column>();
                      if (w.view.Columns)
                        for (let c of w.view.Columns) {
                          var C = new Column();
                          C.AllowNull = c.AllowNull;
                          C.ColumnFullName = c.ColumnFullName;
                          C.ColumnId = c.ColumnId;
                          C.Id = c.Id;
                          C.IsComputed = c.IsComputed;
                          C.IsForeign = c.IsForeign;
                          C.IsIdentity = c.IsIdentity;
                          C.IsPrimary = c.IsPrimary;
                          C.IsSelected = c.IsSelected;
                          C.Name = c.Name;
                          C.ColumnDataType = new ColumnDataType();
                          C.ColumnDataType.CSharpType = c.ColumnDataType.CSharpType;
                          C.ColumnDataType.DotNetType = c.ColumnDataType.DotNetType;
                          C.ColumnDataType.JavaType = c.ColumnDataType.JavaType;
                          C.ColumnDataType.LanguageSpecificType = c.ColumnDataType.LanguageSpecificType;
                          C.ColumnDataType.SQLType = c.ColumnDataType.SQLType;
                          C.ColumnDataType.VBType = c.ColumnDataType.VBType;
                          W.view.Columns.push(C);
                        }
                    //
                    //
                    W.isTable = w.isTable;
                    //  debugger;
                       if (w.Operations && w.Operations.length && w.Operations[0].QueryType) {
                 
                        W.Operations = w.Operations;
                      
                        for (let i of W.Operations)
                        {
                            if (i.Customization instanceof Array)
                                i.Customization = new Customization();
                            else
                                i.Customization = Object.assign(new Customization(), i.Customization);
                            switch (i.QueryType) {
                                case QueryTypeEnum.Measure:
                                    {
                                   
                                        i.Operation = Object.assign(new MeasureOperation(null, null), i.Operation )
                                        break;
                                    }
                                case QueryTypeEnum.Delta:
                                    {
                                        
                                      
                                        i.Operation = Object.assign(new Delta(null, null, null, null), i.Operation)
                                        i.Operation.ActualField = Object.assign(new MeasureOperation(null,null) , i.Operation.ActualField )  
                                        i.Operation.TargetField = Object.assign(new MeasureOperation(null, null), i.Operation.TargetField) 
                                        break;
                                    }
                                case QueryTypeEnum.ActiveTotal:
                                    {


                                        i.Operation = Object.assign(new ActiveTotal(null, null, null), i.Operation)
                                        i.Operation.ActualField = Object.assign(new MeasureOperation(null, null), i.Operation.ActualField)
                                        i.Operation.TargetField = Object.assign(new MeasureOperation(null, null), i.Operation.TargetField)
                                        break;
                                    }
                                case QueryTypeEnum.Spark:
                                    {
                            

                                i.Operation = Object.assign(new Spark(null, null, null, null), i.Operation)
                                i.Operation.ActualField = Object.assign(new MeasureOperation(null, null), i.Operation.ActualField)
                                i.Operation.ArgumentField = Object.assign(new MeasureOperation(null, null), i.Operation.ArgumentField)
                                break;
                              }
                            case QueryTypeEnum.Group:
                              {
                                i.Operation = Object.assign(new GroupOperation(null, null), i.Operation)

                                break;
                              }
                            case QueryTypeEnum.Serise:
                              {
                                i.Operation = Object.assign(new GroupOperation(null, null), i.Operation)

                                break;
                              }
                            case QueryTypeEnum.Chart:
                              {
                                i.Operation = Object.assign(new chartOperation("", null, null), i.Operation);
                                i.Operation.CompareDate = Object.assign(new GroupOperation(null, null), i.Operation.CompareDate);
                                i.Operation.CompareToDate = Object.assign(new GroupOperation(null, null), i.Operation.CompareToDate);
                                break;
                              }
                            case QueryTypeEnum.BarChart:
                              {

                                i.Operation = Object.assign(new MeasureOperation(null, null), i.Operation)
                                break;
                              }

                          }
                        }

                      }

                      ///
                      W.DataOperations = new Array<DashboardDataFields>();
                      if (w.DataOperations)
                        for (let d of w.DataOperations) {
                          var D = new DashboardDataFields();
                          D.Caption = d.Caption;
                          D.DataType = d.DataType;
                          D.DeltaActualOperationType = d.DeltaActualOperationType;
                          D.DeltaGroupsTypeValue = d.DeltaGroupsTypeValue;
                          D.DeltaTargetDataField = d.DeltaTargetDataField;
                          D.DeltaTargetOperationType = d.DeltaTargetOperationType;
                          D.DisplayName = d.DisplayName;
                          D.Expression = d.Expression;
                          D.FieldName = d.FieldName;
                          D.GroupedDateType = d.GroupedDateType;
                          D.MeasureType = d.MeasureType;
                          D.OperationType = d.OperationType;
                          D.SparkDateFieldName = d.SparkDateFieldName;
                          D.SparkDateType = d.SparkDateType;
                          W.DataOperations.push(D);
                        }
                      ////
                      W.IsSelected = w.IsSelected;
                      W.Item = new GridStackItem();
                      W.Item.autoPosition = w.Item.autoPosition;
                      W.Item.customId = w.Item.customId;
                      W.Item.el = w.Item.el;
                      W.Item.height = w.Item.height;
                      W.Item.locked = w.Item.locked;
                      W.Item.marginWidth = w.Item.marginWidth;
                      W.Item.maxHeight = w.Item.maxHeight;
                      W.Item.maxWidth = w.Item.maxWidth;
                      W.Item.minHeight = w.Item.minHeight;
                      W.Item.minWidth = w.Item.minWidth;
                      W.Item.noMove = w.Item.noMove;
                      W.Item.noResize = w.Item.noResize;
                      W.Item.width = w.Item.width;
                      W.Item.x = w.Item.x;
                      W.Item.y = w.Item.y;

                      W.WidgetType = w.WidgetType;
                      //  debugger;
                      W.selectedSerise = new Array<DimensionField>();
                      if (w.selectedSerise) {
                        for (let field of w.selectedSerise) {
                          let temp = new DimensionField(field.name, field.type, field.value, field.AutoColored);
                          W.selectedSerise.push(temp)
                        }
                      }
                      if (w.selectedArgument) {
                        W.selectedArgument = new Array<DimensionField>();
                        for (let field of w.selectedArgument) {
                          let temp = new DimensionField(field.name, field.type, field.value, field.AutoColored);
                          W.selectedArgument.push(temp)
                        }
                      }
                   }
              
                    this.reSortLabels(W);
                   //this.widgets.concat(tempWidgets);
                   this.widgets.push(W);
                 

                  
                  //  this.gridStackMain.makeWidget(item);


                }

          //  debugger;
            // this.widgets  = JSON.parse(this.dashboard.DataJSON);
            let gridstack_width = $('#gridStackMain').width;
            
            gridstack_width /= 12;
            for (let Twidget of this.widgets)
                Twidget.GridStackMainWidth = gridstack_width;
            
            this.cd.detectChanges();
            var index = 0;
            for (let w of this.widgets) {

                if (w.isTable) {
                    
                    for (let ds of this.dashboardDataSource.SelectedConnection) {
                        for (let table of ds.SelectedTables) {
                            if (w.table.Id == table.Id) {
                                w.table.Data = table.Data;
                                w.DatasourceInit = table.Data;
                                //w.CurrentData = value;
                                w.OrginalDatasource = table.Data;
                                w.Datasource = table.Data;
                                if (w.FilterString && w.FilterString.length > 0)
                                    this.methods.ApplyFilters(w, true);
                                
                                
                                this.methods.BuildWidget(w);
                            }
                        }
                    }

                }
                else {
                    for (let ds of this.dashboardDataSource.SelectedConnection) {
                        for (let view of ds.SelectedViews) {
                            if (w.table.Id == view.Id) {
                                w.table.Data = view.Data;
                                w.DatasourceInit = view.Data;
                                //w.CurrentData = value;
                                w.OrginalDatasource = view.Data;
                                w.Datasource = view.Data;
                                if (w.FilterString && w.FilterString.length > 0)
                                    this.methods.ApplyFilters(w, true);
                                this.methods.BuildWidget(w);
                            }
                        }
                    }
                }

               // debugger;
                var arr = this.items.toArray();
                var item = arr[index];
                if (!item.option.customId) item.option.customId = w.ID.toString(); 
                this.gridStackMain.AddWidget(item);
                index++;
                //this.gridStackMain.updateWidget(item);
                
            }
        }
    }
    reSortLabels(widget: DashboardWidget) {

      //  debugger;
      let labels = [];
      let temp = _.cloneDeep(widget.widgetLabels)|| [];
      temp = temp.sort(function (a, b) {
        return a.priority - b.priority;
      });
      widget.widgetLabels = temp;


    }
    loadwidgetdata() {
        if (this.dashboard) {
            this.cd.detectChanges();
            for (let w of this.widgets) {
                
                if (w.isTable) {

                    for (let ds of this.dashboardDataSource.SelectedConnection) {
                        for (let table of ds.SelectedTables) {
                            if (w.table.Schema == table.Schema && w.table.Name == table.Name) {
                                
                                w.table.Data = _.cloneDeep(table.Data);
                                w.DatasourceInit = table.Data;
                                //w.CurrentData = value;
                                w.OrginalDatasource = table.Data;
                                w.Datasource = table.Data;
                                if (w.FilterString && w.FilterString.length > 0)
                                    this.methods.ApplyFilters(w, true);
                                this.methods.BuildWidget(w);
                            }
                        }
                    }

                }
                else {
                    for (let ds of this.dashboardDataSource.SelectedConnection) {
                        for (let view of ds.SelectedViews) {
                            if (w.view.Schema == view.Schema && w.view.Name == view.Name) {
                                
                                w.view.Data = view.Data;
                                w.DatasourceInit = view.Data;
                                //w.CurrentData = value;
                                w.OrginalDatasource = view.Data;
                                w.Datasource = view.Data;
                                if (w.FilterString && w.FilterString.length > 0)
                                    this.methods.ApplyFilters(w, true);
                                this.methods.BuildWidget(w);
                            }
                        }
                    }
                }
                
            }
        }
    }
    getDashboard(ID: number) {
        this.dashboardservice.getDashboardByIdService(ID)
            .subscribe(
            value => {
                //debugger
                var objWdgs = JSON.parse(value.DataJSON);
                this.DashboardColors = [];
                if (objWdgs && objWdgs.colorsPlatte) {
                    for (let r of objWdgs.colorsPlatte) {
                        this.DashboardColors[r.name] = r.value;
                    }
                }
                
                   
               
                if (objWdgs.Widgets == undefined) {
                    this.dashboard = value;
                    this.getwidgetdata(objWdgs);
                    this.getDataSourceData();
                }
                else {
                    
                    this.dashboard = value;
                    
                    this.dashboardDataSource = _.cloneDeep(objWdgs.DataSource);
                    var wdgs = _.cloneDeep(objWdgs.Widgets);
                    this.getwidgetdata(wdgs);
                    this.getDataSourceData();
                }
                this.cd.detectChanges();
                //if (objWdgs.Widgets != undefined) {
                    
                //}
                
               // notify("Dashboard Loaded!", "success", 600);
            },
            error => {
                notify("getting Failed!", "error", 600);
                 this.errorMessage = AppSettings.ParseError(error);
            });
        
    }

    changeDataSourceFilter(e) {
        if (e.value != undefined && e.previousValue != undefined && e.value != e.previousValue) {
            this.getDataSourceData();
            this.getWidgetList();

        }
    }
    performAction(total, current) {
        
        if (total == current) {
            this.loadwidgetdata();
        }
    }

    getDataSourceData() {
        var that = this;
        for (let w of this.dashboardDataSource.SelectedConnection) {
            var counter = 0;
            var totalCount = w.SelectedTables.length + w.SelectedViews.length;
            for (let table of w.SelectedTables) {
                
                let ee = new GetColumnPrameter();
                ee.Id = table.Id
                ee.Name = table.Name;
                ee.ObjectID = table.TableID;
                ee.Schema = table.Schema;
                ee.Connection = table.ConString;
                ee.FilterByCompany = this.FiletrCompany;
                this.dataSourceService.getAllTableData(ee)
                    .subscribe(
                    value => {
                        
                        table.Data = value;
                        //console.log('table length');
                        //console.log(table.Data.length);
                        counter++;
                        that.performAction(totalCount, counter);
                    },
                    error => this.errorMessage = <any>error);
            }
            for (let view of w.SelectedViews) {
                let ee = new GetColumnPrameter();
                ee.Id = view.Id
                ee.Name = view.Name;
                ee.ObjectID = view.ViewID;
                ee.Schema = view.Schema;
                ee.Connection = view.ConString;
                ee.FilterByCompany = this.FiletrCompany;
                this.dataSourceService.getAllTableData(ee)
                    .subscribe(
                    value => {
                        // debugger;
                        view.Data = value;
                        //console.log('view length');
                        //console.log(view.Data.length);
                        counter++;
                        that.performAction(totalCount, counter);
                    },
                    error => this.errorMessage = <any>error);
            }
        }
        
    }

    getDashboards() {
        this.dashboardservice.getDashboardService()
            .subscribe(
            value => {
                this.dashboards = value;
                    this.dashboard = new Dashboard();
                
                //notify("Dashboards Getting done!", "success", 600);
            },
            error => {
                notify("getting Failed!", "error", 600);
                 this.errorMessage = AppSettings.ParseError(error);
            });
       

    }




    DashboardGroups = [
        {
            ID: 1,
            DisplayID: 'Dis1',
            GroupOrder: 1,
            Row: 1,
            Widgets: [
                {
                    ID: 1,
                    DisplayID: 'Wid1',
                    Caption: 'Sales by State',
                    Parameters: '',
                    WidgetOrder: 1,
                    Width: 100
                },

                {
                    ID: 2,
                    DisplayID: 'Wid2',
                    Caption: 'Sales by Product Category',
                    Parameters: '',
                    WidgetOrder: 2,
                    Width: 100
                },

                {
                    ID: 3,
                    DisplayID: 'Wid3',
                    Caption: 'Sales vs Target',
                    Parameters: '',
                    WidgetOrder: 3,
                    Width: 100
                }
            ]
        }
    ];

    private Settings = {
        TitleVisible: true
    };
    clone() {
        this.widget.Datasource = _.cloneDeep(this.widget.OrginalDatasource);
    }
    constructor(private cd: ChangeDetectorRef, private dashboardservice: DashboardService,
      private dataSourceService: DataSourceService, private route: ActivatedRoute, private dashboardWidgetService: DashboardWidgetService, private dragulaService: DragulaService) {
        this.area.float = false;
        this.area.handleClass = "widget-header";
        this.area.cellHeight = '60px';
        
    }
    AddWidget(widgetType) {
        return this.AddWidgetInit(widgetType, null, null);
    }
    AddWidgetInit(widgetType, DataSource: any[], Queries: Query[], MasterFilter: boolean = false) {
        var widget = new DashboardWidget();


        widget.Caption = 'Title ' + (this.widgets.length + 1);
        if (this.widgets.length == 0) {
            widget.ID = 1;
            widget.DisplayID = 'widget-' + 1;
        }
        else {
            widget.ID = this.widgets[this.widgets.length - 1].ID + 1;
            if (!widget.Item) widget.Item = new GridStackItem();
            widget.Item.customId = widget.ID.toString();
            widget.DisplayID = 'widget-' + widget.ID;
        }
        if (DataSource == null) {
            //widget.Datasource = this.DefaultDataSource;
            //widget.OrginalDatasource = this.DefaultDataSource;
            //widget.DatasourceInit = this.DefaultDataSource;
        }
        else {
            widget.Datasource = DataSource;
            widget.OrginalDatasource = DataSource;
            widget.DatasourceInit = DataSource;
        }
        widget.MasterFilter = MasterFilter;
        widget.Operations = Queries;
        widget.IsSelected = false;
        widget.WidgetType = widgetType;
        widget.Item = new GridStackItem();
        widget.Item.width = 6;
        widget.Item.height = 4;
        widget.Item.x = 0;
        widget.Item.y = 0;


        var arr = this.items.toArray();
        

        this.widgets.push(widget);
        this.cd.detectChanges();

        var arr = this.items.toArray();
        var item = arr[this.items.length - 1];
        this.gridStackMain.AddWidget(item);
        //debugger;
        if (this.dashboardDataSource && this.dashboardDataSource.SelectedConnection.length > 0 && this.dashboardDataSource.SelectedConnection[0].SelectedTables.length > 0) {
            widget.table = this.dashboardDataSource.SelectedConnection[0].SelectedTables[0];
            widget.isTable = true;
            let e = new GetColumnPrameter();

            e.Connection = widget.table.ConName;
            e.Id = widget.table.Id;
            e.Name = widget.table.Name;
            e.ObjectID = widget.table.TableID;
            e.Schema = widget.table.Schema;

            this.dataSourceService.getAllTableColumns(e)
                .subscribe(
                value => {
                    widget.table.Columns = value;
                },
                error => this.errorMessage = <any>error);

            let ee = new GetColumnPrameter();
            ee.Id = widget.table.Id
            ee.Name = widget.table.Name;
            ee.ObjectID = widget.table.TableID;
            ee.Schema = widget.table.Schema;
            ee.Connection = widget.table.ConString;

            this.dataSourceService.getAllTableData(ee)
                .subscribe(
                value => {
                    widget.table.Data = value;
                    widget.DatasourceInit = value;
                    // widget.CurrentData = value;
                    widget.OrginalDatasource = value;
                    widget.Datasource = value;
                },
                error => this.errorMessage = <any>error);
        }
        else if (this.dashboardDataSource && this.dashboardDataSource.SelectedConnection.length > 0 && this.dashboardDataSource.SelectedConnection[0].SelectedViews.length > 0) {
            widget.view = this.dashboardDataSource.SelectedConnection[0].SelectedViews[0];
            widget.isTable = false;
            let e = new GetColumnPrameter();
            e.Connection = widget.view.ConName;
            e.Id = widget.view.Id;
            e.Name = widget.view.Name;
            e.ObjectID = widget.view.ViewID;
            e.Schema = widget.view.Schema;

            this.dataSourceService.getAllViewColumns(e)
                .subscribe(
                value => {
                    widget.view.Columns = value;
                },
                error => this.errorMessage = <any>error);

            let ee = new GetColumnPrameter();
            ee.Id = widget.view.Id
            ee.Name = widget.view.Name;
            ee.ObjectID = widget.view.ViewID;
            ee.Schema = widget.view.Schema;
            ee.Connection = widget.view.ConString;

            this.dataSourceService.getAllTableData(ee)
                .subscribe(
                value => {

                    widget.view.Data = value;
                    widget.DatasourceInit = value;
                    // widget.CurrentData = value;
                    widget.OrginalDatasource = value;
                    widget.Datasource = value;
                },
                error => this.errorMessage = <any>error);

        }
      
        return widget;
    }
    addnewFilterObject(type: boolean, parent: FilterEditingObject) {
        // debugger;
        var f = new FilterEditingObject;
        f.isoper = type;
        if (type) f.opnet = "AND";
        if (!type) {
            f.condation = "Condation"
            f.opnet = "property"

        }
        f.parentObject = parent;
        f.root = false;
        //  f.parentID = this.filterObjects[parentidx].ID;
        //var mx = 0;
        //for (let i of this.filterObjects)
        //    if (i.ID > mx) mx = i.ID;
        //f.ID = mx + 1;
        parent.supList.push(f);
        // //console.log(this.filterObjects);
        //this.resetStack();
        //filterObjects
        //(<any>$(".dropdown-trigger")).dropdown('toggle');
    }
    closeAllSubMenu() {
        if (!this.isSettingMenu) {
            for (var i = 0; i < this.filterObjects.length; i++) {
                var menuItem = this.filterObjects[i];
                menuItem.showGroup = false;
                menuItem.showPlus = false;
                this.closeAllSubMenuItems(menuItem);
            }
        }
        else {
            this.isSettingMenu = false;

        }


    }

    closeAllSubMenuItems(f) {
        for (var i = 0; i < f.length; i++) {
            var menuItem = f[i];
            menuItem.showGroup = false;
            menuItem.showPlus = false;
            this.closeAllSubMenuItems(f.supList);
        }
    }

    openGroupMenu(sub: FilterEditingObject) {
        var oldState = sub.showGroup;
        this.closeAllSubMenu();

        this.isSettingMenu = true;
        sub.showGroup = !oldState;

        //if (sub.showGroup) {
        //    sub.showGroup = false;
        //    sub.showPlus = false;
        //} else {
        //    sub.showGroup = true;
        //    sub.showPlus = false;

      //}
      
  }
  openPluseMenu(sub) {
      var oldState = sub.showPlus;
      this.closeAllSubMenu();
      this.isSettingMenu = true;
     
      sub.showPlus = !oldState;
      //if (sub.showPlus) {
      //    sub.showPlus = false;
      //    sub.showGroup = false;
      //} else {
      //    sub.showPlus = true;
      //    sub.showGroup = false;
      //}
     
  }
  save() {
      let ans = this.getstring(this.filterObjects[0]);
      
      this.clone();
      
      this.widget.FilterString = ans;
      try {
          this.methods.ApplyFilters(this.widget,true);
       //   this.widget.FilterEditingObject = this.filterObjects;
          
          notify('Filter Applied!', 'success', 600);
      }
      catch (e) {
          notify('Please enter a valid Filter', 'error', 600);
          
      }
  }
  clear() {
      this.filterObjects[0].supList = new Array<FilterEditingObject>();
      this.clone();
      this.methods.BuildWidget(this.widget);
      notify('Filter Cleared!', 'success', 600);
  }
  changeopnet(n: number, idx: FilterEditingObject) {
      var x = "AND";
      switch (n) {
          case 1:
              x = "AND";
              break;
          case 2:
              x = "OR";
              break;
          case 3:
              x = "NOT AND";
              break;
          case 4:
              x = "NOT OR";
              break;
      }
      idx.opnet = x;
  }
  

    log(f) {

        //console.log(f);
    }

    getstring(fo: FilterEditingObject): string {
        //debugger;

        if (fo.isoper == false) {
            let ans = "( ";
            ans = ans + "o." + fo.opnet + " ";
            ans = ans + this.getoper(fo.condation) + " ";
            ans = ans + "'" + fo.value1 + "' ) ";
            return ans;
        }
        let c = fo.supList.length;



        if (c != 0) {
            let ans = "( ";
            if (fo.opnet == "NOT OR" || fo.opnet == "NOT AND")
                ans = "!( "
            for (let fo2 of fo.supList) {

                ans = ans + this.getstring(fo2) + " ";
                if (c > 1)
                    ans = ans + this.getgroup(fo.opnet) + " ";
                c = c - 1;

            }
            ans = ans + ") ";
            return ans;
        }
        return "";
    }


    Del(f: FilterEditingObject) {
        f.parentObject.supList.splice(f.parentObject.supList.indexOf(f), 1);
    }



    getgroup(g: string) {
        switch (g) {
            case "AND":
                return "&&";
            case "OR":
                return "||";
            case "NOT AND":
                return "&&";
            case "NOT OR":
                return "||";
            default:
                return "&&"
        }


    }
    getoper(cond: string) {
        // debugger;
        switch (cond) {
            case "Equal":
                return "==";
            case "Not Equal":
                return "!=";
            case "Is Greater Than":
                return ">";
            case "Is Greater Than Or Equal":
                return ">=";
            case "Is Less Than":
                return "<";
            case "Is Less Than Or Equal":
                return "<=";
            default:
                return "=="
        }

    }

    clickCatcher() {
        this.isSelecting = true;
    }

    deleteItem(e: DashboardWidget) {
        
       // debugger;
        this.clickCatcher();
        var index = this.widgets.findIndex(we => we.Item.x == e.Item.x && we.Item.y == e.Item.y);
        var arr = this.items.toArray();
       // //console.log(arr);
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].option.x === e.Item.x && arr[i].option.y === e.Item.y) {
                this.gridStackMain.RemoveWidget(arr[i]);
                break;
                //console.log(arr[i]);
            }
        }

        this.widgets.splice(index , 1);
    }

    deSelectWidgets() {
        if (!this.isSelecting) {
            for (var i = 0; i < this.widgets.length; i++) {
                this.widgets[i].IsSelected = false;
            }
            //this.widget = null;
        }
        else
            this.isSelecting = false;

    }

    onGridConfigurationChanged(e) {
        ////console.log(e);
    }
    selectWidget(w: DashboardWidget) {
        this.deSelectWidgets();


        this.clickCatcher();
        this.widget = w;
        w.IsSelected = true;
    }

    CalculateWidgetSizes($event) {
        var totalWidth = $('.i-dashboard-viewer-content').width() - 30;
        for (var i = 0; i < this.DashboardGroups.length; i++) {
            var strId = '[data-id="' + this.DashboardGroups[i].DisplayID + '"]';
            var wrapperHeight = $(strId).height();
            var wrapperWidth = $(strId).width();
            var elementArr = [];
            var w = this.DashboardGroups[i].Widgets;
            var widgetWidth = totalWidth / w.length;
            //alert(widgetWidth);
            for (var j = 0; j < w.length; j++) {
                w[j].Width = widgetWidth;
            }
        }let gridstack_width = $('#gridStackMain').width();
        gridstack_width /= 12;
        for (let Twidget of this.widgets)
            Twidget.GridStackMainWidth = gridstack_width;
        
    }

    LoadOldWidgets() {
        //  this.AddWidgetInit(DashboardWidgetTypeEnum.Grid, largeData, Q1);

        //  //  this.AddWidgetInit(DashboardWidgetTypeEnum.Pivot, TestCases, []);
        //this.AddWidgetInit(DashboardWidgetTypeEnum.PieChart, largeData, Q3);
        //this.AddWidgetInit(DashboardWidgetTypeEnum.BarChart, largeData, Q2);
        // this.widget = this.widgets[0];
    }
    resetStack() {
        this.FilterStack.push(0);
        this.StackTop = 0;
        jQuery('CCC').html("");
    }
    changecondation(c: string, f: FilterEditingObject) {
        f.condation = c;
    }

    //MasterFilter
    MasterFilter(e) {
       // debugger;
        let method = new Operations;
        Operations.MasterFilter['F' + e.ID] = e.rows;
        for (let widget of this.widgets) {
            if (widget.ID != e.ID) { method.ApplyFilters(widget); }
        }

    }

    ngAfterViewInit() {
        this.LoadOldWidgets();
        //root Filter object // don't delete it 
        //////////////////////
        var that = this;
        $("#filterEditor-modal").on('show.bs.modal', function () {
            debugger;
            if (!that.widget.FilterEditingObject || that.widget.FilterEditingObject.length == 0) {
                var f: FilterEditingObject = new FilterEditingObject;

                f = new FilterEditingObject;
                f.root = true;
                f.isoper = true;
                f.opnet = "AND";
                that.widget.FilterEditingObject = []
                that.widget.FilterEditingObject.push(f);
               
            }
            that.filterObjects = that.widget.FilterEditingObject;
            that.myContext = { $implicit: that.filterObjects };

        });
        var f: FilterEditingObject = new FilterEditingObject;
        f = new FilterEditingObject;
        f.root = true;
        f.isoper = true;
        f.opnet = "AND";
        this.filterObjects.push(f);
        for (let widget of this.widgets) {
          widget.UpdateColors();
        }
    }
    
    ngOnInit() {
        
        this.CalculateWidgetSizes(null);
        this.getWidgetList();
        this.route.params.subscribe(params => {
            if (params['dashboardid']) {
                this.DashboardID = +params['dashboardid'];
               
                // debugger;
                this.getDashboard(this.DashboardID);
            }
            else
                this.dashboard = new Dashboard();


        });
        /////////////////////////////
        //this.createpie();
    }
    products = [{
        id: "1",
        text: "Aggergate",
        expanded: true,
        items: [{
            id: "1_1",
            text: "Aggr()",
            items: []
        }, {
            id: "1_2",
            text: "Avg()",
            items: []
        }]
    }, {
        id: "2",
        text: "Logical",
        expanded: false,
        items: []
    }, {
        id: "3",
        text: "Math",
        expanded: true,
        items: []
    }, {
        id: "4",
        text: "String",
        expanded: true,
        items: []
    }];
    operators = [{
        id: "1",
        text: "+",
        expanded: true,
        items: []
    }, {
        id: "2",
        text: "-",
        items: []
    }, {
        id: "3",
        text: "*",
        items: []
    }, {
        id: "4",
        text: "/",
        expanded: false,
        items: []
    }, {
        id: "5",
        text: "%",
        expanded: true,
        items: []
    }, {
        id: "6",
        text: "|",
        expanded: true,
        items: []
    }];
    fields = [{
        id: "1",
        text: "Field Title",
        expanded: true,
        items: []
    }, {
        id: "2",
        text: "Field Title",
        items: []
    }, {
        id: "3",
        text: "Field Title",
        items: []
    }, {
        id: "4",
        text: "Field Title",
        expanded: false,
        items: []
    }, {
        id: "5",
        text: "Field Title",
        expanded: true,
        items: []
    }, {
        id: "6",
        text: "Field Title",
        expanded: true,
        items: []
    }];
    openPopup(n: string, t: string, i: string) {
        this.popup.name = n;
        this.popup.title = t;
        this.popup.icon = i;
        this.newChartPopup.show();
        //console.log(this.popup);
        //this.router.navigate;
    }
    
}
