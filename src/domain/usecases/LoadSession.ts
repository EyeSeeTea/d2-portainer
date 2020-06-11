import { UserSession } from "./../entities/UserSession";
import { SessionRepository } from "./../repositories/SessionRepository";

export class LoadSession {
    constructor(private sessionRepository: SessionRepository) {}

    execute(): UserSession | undefined {
        return this.sessionRepository.load();
    }
}
