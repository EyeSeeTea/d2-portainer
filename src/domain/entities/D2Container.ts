import { Container } from "./Container";

export interface D2Container {
    id: string;
    name: string;
    port?: number;
    state: State;
    status: string;
    containers: Container[];
}

type State = "running" | "stopped";

export function filterContainers(containers: D2Container[], search: string): D2Container[] {
    const searchLowerCase = search.trim().toLowerCase();
    return searchLowerCase
        ? containers.filter(container => container.name.toLowerCase().includes(searchLowerCase))
        : containers;
}
