import { D2NewContainer } from "./../entities/D2NewContainer";
import { ContainersRepository } from "../repositories/ContainersRepository";
import { StringEither, Either } from "../../utils/Either";
import { D2Container } from "../entities/D2Container";

export class CreateD2Container {
    constructor(private containersRepository: ContainersRepository) {}

    async execute(d2NewContainer: D2NewContainer): Promise<StringEither<void>> {
        return this.containersRepository.create(d2NewContainer);
    }
}
