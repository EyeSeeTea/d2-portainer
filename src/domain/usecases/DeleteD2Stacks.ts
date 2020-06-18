import { D2StacksRepository } from "../repositories/D2StacksRepository";
import { PromiseRes } from "../../utils/types";

export class DeleteD2Stacks {
    constructor(private stacksRepository: D2StacksRepository) {}

    async execute(ids: string[]): PromiseRes<void> {
        return this.stacksRepository.delete(ids);
    }
}
