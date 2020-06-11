const config = {
    appName: "WHO D2 Portainer",
    endpointName: "local",
    repository: {
        url: "http://github.com/tokland/d2-portainer-config",
        path: "docker-compose.yml",
    },
    urlMappings: [
        { url: "http://localhost:8080/dhis2", port: 8080, name: "local-dhis2" },
        { url: "http://localhost:8081", port: 8081, name: "local" },
        { url: "http://localhost:8082", port: 8082, name: "local" },
    ],
};

export default config;
