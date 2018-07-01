
export class ColumnDataType {
    SQLType: string;
    DotNetType: string;
    CSharpType: string;
    VBType: string;
    JavaType: string;
    LanguageSpecificType: string;

    public static clone(model: ColumnDataType) {
        let dt = new ColumnDataType();
        if (model == null)
            return dt;
        dt.CSharpType = model.CSharpType;
        dt.DotNetType = model.DotNetType;
        dt.JavaType = model.JavaType;
        dt.LanguageSpecificType = model.LanguageSpecificType;
        dt.SQLType = model.SQLType;
        dt.VBType = model.VBType;
        return dt;
    }
}