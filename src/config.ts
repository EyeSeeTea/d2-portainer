import { BaseConfig } from "./domain/entities/Config";

const baseConfig: BaseConfig = {
    appName: "WHO D2 Portainer",
    endpointName: "local",
    dockerComposeRepository: {
        url: "http://github.com/tokland/d2-portainer-config",
        path: "docker-compose.yml",
        // Final branch: `urlMapping.branch || defaultBranch || urlMapping.name`.
        defaultBranch: "https-generic",
    },
    urlMappingsSource: {
        type: "url",
        url: "https://raw.githubusercontent.com/eyeseetea/d2-portainer-config/master/config.json",
    },
    urlMappings: [
        //{ name: "who", url: "https://dev.eyeseetea.com/who", port: 8080 },
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

export default baseConfig;
