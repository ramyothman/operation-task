import { Column } from './column.model';
import { GetColumnPrameter } from './get-column-prameter.model';
import { Headers, Http, Response } from '@angular/http';

export class Table {
    ConString: string;
    ConName: string;
    Id: string;
    Name: string;
    TableID: string;
    Schema: string;
    NameSpace: string;
    Columns: Column[];
   
     Data: any = null;
    

    public static clone(model: Table) {
        let t = new Table();
        if (model == null)
            return t;
        t.Id = model.Id;
        t.Name = model.Name;
        t.NameSpace = model.Name;
        t.Schema = model.Schema;
        t.TableID = model.TableID;
        t.Columns = Column.cloneList(model.Columns);
        t.ConString = model.ConString;
        
        return t;
    }
}
