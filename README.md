Control d2-docker containers using portainer

## Setup

### Portainer

Start a portainer instance on http://localhost:9000 (agent at :8000) with user `admin/123123123`:

TODO: Change to direct portainer

```
$ docker run -p 9000:9000 -p 8000:8000 --name portainer --restart always -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer --admin-password=$(htpasswd -nb -B admin 123123123 | cut -d ":" -f2)
```

-   Create users.
-   Create teams.
-   Create endpoint (to local) and assign to teams.
-   Registries -> DockerHub: Configure auth.

## Nginx

Serve production at http://localhost:9003:

```
http {
    server {
        listen 9001;
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

### Webapp

```
$ yarn install
$ yarn build
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
