import { UserSession } from "./../entities/UserSession";
import { DataSourceRepository } from "./../repositories/DataSourceRepository";

export class SetDataSourceSession {
    constructor(private dataSourceRepository: DataSourceRepository) {}

    public execute(userSession: UserSession): void {
        return this.dataSourceRepository.setSession(userSession);
    }
}
