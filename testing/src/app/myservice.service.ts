import { Injectable } from '@angular/core';

@Injectable()
export class MyserviceService {
  data: any =[{
    state: "Illinois",
    year1998: 423,
    year2001: 476,
    year2004: 528,
    product: 'computer'
}, {
    state: "Indiana",
    year1998: 178,
    year2001: 195,
    year2004: 227,
    product: 'laptop'
}, {
    state: "Michigan",
    year1998: 308,
    year2001: 335,
    year2004: 372,
    product: 'computer'
}, {
    state: "Ohio",
    year1998: 348,
    year2001: 374,
    year2004: 418,
    product: 'laptop'
}, {
    state: "Wisconsin",
    year1998: 160,
    year2001: 182,
    year2004: 211,
    product: 'laptop'
}];
 constructor() { }
  getData(): any[] {
    return this.data;
  }
}
