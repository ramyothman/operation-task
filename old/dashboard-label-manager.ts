import * as dash from './dashboard.model/dashboard-data-fields'
import {DashboardWidget} from './dashboard.model/dashboard-widget.model'
export class LabelManager{
    private static instance:LabelManager;
    private constructor(){}
    public static get getInstance():LabelManager{
        if(this.instance == null)
            this.instance = new LabelManager();
        return this.instance;
    }
    public reSortLabels(widget: DashboardWidget): void {
        let labels = [];
        let temp = _.cloneDeep(widget.widgetLabels);
        temp = temp.sort(function (a, b) {
          return a.priority - b.priority;
        });
        widget.widgetLabels = temp;
    }
    public constructExpLabels(type: dash.DateGroupEnum){
        if (type == dash.DateGroupEnum.Month) {
            return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        }
        return null;
    }
    public calculatExpLabels(groups: dash.Query[], datasets:any[]): any {
        if (!groups || !groups.length) {
            return null;
        }
        let actual = null;
        for (let dat of datasets) {
            if (dat.role.QuerySubType == dash.QuerySubTypeEnum.ActualExp) {
                actual = dat;
                break;
            }
        }
        if (!actual)
            return null;
        let labels = this.constructExpLabels(groups[0].Operation.Type);
        if (!labels) return null;
    
    }
}