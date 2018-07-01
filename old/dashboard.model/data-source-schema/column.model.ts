import { ColumnDataType } from './column-data-type.model'
export class Column {
    Id: string;
    Name: string;
    ColumnId: string;
    ColumnFullName: string;
    IsPrimary: boolean;
    IsForeign: boolean;
    IsIdentity: boolean;
    AllowNull: boolean;
    IsComputed: boolean;
    ColumnDataType: ColumnDataType;
    IsSelected: boolean;

    public static cloneList(model: Column[]) {
        let cList: Column[] = [];
        if (model == null || model.length == 0)
            return cList;
        for (var i = 0; i < model.length; i++){
            cList.push(Column.clone(model[i]));
        }
        return cList;
    }
    public static clone(model: Column) {
        let c = new Column();
        if (model == null)
            return c;
        c.AllowNull = model.AllowNull;
        c.ColumnDataType = ColumnDataType.clone(model.ColumnDataType);
        c.ColumnFullName = model.ColumnFullName;
        c.ColumnId = model.ColumnId;
        c.Id = model.Id;
        c.IsComputed = model.IsComputed;
        c.IsForeign = model.IsForeign;
        c.IsIdentity = model.IsIdentity;
        c.IsPrimary = model.IsPrimary;
        c.IsSelected = model.IsSelected;
        c.Name = model.Name;
        return c;
    }
}