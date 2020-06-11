import { StringEither } from "../../utils/Either";
import { Team } from "../entities/Team";

export interface TeamsRepository {
    get(): Promise<StringEither<Team[]>>;
}
