import { FeedbackToolOptions } from "./utils/feedback-tool";

const config: Config = {
    appName: "WHO D2 Portainer",
    endpointName: "local",
    dockerComposeRepository: {
        url: "http://github.com/tokland/tests",
        path: "docker-compose.yml",
        // Branch: urlMapping.name
    },
    urlMappings: [
        { url: "http://localhost:8080/dhis2", port: 8080, name: "local-dhis2" },
        { url: "http://localhost:8081", port: 8081, name: "master" },
        { url: "http://localhost:8082", port: 8082, name: "master" },
    ],
    feedback: {
        token: ["03242fc6b0c5a48582", "2e6b8d3e8337b5a0b95fe2"],
        createIssue: true,
        issues: {
            repository: "EyeSeeTea/d2-portainer",
            title: "[User feedback] {title}",
            body: "{body}",
        },
        snapshots: {
            repository: "EyeSeeTeaBotTest/snapshots",
            branch: "master",
        },
        feedbackOptions: {
            descriptionTemplate:
                "## Summary\n\n## Steps to reproduce\n\n## Actual results\n\n## Expected results\n\n",
        },
    },
};

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

export default config;
