import _ from "lodash";
import { Container } from "./Container";

export interface D2Container {
    id: string;
    name: string;
    port?: number;
    state: State;
    status: string;
    containers: Record<ContainerType, Container>;
}

export type ContainerType = "core" | "gateway" | "db";

export type State = "running" | "stopped";

export class D2ContainerMethods {
    constructor(public d2Container: D2Container) {}

    static filterContainers(containers: D2Container[], search: string): D2Container[] {
        const searchLowerCase = search.trim().toLowerCase();
        return searchLowerCase
            ? containers.filter(container => container.name.toLowerCase().includes(searchLowerCase))
            : containers;
    }

    static isStopped(d2Containers: D2Container[]): boolean {
        return _(d2Containers).every(c => c.state === "stopped");
    }

    static isRunning(d2Containers: D2Container[]): boolean {
        return _(d2Containers).every(c => c.state === "running");
    }

    static getById(d2Containers: D2Container[], containerIds: string[]): D2Container[] {
        return d2Containers.filter(c => containerIds.includes(c.id));
    }
}
