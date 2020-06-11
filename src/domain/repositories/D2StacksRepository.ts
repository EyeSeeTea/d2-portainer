import { D2NewStack } from "../entities/D2NewStack";
import { StringEither } from "../../utils/Either";
import { D2Stack } from "../entities/D2Stack";

export interface D2StacksRepository {
    get(): Promise<StringEither<D2Stack[]>>;
    start(stck: D2Stack): Promise<StringEither<void>>;
    stop(stack: D2Stack): Promise<StringEither<void>>;
    create(newStack: D2NewStack): Promise<StringEither<void>>;
    getStatsUrls(stack: D2Stack): D2StackStats;
}

type Url = string;

export type D2StackStats = Record<"core" | "db" | "gateway", Url>;
