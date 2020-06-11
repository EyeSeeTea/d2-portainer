import { D2StacksRepository } from "../repositories/D2StacksRepository";
import { StringEither } from "../../utils/Either";
import { D2Stack } from "../entities/D2Stack";

export class GetD2Stacks {
    constructor(private stacksRepository: D2StacksRepository) {}

    async execute(): Promise<StringEither<D2Stack[]>> {
        return this.stacksRepository.get();
    }
}
