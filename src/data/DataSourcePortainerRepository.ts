import { PromiseRes } from "./../utils/types";
import { UserSession } from "./../domain/entities/UserSession";
import { DataSourceRepository, Info } from "./../domain/repositories/DataSourceRepository";
import { PortainerApi } from "./PortainerApi";

export class DataSourcePortainerRepository implements DataSourceRepository {
    constructor(public api: PortainerApi) {}

    async login(username: string, password: string, endpointName: string): PromiseRes<UserSession> {
        const login = await this.api.login({ username, password, endpointName });
        return login.map(api => ({
            username,
            token: api.token,
            endpointId: api.endpointId,
        }));
    }

    setSession(userSession: UserSession): void {
        this.api.session(userSession);
    }

    info(): Info {
        return { url: this.api.baseUrl };
    }
}
