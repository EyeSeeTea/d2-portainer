import { D2StacksRepository } from "../repositories/D2StacksRepository";
import { PromiseRes } from "../../utils/types";
import { D2NewStack } from "../entities/D2NewStack";
import { D2EditStack } from "../entities/D2EditStack";

export class GetD2NewStack {
    constructor(private stacksRepository: D2StacksRepository) {}

    async execute(id: string): PromiseRes<D2EditStack> {
        return this.stacksRepository.getStackForm(id);
    }
}
