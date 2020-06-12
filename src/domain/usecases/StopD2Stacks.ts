import { D2StacksRepository } from "../repositories/D2StacksRepository";
import { Either } from "../../utils/Either";
import { D2Stack } from "../entities/D2Stack";
import { PromiseRes } from "../../utils/types";

export class StopD2Stacks {
    constructor(private stacksRepository: D2StacksRepository) {}

    async execute(stacks: D2Stack[]): PromiseRes<void> {
        for (const stack of stacks) {
            const res = await this.stacksRepository.stop(stack);
            if (res.isError()) return res;
        }
        return Either.success(undefined);
    }
}
