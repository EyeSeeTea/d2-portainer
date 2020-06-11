const config = {
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
};

export default config;
