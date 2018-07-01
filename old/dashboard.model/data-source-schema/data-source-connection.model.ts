import { Table } from './table.model';
import { View } from './view.model';

export class DataSourceConnection {
    Name: string;
    Connection: string;

    Tables: Table[] = [];
    Views: View[] = [];

    SelectedTables: Table[] = new Array<Table>();
    SelectedViews: View[] = new Array<View>();
}