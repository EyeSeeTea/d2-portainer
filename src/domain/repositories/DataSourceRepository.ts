import { UserSession } from "./../entities/UserSession";
import { PromiseRes } from "../../utils/types";

export interface DataSourceRepository {
    login(username: string, password: string, endpointName: string): PromiseRes<UserSession>;
    setSession(userSession: UserSession): void;
    getInfo(): Info;
}

export interface Info {
    url: string;
}
