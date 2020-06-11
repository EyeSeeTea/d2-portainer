import { SessionRepository } from "../domain/repositories/SessionRepository";
import { UserSession } from "../domain/entities/UserSession";

export class SessionBrowserStorageRepository implements SessionRepository {
    storageUserKey = "user";

    store(userSession: UserSession | undefined): void {
        const { storageUserKey } = this;
        if (userSession) {
            const json = JSON.stringify(userSession);
            sessionStorage.setItem(storageUserKey, json);
        } else {
            sessionStorage.removeItem(storageUserKey);
        }
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
}
