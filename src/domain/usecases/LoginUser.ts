import { UserSession } from "./../entities/UserSession";
import { DataSourceRepository } from "./../repositories/DataSourceRepository";
import { SessionRepository } from "../repositories/SessionRepository";
import { PromiseRes } from "../../utils/types";

export class LoginUser {
    constructor(
        private dataSourceRepository: DataSourceRepository,
        private sessionRepository: SessionRepository
    ) {}

    public async execute(
        username: string,
        password: string,
        endPointName: string
    ): PromiseRes<UserSession> {
        const res = await this.dataSourceRepository.login(username, password, endPointName);
        return res.map(userSession => {
            this.dataSourceRepository.setSession(userSession);
            this.sessionRepository.store(userSession);
            return userSession;
        });
    }
}
