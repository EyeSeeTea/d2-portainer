import { FeedbackToolOptions } from "../../utils/feedback-tool";

export interface BaseConfig {
    appName: string;
    endpointName: string;
    dockerComposeRepository: {
        url: string;
        path: string;
        defaultBranch?: string;
    };
    urlMappingsSource?: { type: "static" } | { type: "url"; url: string };
    urlMappings: UrlMapping[];
    feedback: FeedbackToolOptions;
}

export type Config = Omit<BaseConfig, "urlMappingsSource">;

export interface UrlMapping {
    url: string;
    port: number;
    name: string;
    branch?: string;
}

export type RemoteConfig = Pick<BaseConfig, "urlMappings">;
