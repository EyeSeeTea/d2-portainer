import { D2NewContainer } from "./../entities/D2NewContainer";
import { StringEither } from "../../utils/Either";
import { D2Container } from "../entities/D2Container";

export interface ContainersRepository {
    get(options: { endpointId: number }): Promise<StringEither<D2Container[]>>;
    start(d2Container: D2Container): Promise<StringEither<void>>;
    stop(d2Container: D2Container): Promise<StringEither<void>>;
    create(d2NewContainer: D2NewContainer): Promise<StringEither<void>>;
    getStatsUrls(d2Container: D2Container): D2ContainerStats;
}

type Url = string;

export type D2ContainerStats = Record<"core" | "db" | "gateway", Url>;
