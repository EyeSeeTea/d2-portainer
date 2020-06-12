import { D2StacksRepository } from "../repositories/D2StacksRepository";
import { StringEither, Either } from "../../utils/Either";
import { D2Stack } from "../entities/D2Stack";

type Response<T> = Promise<StringEither<T>>;
const Response = Promise; // https://github.com/microsoft/TypeScript/issues/12776#issuecomment-265885846

export class StartD2Stacks {
    constructor(private stacksRepository: D2StacksRepository) {}

    async execute(stacks: D2Stack[]): Response<void> {
        for (const stack of stacks) {
            const res = await this.stacksRepository.start(stack);
            if (res.isError()) return res;
        }
        return Either.success<string, void>(undefined);
    }
}
