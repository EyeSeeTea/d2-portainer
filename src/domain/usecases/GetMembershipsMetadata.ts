import { MembershipRepository, MembershipMetadata } from "../repositories/MembershipRepository";
import { PromiseRes } from "../../utils/types";

export class GetMembershipsMetadata {
    constructor(private membershipRepository: MembershipRepository) {}

    execute(): PromiseRes<MembershipMetadata> {
        return this.membershipRepository.getMetadata();
    }
}
