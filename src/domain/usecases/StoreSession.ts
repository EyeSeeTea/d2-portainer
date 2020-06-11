import { UserSession } from "./../entities/UserSession";
import { SessionRepository } from "./../repositories/SessionRepository";

export class StoreSession {
    constructor(private sessionRepository: SessionRepository) {}

    execute(userSession: UserSession | undefined): void {
        return this.sessionRepository.store(userSession);
    }
}
