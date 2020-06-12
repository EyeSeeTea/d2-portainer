import { TeamsRepository } from "./../repositories/TeamsRepository";
import { Team } from "../entities/Team";
import { PromiseRes } from "../../utils/types";

export class GetTeams {
    constructor(private teamsRepository: TeamsRepository) {}

    execute(): PromiseRes<Team[]> {
        return this.teamsRepository.get();
    }
}
