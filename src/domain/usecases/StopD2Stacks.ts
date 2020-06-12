import { D2StacksRepository } from "../repositories/D2StacksRepository";
import { StringEither, Either } from "../../utils/Either";
import { D2Stack } from "../entities/D2Stack";

export class StopD2Stacks {
    constructor(private stacksRepository: D2StacksRepository) {}

    async execute(stacks: D2Stack[]): Promise<StringEither<void>> {
        for (const stack of stacks) {
            const res = await this.stacksRepository.stop(stack);
            if (res.isError()) return res;
        }
        return Either.success(undefined);
    }
}
