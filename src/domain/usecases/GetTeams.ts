import { StringEither } from "./../../utils/Either";
import { TeamsRepository } from "./../repositories/TeamsRepository";
import { Team } from "../entities/Team";

type Response<T> = Promise<StringEither<T>>;

export class GetTeams {
    constructor(private teamsRepository: TeamsRepository) {}

    execute(): Response<Team[]> {
        return this.teamsRepository.get();
    }
}
