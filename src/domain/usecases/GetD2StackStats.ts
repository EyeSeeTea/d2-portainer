import { D2StacksRepository, D2StackStats } from "../repositories/D2StacksRepository";
import { D2Stack } from "../entities/D2Stack";

export class GetD2StackStats {
    constructor(private stacksRepository: D2StacksRepository) {}

    execute(stack: D2Stack): D2StackStats {
        return this.stacksRepository.getStatsUrls(stack);
    }
}
