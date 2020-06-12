import { PromiseRes } from "./../../utils/types";
import { D2NewStack } from "../entities/D2NewStack";
import { D2StacksRepository } from "../repositories/D2StacksRepository";

export class CreateD2Stacks {
    constructor(private stacksRepository: D2StacksRepository) {}

    async execute(d2NewStack: D2NewStack): PromiseRes<void> {
        return this.stacksRepository.create(d2NewStack);
    }
}
