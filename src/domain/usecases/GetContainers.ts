import { ContainersRepository } from "./../repositories/ContainersRepository";
import { StringEither } from "../../utils/Either";
import { D2Container } from "../entities/D2Container";

export class GetContainers {
    constructor(private containersRepository: ContainersRepository) {}

    async execute(options: { endpointId: number }): Promise<StringEither<D2Container[]>> {
        return this.containersRepository.get(options);
    }
}
