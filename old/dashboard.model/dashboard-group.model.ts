import { DashboardWidget } from './dashboard-widget.model';
export class DashboardGroup {
    ID: number;
    DisplayID: string;
    GroupOrder: string;
    Widgets: DashboardWidget[] = [];
}