import _ from "lodash";
import { Container } from "./Container";

type Access = "restricted" | "admin";

export interface Acl {
    access: "restricted" | "admin";
    teamIds: number[];
    userIds: number[];
}
