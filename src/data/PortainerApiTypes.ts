export interface Container {
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

export interface Stack {
    Id: number;
    Name: string;
    Type: number;
    EndpointId: number;
    Env: Array<{ name: string; value: string }>;
    ResourceControl: {
        Id: number;
        ResourceId: string;
        Type: number;
        UserAccesses: UserAccess[];
        TeamAccesses: TeamAccess[];
        Public: false;
        AdministratorsOnly: false;
        System: false;
    };
    ProjectPath: string;
}

export interface UserAccess {
    UserId: number;
    AccessLevel: number;
}

export interface TeamAccess {
    TeamId: number;
    AccessLevel: number;
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

export interface PostStackRequest {
    Name: string;
    RepositoryURL: string;
    RepositoryReferenceName: string;
    ComposeFilePathInRepository: string;
    Env: EnvVariable[];
}

export interface EnvVariable {
    name: string;
    value: string;
}

export interface PostStackResponse {
    Id: number;
    Name: string;
    Type: number;
    EndpointId: number;
    SwarmId: string;
    EntryPoint: string;
    Env: EnvVariable[];
    ResourceControl: {
        Id: number;
        ResourceId: string;
    };
    ProjectPath: string;
}

export interface Permission {
    AdministratorsOnly: boolean;
    Public: boolean;
    Users: number[];
    Teams: number[];
}

export interface Endpoint {
    Id: number;
    Name: "local";
    Type: number;
}

export interface Team {
    Id: number;
    Name: string;
}

export interface User {
    Id: number;
    Username: string;
}
