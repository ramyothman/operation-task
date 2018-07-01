
import { DataSourceConnection } from './data-source-connection.model';

export class DashboardDataSource {
    Id: number;
    Name: string;
    ProfileConnection: DataSourceConnection[];
    SelectedConnection: DataSourceConnection[] = [];
}