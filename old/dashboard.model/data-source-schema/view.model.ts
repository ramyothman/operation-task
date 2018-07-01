import { Column } from './column.model'
import { GetColumnPrameter } from './get-column-prameter.model';

export class View {
    Id: string;
    Name: string;
    ViewID: string;
    Schema: string;
    NameSpace: string;
    Columns: Column[];
    ConString: string;
    ConName: string;
     Data: any = null;
    
    //get Data(): any {
    //    var errorMessage: string;

    //    if (this._Data != null)
    //        return this._Data;

    //    let e = new GetColumnPrameter();
    //    e.Connection = this.ConString
    //    e.Id = this.Id;
    //    e.Name = this.Name;
    //    e.ObjectID = this.ViewID;
    //    e.Schema = this.Schema;

    //    this.dataSourceService.getAllTableData(e)
    //        .subscribe(
    //        value => {
    //            this._Data = value
    //        },
    //        error => errorMessage = <any>error);


    //    return this._Data;
    //}

    public static clone(model: View) {
        let t = new View();
        if (model == null)
            return t;
        t.Id = model.Id;
        t.Name = model.Name;
        t.NameSpace = model.Name;
        t.Schema = model.Schema;
        t.ViewID = model.ViewID;
        t.Columns = Column.cloneList(model.Columns);
        t.ConString = model.ConString;
        return t;
    }
}
