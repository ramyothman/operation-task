
export enum DateGroupEnum {
    Month = 5 ,
    MonthYear = 1,
    QuarterYear = 2,
    Year = 3,
    none = 4
    
}
export enum DataTypeEnum {
    string = 1,
    number = 2,
    object = 3,
}

export enum QueryTypeEnum {
    Group = 1,
    Measure = 2,
    Delta = 3,
    Spark = 4,
    DeltaGroup = 5,
    calc = 6,
    Serise = 7,
    Chart = 8,
    Expectaion = 9,
    BarChart = 10,
    ActiveTotal = 11,

}
export enum OperationTypeEnum {
    Group = QueryTypeEnum.Group,
    Measure = QueryTypeEnum.Measure,
    Delta = QueryTypeEnum.Delta,
    Spark = QueryTypeEnum.Spark,
    DeltaGroup = QueryTypeEnum.DeltaGroup,
    calc = QueryTypeEnum.calc,
    Serise = QueryTypeEnum.Serise,
    chart = QueryTypeEnum.Chart,
    Expectaion = QueryTypeEnum.Expectaion,
    BarChart = QueryTypeEnum.BarChart,
    ActiveTotal= QueryTypeEnum.ActiveTotal
}
export enum Measure {
    Sum = 1,
    Average = 2,
    Count = 3,
    Min = 4,
    Max = 5,
    Accumulative = 6,
    Target = 7

   
   
}

export enum chartType {
    bar = 1,
    stackedBar = 2,
    fullStackedBar=3,
    point = 4,
    line=5,
    stackedLine=6,
    fullStackedLine=7,
    stepLine=8,
    spLine=9,
    area=10,
    stackedArea=11,
    fullStackedArea=12,
    stepArea=13,
    spLineArea=14,
    stackedSpLineArea=15,
    fullStackedSpLineArea=16


}
export enum expectedFieldType {
    funcation = 1,
}

export enum DeltaTypeEnum {
    PercentVariation = 1,
}

export enum MeasureInt {
    Sum = Measure.Sum,
    Count = Measure.Count,
    Average = Measure.Average,
    Min = Measure.Min,
    Max = Measure.Max,
    Accumulative = Measure.Accumulative,
    Target = Measure.Target

}

export enum MeasureString {
    Count = Measure.Count,
    Min = Measure.Min,
    Max = Measure.Max,
}
export enum SortingType {
    ascending = 1,
    descending = -1
}
export enum MeasureDate {

    Count = Measure.Count,

}
export class DimensionField {


    constructor();
    constructor(name: string, type: QueryTypeEnum, value: Array<string>, AutoColored: boolean);
    constructor(name?: string, type?: QueryTypeEnum, value?: Array<string>, AutoColored?: boolean) {
        this.name = name;
        this.type = type;
        this.value = value;
        this.AutoColored = AutoColored;
    }


    public name: string;
    public type: QueryTypeEnum;
    public value: Array<string>;
    public AutoColored: boolean = true;
}
export class PreparedDataGroups{
    constructor();
    constructor(data: Array<any>, GroupsValue: Array<DimensionField>, GroupKeyValue: Array<Array<string>>);
    constructor(data?: Array<any>, GroupsValue?: Array<DimensionField>, GroupKeyValue?: Array<Array<string>>) {
        this.data = data;
        this.GroupsValue = GroupsValue;
        this.GroupKeyValue = GroupKeyValue;
     
    }
    public data: Array<any>;
    public GroupsValue: Array<DimensionField>;
    public GroupKeyValue: Array<Array<string>>;


}

export class Customization {
    public Sort = false;
    public SortType: SortingType = SortingType.ascending;
    public DateFormat = "dd/MM/yyyy";

}

