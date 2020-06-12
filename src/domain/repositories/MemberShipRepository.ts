import { PromiseRes } from "../../utils/types";
import { Team } from "../entities/Team";
import { User } from "../entities/User";

export interface TeamsRepository {
    getMetadata(): PromiseRes<MembershipMetadata>;
}

export interface MembershipMetadata {
    teams: Team[];
    users: User[];
}
