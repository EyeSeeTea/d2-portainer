import _ from "lodash";
import { Container } from "./Container";
import { Acl } from "./Acl";

export interface D2Stack extends Acl {
    id: string;
    port: number | undefined;
    dataImage: string;
    coreImage: string;
    state: State;
    status: string;
    containers: Record<ContainerType, Container>;
    resourceId: number;
}

export type ContainerType = "core" | "gateway" | "db";

export type State = "running" | "stopped";

export class D2StackMethods {
    constructor(public stack: D2Stack) {}

    static filterStacks(stacks: D2Stack[], search: string): D2Stack[] {
        const searchLowerCase = search.trim().toLowerCase();
        return searchLowerCase
            ? stacks.filter(stack => stack.dataImage.toLowerCase().includes(searchLowerCase))
            : stacks;
    }

    static isStopped(stacks: D2Stack[]): boolean {
        return _(stacks).every(c => c.state === "stopped");
    }

    static isRunning(stacks: D2Stack[]): boolean {
        return _(stacks).every(c => c.state === "running");
    }

    static getById(stacks: D2Stack[], ids: string[]): D2Stack[] {
        return stacks.filter(c => ids.includes(c.id));
    }
}
