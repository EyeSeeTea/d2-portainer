import { MembershipMetadata } from "../domain/repositories/MembershipRepository";
import { PortainerApi } from "./PortainerApi";
import { PromiseRes } from "../utils/types";
import { Either } from "../utils/Either";

export class MembershipPortainerRepository implements MembershipPortainerRepository {
    constructor(public api: PortainerApi) {}

    async getMetadata(): PromiseRes<MembershipMetadata> {
        const [teamsRes, usersRes] = await Promise.all([this.api.getTeams(), this.api.getUsers()]);

        return Either.map2([teamsRes, usersRes], (apiTeams, apiUsers) => {
            return {
                users: apiUsers.map(user => ({ id: user.Id, name: user.Username })),
                teams: apiTeams.map(team => ({ id: team.Id, name: team.Name })),
            };
        });
    }
}
