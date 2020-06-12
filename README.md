Control d2-docker containers using portainer

## Setup

### Portainer

Download and start a portainer instance on http://localhost:9000 (agent at :8000) with user `admin/123123123`:

```
$ wget https://github.com/portainer/portainer/releases/latest/download/portainer-1.24.0-linux-amd64.tar.gz
$ sudo ./portainer --bind :9000 --tunnel-port 8000 --data data --assets . --template-file templates.json --admin-password=$(htpasswd -nb -B admin 123123123 | cut -d ":" -f2)
```

Note that we cannot use docker _portainer/portainer_ because stack creations using docker-compose won't be able to access files inside the docker where the repo is checked out from the host docker.

Now create the required metadata:

-   Create users.
-   Create teams.
-   Create an endpoint (Docker local) and assign teams that should be able to access it.
-   Registries -> DockerHub: Configure auth.

### Webapp

```
$ yarn install
$ yarn build
```

## Nginx

Serve production at http://localhost:9003 with wrappings to portainer and the deployed webapp.

```
http {
    server {
        listen 9003;
        server_name localhost;

        location /portainer/ {
            proxy_pass   http://127.0.0.1:9000/;
        }

        location / {
            alias /path/to/webapp/build;
        }
    }
}
```

## Development

### Nginx

```
http {
    server {
        listen 9002;
        server_name localhost;

        location /portainer/ {
            proxy_pass http://127.0.0.1:9000/;
        }

        location / {
            proxy_pass http://127.0.0.1:8081/;
        }
    }
}
```

### Webapp

```
$ REACT_APP_PORTAINER_URL=http://localhost:9002/portainer PORT=8081 yarn start
```

The app in development mode is now accessible at http://localhost:9002.
