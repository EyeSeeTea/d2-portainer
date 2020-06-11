export interface D2NewStack {
    branch: string;
    dataInstance: string;
    coreInstance: string;
    port: number;
    access: "restricted" | "admin";
    teamIds: number[];
}
