import { FeedbackToolOptions } from "./utils/feedback-tool";

export interface Config {
    appName: string;
    endpointName: string;
    dockerComposeRepository: {
        url: string;
        path: string;
    };
    urlMappings: UrlMapping[];
    feedback: FeedbackToolOptions;
}

export interface UrlMapping {
    url: string;
    port: number;
    name: string;
}
