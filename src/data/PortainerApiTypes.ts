export interface ContainerApi {
    Command: string;
    Created: number;
    HostConfig: HostConfig;
    Id: string;
    Image: string;
    ImageID: string;
    Labels: Record<string, string>;
    Mounts: Mount[];
    Names: string[];
    NetworkSettings: NetworkSettings;
    Ports: Port[];
    State: State;
    Status: string;
}

type State = "created" | "exited" | "running";

interface Port {
    Type: "tcp" | "udp";
    PrivatePort: number;
    IP?: string;
    PublicPort?: number;
}

interface NetworkSettings {
    Networks: Networks;
}

interface Networks {
    bridge: Bridge;
}

interface Bridge {
    Aliases?: any;
    DriverOpts?: any;
    EndpointID: string;
    Gateway: string;
    GlobalIPv6Address: string;
    GlobalIPv6PrefixLen: number;
    IPAMConfig?: any;
    IPAddress: string;
    IPPrefixLen: number;
    IPv6Gateway: string;
    Links?: any;
    MacAddress: string;
    NetworkID: string;
}

interface Mount {
    Destination: string;
    Mode: string;
    Propagation: string;
    RW: boolean;
    Source: string;
    Type: string;
}

interface HostConfig {
    NetworkMode: string;
}

export interface NewStackApi {
    Name: string;
    RepositoryURL: string;
    RepositoryReferenceName: string;
    ComposeFilePathInRepository: string;
    Env: Array<{ name: string; value: string }>;
}
