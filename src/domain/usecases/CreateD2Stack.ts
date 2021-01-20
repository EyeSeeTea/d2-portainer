import { PromiseRes } from "./../../utils/types";
import { D2NewStack } from "../entities/D2NewStack";
import { D2StacksRepository, MaybeWarnings } from "../repositories/D2StacksRepository";
import { Config } from "../entities/Config";

export class CreateD2Stacks {
    constructor(private stacksRepository: D2StacksRepository) {}

    async execute(d2NewStack: D2NewStack, config: Config): PromiseRes<MaybeWarnings<void>> {
        return this.stacksRepository.create(d2NewStack, config);
    }
}
