import { PortainerApi } from "./PortainerApi";
import { Team } from "../domain/entities/Team";
import { PromiseRes } from "../utils/types";

export class TeamsPortainerRepository implements TeamsPortainerRepository {
    constructor(public api: PortainerApi) {}

    async get(): PromiseRes<Team[]> {
        const res = await this.api.getTeams();
        return res.map(teams => teams.map(team => ({ id: team.Id, name: team.Name })));
    }
}
