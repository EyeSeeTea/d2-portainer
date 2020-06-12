import { UserSession } from "./../entities/UserSession";
import { DataSourceRepository } from "./../repositories/DataSourceRepository";
import { StringEither } from "../../utils/Either";
import { SessionRepository } from "../repositories/SessionRepository";

export class LoginUser {
    constructor(
        private dataSourceRepository: DataSourceRepository,
        private sessionRepository: SessionRepository
    ) {}

    public async execute(
        username: string,
        password: string,
        endPointName: string
    ): Promise<StringEither<UserSession>> {
        const res = await this.dataSourceRepository.login(username, password, endPointName);
        return res.map(userSession => {
            this.dataSourceRepository.setSession(userSession);
            this.sessionRepository.store(userSession);
            return userSession;
        });
    }
}
