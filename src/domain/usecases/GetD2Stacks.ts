import { D2StacksRepository } from "../repositories/D2StacksRepository";
import { D2Stack } from "../entities/D2Stack";
import { PromiseRes } from "../../utils/types";
import { Config } from "../entities/Config";

export class GetD2Stacks {
    constructor(private stacksRepository: D2StacksRepository) {}

    async execute(config: Config): PromiseRes<D2Stack[]> {
        return this.stacksRepository.get(config);
    }
}
