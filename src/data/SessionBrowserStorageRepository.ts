import { SessionRepository } from "../domain/repositories/SessionRepository";
import { UserSession } from "../domain/entities/UserSession";

export class SessionBrowserStorageRepository implements SessionRepository {
    storageUserKey = "user";

    store(userSession: UserSession): void {
        const { storageUserKey } = this;
        const json = JSON.stringify(userSession);
        sessionStorage.setItem(storageUserKey, json);
    }

    load(): UserSession | undefined {
        const { storageUserKey } = this;
        const json = sessionStorage.getItem(storageUserKey);
        if (!json) return;
        try {
            return JSON.parse(json);
        } catch (e) {
            console.error(`Cannot parse sessionStorage item: ${storageUserKey}`);
            return;
        }
    }

    logout(): void {
        sessionStorage.removeItem(this.storageUserKey);
    }
}
