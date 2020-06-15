import { D2StacksRepository } from "../repositories/D2StacksRepository";
import { PromiseRes } from "../../utils/types";
import { D2Stack } from "../entities/D2Stack";

export class GetD2Stack {
    constructor(private stacksRepository: D2StacksRepository) {}

    async execute(id: string): PromiseRes<D2Stack> {
        return this.stacksRepository.getById(id);
    }
}
