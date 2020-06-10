import { ContainersRepository, D2ContainerStats } from "./../repositories/ContainersRepository";
import { D2Container } from "../entities/D2Container";

export class GetD2ContainerStats {
    constructor(private containersRepository: ContainersRepository) {}

    execute(d2Container: D2Container): D2ContainerStats {
        return this.containersRepository.getStatsUrls(d2Container);
    }
}
