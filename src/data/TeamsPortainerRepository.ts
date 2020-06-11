import { D2NewStack } from "../domain/entities/D2NewStack";
import { PostStackRequest, Permission } from "./PortainerApiTypes";
import _ from "lodash";
import { PortainerApi } from "./PortainerApi";
import { StringEither } from "../utils/Either";
import { Team } from "../domain/entities/Team";

export class TeamsPortainerRepository implements TeamsPortainerRepository {
    constructor(public api: PortainerApi) {}

    async get(): Promise<StringEither<Team[]>> {
        const res = await this.api.getTeams();
        return res.map(teams => teams.map(team => ({ id: team.Id, name: team.Name })));
    }
}
