import { TeamsRepository, MembershipMetadata } from "../repositories/MemberShipRepository";
import { PromiseRes } from "../../utils/types";

export class GetMembershipsMetadata {
    constructor(private teamsRepository: TeamsRepository) {}

    execute(): PromiseRes<MembershipMetadata> {
        return this.teamsRepository.getMetadata();
    }
}
