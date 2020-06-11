import { StringEither } from "./../../utils/Either";
import { TeamsRepository } from "./../repositories/TeamsRepository";
import { Team } from "../entities/Team";

export class GetTeams {
    constructor(private teamsRepository: TeamsRepository) {}

    execute(): Promise<StringEither<Team[]>> {
        return this.teamsRepository.get();
    }
}
