import { ContainersRepository } from "../repositories/ContainersRepository";
import { StringEither, Either } from "../../utils/Either";
import { D2Container } from "../entities/D2Container";

export class StopD2Containers {
    constructor(private containersRepository: ContainersRepository) {}

    async execute(d2Containers: D2Container[]): Promise<StringEither<void>> {
        for (const d2Container of d2Containers) {
            const res = await this.containersRepository.stop(d2Container);
            if (res.isFailure()) return res;
        }
        return Either.success(undefined);
    }
}