export class Query {
    QueryType: QueryTypeEnum;
    Customization: Customization = new Customization();
    Operation: any;
    OptionalType?: number;
    new?: boolean = true;
    QuerySubType?: QuerySubTypeEnum;
}
export enum QuerySubTypeEnum {
    TargetExp = 1,
    ActualExp = 2,
    DigitActual = 3,
    DigitTarget= 4
}
export class Field {
    //in data
    constructor(StoredName?: string, FieldName?: string, FieldType?: DataTypeEnum, Caption?: string, hidden?: boolean) {
        this.StoredName = StoredName; this.FieldName = FieldName; this.FieldType = FieldType; this.Caption = Caption;
        this.hidden = hidden;
    }
    public StoredName: string;
    public FieldName: string;
    public FieldType: DataTypeEnum;
    public Caption?: string;
    public hidden?: boolean;

   
}
type callbackPRAny = (...args: any[]) => any;
export class expectationOperation {
    constructor(public Field: Field, public Type?: expectedFieldType, callback?: callbackPRAny) {
        this.callback = callback;
    }
    public callback: callbackPRAny;
    public CertainYear: number;
    public GetStoredName = (): string => {
        if (this.Field.StoredName)
            return this.Field.StoredName;
        return "";

    };
    public SetStoredName(name: string) {
        this.Field.StoredName = name;
    };
    public GetFieldName(): string {
        if (this.Field.FieldName)
            return this.Field.FieldName;
        return "";
    };
    public SetFieldName(name: string) {
        this.Field.FieldName = name;
    }
    public GetType(): expectedFieldType {
        return this.Type;
    }
    public SetType(type: expectedFieldType) {
        this.Type = type;
    }
    public GetCaption(): string {
        return this.Field.Caption;
    }
    public SetCaption(input: string) {
        this.Field.Caption = input;
    }
    public SetDataType(ty: DataTypeEnum) {
        this.Field.FieldType = ty;
    }
    public GetDataType(): DataTypeEnum {
        return this.Field.FieldType;
    }
    public isHidden(): boolean {
        return this.Field.hidden;
    }
    public setHidden(flag: boolean) {
        this.Field.hidden = flag;
    }
}


export class GroupOperation  {
    constructor(public Field: Field, public Type?: DateGroupEnum, public sort?: boolean) {
        this.sort = false;
    }
    public CertainYear: number;
    public GetStoredName = (): string => {
        if (this.Field.StoredName)
            return this.Field.StoredName;
        return "";
       
    };
    public SetStoredName(name: string) {
        this.Field.StoredName=name;
    };
    public GetFieldName(): string{
        if (this.Field.FieldName)
            return this.Field.FieldName;
        return "";
     };
     public  SetFieldName(name:string) {
       this.Field.FieldName = name;
     }
     public GetType(): DateGroupEnum {
        return this.Type;
     }
     public SetType(type: DateGroupEnum) {
       this.Type = type;
    }
   public GetCaption(): string {
       return this.Field.Caption;
   }
   public  SetCaption(input: string) {
       this.Field.Caption = input;
   }
   public  SetDataType(ty: DataTypeEnum) {
       this.Field.FieldType = ty;
   }
   public GetDataType(): DataTypeEnum {
       return this.Field.FieldType;
   }
   public isHidden(): boolean {
       return this.Field.hidden;
   }
   public setHidden(flag: boolean) {
       this.Field.hidden = flag;
   }
    
}
export class MeasureOperation  {
    constructor(public Field: Field, public Type?: Measure ) { }
    public isHidden(): boolean {
        return this.Field.hidden;
    }
    public setHidden(flag: boolean) {
        this.Field.hidden = flag;
    }
    public GetStoredName(): string {
        if (this.Field.StoredName)
            return this.Field.StoredName;
        return "";
       
    };
    public SetStoredName(name: string) {
        this.Field.StoredName = name;
    };
    public GetFieldName(): string {
        if (this.Field.FieldName)
            return this.Field.FieldName;
        return "";
        
    };
    public SetFieldName(name: string) {
        this.Field.FieldName = name;
    }
    public GetType(): Measure {
        return this.Type;
    }
    public SetType(type: Measure) {
        this.Type = type;
    }
    public GetCaption(): string {
        return this.Field.Caption;
    }
    public SetCaption(input: string) {
        this.Field.Caption = input;
    }
    public SetDataType(ty: DataTypeEnum) {
        this.Field.FieldType = ty;
    }
    public GetDataType(): DataTypeEnum {
        return this.Field.FieldType;
    }
  
}
export class Delta  {

    constructor(public FieldName: string, public Type: DeltaTypeEnum, public ActualField: MeasureOperation, public TargetField: MeasureOperation,
        public ActualGroup?: string,
        public TargetGroup?: string,
        public Caption?: string,
        public hidden?: boolean) { }
   
    public isHidden(): boolean {
        return this.hidden;
    }
    public setHidden(flag: boolean) {
        this.hidden = flag;
    }
    public GetStoredName(): string {
        return this.ActualField.GetStoredName();
    };
    public SetStoredName(name: string) {
        this.ActualField.SetStoredName(name);
    };
  
    public GetFieldName(): string {
        if (this.FieldName)
            return this.FieldName;
        return "";
    };
    public SetFieldName(name: string) {
        this.FieldName = name;
    }
    public GetType(): DeltaTypeEnum {
        return this.Type;
    }
    public SetType(type: DeltaTypeEnum) {
        this.Type = type;
    }
    public GetCaption(): string {
        return this.Caption;
    }
    public SetCaption(input: string) {
        this.Caption = input;
    }
    public SetDataType(ty: DataTypeEnum) {
        this.ActualField.SetDataType(ty) ;
    }
    public GetDataType(): DataTypeEnum {
        return this.ActualField.GetDataType();
    }
    public GetFieldNameTarget(): string {
        return this.TargetField.GetFieldName();
    };
    public SetFieldNameTarget(name: string) {
        this.TargetField.SetFieldName(name);
    };
    public GetStoredNameTarget(): string {
        return this.TargetField.GetFieldName();
    };
    public SetStoredNameTarget(name: string) {
        this.TargetField.SetFieldName(name);
    };
}

