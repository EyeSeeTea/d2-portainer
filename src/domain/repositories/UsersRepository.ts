import { User } from "./../entities/User";
import { StringEither } from "../../utils/Either";

export interface UsersRepository {
    login(username: string, password: string): Promise<StringEither<User>>;
}
