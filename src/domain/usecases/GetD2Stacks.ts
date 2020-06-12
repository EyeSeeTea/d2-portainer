import { D2StacksRepository } from "../repositories/D2StacksRepository";
import { D2Stack } from "../entities/D2Stack";
import { PromiseRes } from "../../utils/types";

export class GetD2Stacks {
    constructor(private stacksRepository: D2StacksRepository) {}

    async execute(): PromiseRes<D2Stack[]> {
        return this.stacksRepository.get();
    }
}
