import * as dash from '../../models/dashboard/dashboard-data-fields';

export class SeriseManager{

    private static instance:SeriseManager;
    private constructor(){}     // private to prevent to create more than one instance by access constructor from outside
    public static getInstance(){   // can create one and only one instance " singleton "
        if(this.instance == null){
            this.instance = new SeriseManager();
        }
        return this.instance;
    }
    public prepareSerise(Queries: dash.Query[], Data: any[], removeNull: boolean = false): any[] {
        let Q: dash.GroupOperation[] = this.convertQueryToGroupOperation(Queries);
        return Data = this.GroupBy_v1(Q, Data, removeNull); 
    }
    public prepareSerise_withFields(Queries: dash.Query[], Data: any[], removeNull: boolean = false, sortGroups: boolean = true): PreparedDataGroups {
        let Q: dash.GroupOperation[] = this.convertQueryToGroupOperation(Queries);
        return this.ConstructGroups_WithFields(Q, Data, dash.QueryTypeEnum.Serise, removeNull, sortGroups);
    }
    private convertQueryToGroupOperation(Queries: dash.Query[]): dash.GroupOperation[]{ // convert query to array of operations
        let Q: dash.GroupOperation[] = []
        for (let query of Queries) {
            if (query.QueryType == dash.QueryTypeEnum.Serise) {
                Q.push(query.Operation)
            }
        }
        return Q;

    }
    public handleSerise(ser: dash.Query[], data: any[],argu:any):any {
        var res = [];
        var all_ser: string[] =[];
        var count = 0;
        var check : boolean[] = [];
        for (let recored of data) {
            var seriseName = "";
            let nRow = {};
            for (let row of recored) {
                for (let field in row) {
                    if (field == 'serise')
                        continue
                    if (row['serise'])
                        nRow[row['serise'] + "-" + field] = row[field];
                    else
                        nRow[field] = row[field];
                }
                //delete row[x.Operation.GetFieldName()];
                if (!check[row['serise']]) {
                    check[row['serise']] = true;
                    all_ser.push(row['serise']||"")
                }
            }
            if (!argu[count] || argu[count] == '0')
                nRow['argument'] = 'total';
            else
                nRow['argument'] = argu[count].split('+').join('<br>');
            count++;
            res.push(nRow);
            
        }

        return {'serise': all_ser,'data':res };
    }
    
    
}