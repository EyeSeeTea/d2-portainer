import { D2Stack } from "./../entities/D2Stack";
import { PromiseRes } from "./../../utils/types";
import { D2StacksRepository } from "../repositories/D2StacksRepository";

export class UpdateD2Stacks {
    constructor(private stacksRepository: D2StacksRepository) {}

    async execute(d2NewStack: D2Stack): PromiseRes<void> {
        return this.stacksRepository.update(d2NewStack);
    }
}
