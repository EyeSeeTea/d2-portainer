import { D2EditStack } from "./../entities/D2EditStack";
import { PromiseRes } from "./../../utils/types";
import { D2StacksRepository } from "../repositories/D2StacksRepository";

export class UpdateD2Stacks {
    constructor(private stacksRepository: D2StacksRepository) {}

    async execute(d2NewStack: D2EditStack): PromiseRes<void> {
        return this.stacksRepository.update(d2NewStack);
    }
}
