import { DataSourceRepository } from "./../repositories/DataSourceRepository";
import { SessionRepository } from "../repositories/SessionRepository";
import { UserSession } from "../entities/UserSession";

export class LoginUserFromSession {
    constructor(
        private dataSourceRepository: DataSourceRepository,
        private sessionRepository: SessionRepository
    ) {}

    public execute(): UserSession | undefined {
        const userSession = this.sessionRepository.load();
        if (userSession) {
            this.dataSourceRepository.setSession(userSession);
            return userSession;
        }
    }
}
