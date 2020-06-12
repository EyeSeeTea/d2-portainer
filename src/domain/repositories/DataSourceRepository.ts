import { UserSession } from "./../entities/UserSession";
import { StringEither } from "../../utils/Either";

export interface DataSourceRepository {
    login(
        username: string,
        password: string,
        endpointName: string
    ): Promise<StringEither<UserSession>>;

    setSession(userSession: UserSession): void;

    info(): Info;
}

export interface Info {
    url: string;
}
