import { User } from "./../entities/User";
import { UsersRepository } from "./../repositories/UsersRepository";
import { StringEither } from "../../utils/Either";

export class LoginUser {
    constructor(private usersRepository: UsersRepository) {}

    public async execute(username: string, password: string): Promise<StringEither<User>> {
        return this.usersRepository.login(username, password);
    }
}
