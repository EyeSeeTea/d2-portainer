export type Access = "restricted" | "admin";

export interface Acl {
    access: Access;
    teamIds: number[];
    userIds: number[];
}
