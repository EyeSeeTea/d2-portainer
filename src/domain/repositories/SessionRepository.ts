import { UserSession } from "./../entities/UserSession";

export interface SessionRepository {
    store(userSession: UserSession | undefined): void;
    load(): UserSession | undefined;
}
