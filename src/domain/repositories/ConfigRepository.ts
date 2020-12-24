import { PromiseRes } from "../../utils/types";
import { Config } from "../entities/Config";

export interface ConfigRepository {
    get(): PromiseRes<Config>;
}
