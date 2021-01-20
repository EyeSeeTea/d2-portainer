import { PromiseRes } from "../../utils/types";
import { Config } from "../entities/Config";
import { ConfigRepository } from "../repositories/ConfigRepository";

export class GetConfig {
    constructor(private configRepository: ConfigRepository) {}

    async execute(): PromiseRes<Config> {
        return this.configRepository.get();
    }
}
