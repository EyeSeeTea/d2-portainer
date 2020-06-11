import { UserSession } from "./../entities/UserSession";
import { DataSourceRepository } from "./../repositories/DataSourceRepository";
import { StringEither } from "../../utils/Either";

export class SetDataSourceSession {
    constructor(private dataSourceRepository: DataSourceRepository) {}

    public execute(userSession: UserSession): void {
        return this.dataSourceRepository.session(userSession);
    }
}
