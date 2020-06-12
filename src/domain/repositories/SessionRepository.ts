import { UserSession } from "./../entities/UserSession";

export interface SessionRepository {
    store(userSession: UserSession): void;
    logout(): void;
    load(): UserSession | undefined;
}
