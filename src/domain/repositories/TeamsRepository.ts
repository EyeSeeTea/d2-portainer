import { Team } from "../entities/Team";
import { PromiseRes } from "../../utils/types";

export interface TeamsRepository {
    get(): PromiseRes<Team[]>;
}