export class ActiveTotal {

    constructor(public FieldName: string,  public ActualField: MeasureOperation, public TargetField: MeasureOperation,
      
        public Caption?: string,
      
       ) { }
    public Type: any;
  
    public GetStoredName(): string {
        return this.ActualField.GetStoredName();
    };
    public SetStoredName(name: string) {
        this.ActualField.SetStoredName(name);
    };

    public GetFieldName(): string {
        if (this.FieldName)
            return this.FieldName;
        return "";
    };
    public SetFieldName(name: string) {
        this.FieldName = name;
    }
    public GetType(): DeltaTypeEnum {
        return this.Type;
    }
    public SetType(type: DeltaTypeEnum) {
        this.Type = type;
    }
    public GetCaption(): string {
        return this.Caption;
    }
    public SetCaption(input: string) {
        this.Caption = input;
    }
    public SetDataType(ty: DataTypeEnum) {
        this.ActualField.SetDataType(ty);
    }
    public GetDataType(): DataTypeEnum {
        return this.ActualField.GetDataType();
    }
    public GetFieldNameTarget(): string {
        return this.TargetField.GetFieldName();
    };
    public SetFieldNameTarget(name: string) {
        this.TargetField.SetFieldName(name);
    };
    public GetStoredNameTarget(): string {
        return this.TargetField.GetFieldName();
    };
    public SetStoredNameTarget(name: string) {
        this.TargetField.SetFieldName(name);
    };
}


export class Chart {

    constructor(public FieldName: string, public CompareDate: GroupOperation, public CompareToDate: GroupOperation, public DaysRange: number = 0,
        TakeToday: boolean = false,
       
        public Caption?: string,
        public hidden?: boolean) { }

    public isHidden(): boolean {
        return this.hidden;
    }
    public setHidden(flag: boolean) {
        this.hidden = flag;
    }
    public GetStoredName(): string {
        return this.CompareDate.GetStoredName();
    };
    public SetStoredName(name: string) {
        this.CompareDate.SetStoredName(name);
    };
    public GetComparedFieldName(): string {
        return this.CompareDate.GetFieldName();
    };
    public SetComparedFieldName(name: string) {
        this.CompareDate.SetFieldName(name);
    };
    public GetFieldName(): string {
        if (this.FieldName)
            return this.FieldName;
        return "";
    };
    public SetFieldName(name: string) {
        this.FieldName = name;
    }
   
    public GetCaption(): string {
        return this.Caption;
    }
    public SetCaption(input: string) {
        this.Caption = input;
    }
    public SetDataType(ty: DataTypeEnum) {
        this.CompareDate.SetDataType(ty);
    }
    public GetDataType(): DataTypeEnum {
        return this.CompareDate.GetDataType();
    }
    public GetFieldNameAgru(): string {
        return this.CompareToDate.GetFieldName();
    };
    public SetFieldNameAgru(name: string) {
        this.CompareToDate.SetFieldName(name);
    };
    public GetStoredNameAgru(): string {
        return this.CompareToDate.GetStoredName();
    };
    public SetStoredNameAgru(name: string) {
        this.CompareToDate.SetStoredName(name);
    };
    public GetTypeAgru(): DateGroupEnum {
        return this.CompareToDate.GetType();
    };
    public SetTypeAgru(dt: DateGroupEnum) {
        this.CompareToDate.SetType(dt);
    };
}

export class Spark {
    constructor(public FieldName: string, public Type: DataTypeEnum, public ActualField: MeasureOperation, public ArgumentField: GroupOperation,
        public Caption?: string,
    public hidden?:boolean) { }
  
    public isHidden(): boolean {
        return this.hidden;
    }
    public setHidden(flag: boolean) {
        this.hidden = flag;
    }
    GetStoredName(): string {
        return this.ActualField.GetStoredName();
    };
    SetStoredName(name: string) {
        this.ActualField.SetStoredName(name);
    };
    GetFieldName(): string {
        return this.FieldName;
    };
    SetFieldName(name: string) {
        this.FieldName = name;
    }
    GetType(): Measure{
       return   this.ActualField.GetType();
    }
    SetType(ty: Measure) {
         this.ActualField.SetType(ty);
    }
   
