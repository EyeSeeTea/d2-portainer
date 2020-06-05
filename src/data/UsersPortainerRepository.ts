import { User } from "./../domain/entities/User";
import { UsersRepository } from "./../domain/repositories/UsersRepository";
import { PortainerApi } from "./PortainerApi";
import { StringEither } from "../utils/Either";

export class UsersPortainerRepository implements UsersRepository {
    constructor(public options: { baseUrl: string; currentUser?: User }) {}

    async login(username: string, password: string): Promise<StringEither<User>> {
        const { baseUrl } = this.options;
        const login = await PortainerApi.login({ baseUrl, username, password });
        return login.map(api => ({ username, token: api.options.token }));
    }
}
