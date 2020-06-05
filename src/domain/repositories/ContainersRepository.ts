import { StringEither } from "../../utils/Either";
import { D2Container } from "../entities/D2Container";

export interface ContainersRepository {
    get(options: { endpointId: number }): Promise<StringEither<D2Container[]>>;
}