    GetCaption(): string {
        return this.Caption;
    }
    SetCaption(input: string) {
        this.Caption = input;
    }
    SetDataType(ty: DataTypeEnum) {
        this.ActualField.SetDataType(ty);
    }
    GetDataType(): DataTypeEnum {
        return this.ActualField.GetDataType();
    }
    public GetFieldNameAgru(): string {
        return this.ArgumentField.GetFieldName();
    };
    public SetFieldNameAgru(name: string) {
        this.ArgumentField.SetFieldName(name);
    };
    public GetStoredNameAgru(): string {
        return this.ArgumentField.GetStoredName();
    };
    public SetStoredNameAgru(name: string) {
        this.ArgumentField.SetStoredName(name);
    };
    public GetTypeAgru(): DateGroupEnum {
        return this.ArgumentField.GetType();
    };
    public SetTypeAgru(dt: DateGroupEnum) {
        this.ArgumentField.SetType(dt);
    };
}
export class CalculatedField {
    FieldName: string;
    Expression: string;
    Caption?: string;
}
export class DashboardDataFields {
    FieldName?: string;
    OperationType: OperationTypeEnum;
    DisplayName: string;
    DataType?: DataTypeEnum;
    MeasureType?: Measure
    Expression?: string;
    GroupedDateType?: DateGroupEnum;
    DeltaActualOperationType?: Measure;
    DeltaTargetDataField?: string;
    DeltaGroupsTypeValue?: string[];
    DeltaTargetOperationType?: OperationTypeEnum;
    SparkDateFieldName?: string;
    SparkDateType?: DateGroupEnum;
    Caption?:string;
    ////     ([FieldName1] * [FieldName2] / 100 ) + 20
}
export interface EnumItem { id:number , name : string };
export class FilterOptions {
    FieldName: string;
    Opertaion: string;
    value: any
    ////     ([FieldName1] * [FieldName2] / 100 ) + 20
}
export enum monthNames {
    "January" = 1,
    "February"=2,
    "March"=3,
    "April"=4,
    "May"=5,
    "June"=6,
    "July"=7,
    "August"=8,
    "September"=9,
    "October"=10,
    "November"=11,
    "December"=12
};

/********************************* Pivot *********************************************************/
export enum openedBinding {
    values = 1,
    agrument = 2,
    serise = 3,
    target = 4,

}
export enum pivotString {
    count = Measure.Count,
    min = Measure.Min,
    max = Measure.Max,
}
export enum pivotint {
    sum = Measure.Sum,
    count = Measure.Count,
    min = Measure.Min,
    max = Measure.Max,
    average = Measure.Average
}
export enum pivotdate {
    count = Measure.Count,
  
}

export const data: any[] = [
    {
        "name": "Malawi",
        "address": "a1",
        "date": new Date("2017-5-17"),
        "sales": 7489,
        "target": 6603
    },
    {
        "name": "France",
        "address": "a1",
        "date": new Date("2017-2-17"),
        "sales": 4784,
        "target": 8965
    },
    {
        "name": "Syria",
        "address": "a1",
        "date": new Date("2017-11-17"),
        "sales": 2064,
        "target": 7611
    },
    {
        "name": "France",
        "address": "a1",
        "date": new Date("2016-1-17"),
        "sales": 4785,
        "target": 8965
    },
    {
        "name": "Syria",
        "address": "a1",
        "date": new Date("2017-12-17"),
        "sales": 2064,
        "target": 7611
    },
    {
        "name": "art3",
        "address": "a1",
        "date": new Date("2017-12-17"),
        "sales": 2064,
        "target": 7611
    },
    {
        "name": "Egypt",
        "address": "bike",
        "date": "2017-3-17",
        "sales": 9544,
        "target": 6541
    },
    {
        "name": "Egypt",
        "address": "moto",
        "date": "2017-2-17",
        "sales": 3265,
        "target": 6541
    },
    
    {
        "name": "Egypt",
        "address": "car",
        "date": "2017-7-17",
        "sales": 56787,
        "target": 6541
    },
    {
        "name": "Egypt",
        "address": "car",
        "date": "2017-8-17",
        "sales": 5672,
        "target": 6641
    }]
const testFilter = [
    [

        {
            'id': 1,
            'city': "Cairo",
            'country': "EGY",
        },
        {
            'id': 1,
            'city': "Alex",
            'country': "EGY",
        },
        {
            'id': 1,
            'city': "California",
            'country': "USA",
        },
    ],
    [
        {
            'Vendor': "BMW",

        },
        {
            'Vendor': "Mercedes",

        },
    ],

]
const testData = [
    {
        'country': "USA",
        'Vendor': "BMW",
        'address': "ad1"
    },
    {
        'country': "EGY",
        'Vendor': "BMW",
        'address': "ad1"
    },
    {
        'country': "EGY",
        'Vendor': "Honda",
        'address': "ad1"
    },
];