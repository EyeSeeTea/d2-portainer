import { D2NewStack } from "../entities/D2NewStack";
import { D2StacksRepository } from "../repositories/D2StacksRepository";
import { StringEither } from "../../utils/Either";

export class CreateD2Stacks {
    constructor(private stacksRepository: D2StacksRepository) {}

    async execute(d2NewStack: D2NewStack): Promise<StringEither<void>> {
        return this.stacksRepository.create(d2NewStack);
    }
}
