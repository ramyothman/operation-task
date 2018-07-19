import 'reflect-metadata';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Component } from '@angular/core';
import { AppComponent } from './app.component';
import { EchartsComponent } from './echarts/echarts.component';
import { OptionComponent } from './option/option.component' ;
import { MyserviceService } from './myservice.service';

@NgModule({
  declarations: [
    AppComponent,
    EchartsComponent,
    OptionComponent,
  ],
  imports: [
    BrowserModule,
  ],
  providers: [MyserviceService],
  bootstrap: [AppComponent]
})
export class AppModule { }
