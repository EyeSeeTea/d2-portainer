export interface D2Container {
    id: string;
    name: string;
    port?: number;
    state: State;
    status: string;
}

type State = "running" | "stopped";
