Manage d2-docker containers using Portainer.

## Setup

### Portainer

Download and start a portainer instance on http://localhost:9000 (agent at :8000) with user `admin/123123123` (`htpasswd` is an Apache helper tool):

```
# create a separate folder for portainer, and inside...
$ wget https://github.com/portainer/portainer/releases/download/1.24.0/portainer-1.24.0-linux-amd64.tar.gz
$ tar -xvzf portainer-1.24.0-linux-amd64.tar.gz
```

Let's check that it works (use a user with permissions for /var/run/docker.sock or root):

```
$ cd portainer
$ sudo ./portainer --bind :9000 --tunnel-port 8000 --data data --assets . --template-file templates.json --admin-password=$(htpasswd -nb -B admin 123123123 | cut -d ":" -f2)
```

We tipically need that portainer starts on boot. We can use supervisor for that. Change `ubuntu` if you want to run the daemon with another user:

```
# /etc/supervisor/conf.d/portainer.conf (or .ini on some distros)
[program:portainer]
user = ubuntu
directory = /path/to/portainer
command = /path/to/portainer/portainer --bind :9000 --tunnel-port 8000 --data data --assets . --template-file templates.json
autostart = true
autorestart = true
stdout_capture_maxbytes = 50MB
stderr_capture_maxbytes = 50MB
stdout_logfile = /path/to/portainer/logs/stdout.log
stderr_logfile = /path/to/portainer/logs/stderr.log
# Uncomment if you have HTTP proxy
# environment=http_proxy="yourproxy",https_proxy="yourproxy",no_proxy="localhost,127.0.0.1"
```

```
$ sudo mkdir /path/to/portainer/logs
$ chown -R ubuntu:ubuntu /path/to/portainer-folder
```

Installing supervisor

```
$ yum install supervisor
or
$ apt install supervisor

$ sudo service supervisord start
```

Reloading config

```
$ sudo supervisorctl reload
```

Should answer with status as follows:

```
# supervisorctl status
portainer                        RUNNING   pid 1162, uptime 0:00:07
```

Note that we cannot use docker image _portainer/portainer_ because stack creations using docker-compose won't be able to access files inside the docker where the repo is checked out from the host docker.

Now create the required metadata. To do so, please connect using a browser to localhost:9000. Then:

-   Connect to "Local (Manage the local Docker environment)".
-   Create users.
-   Create teams.
-   Update the default local Docker endpoint (name: `local`) and assign to those teams with access rights.
-   Registries -> DockerHub: Configure auth.

### Webapp

Edit property `urlMappingsSource` and `urlMappings` in `src/config.ts` with the available Dhis2 Instances.

```
$ yarn install
$ PUBLIC_URL=/d2-portainer REACT_APP_PORTAINER_URL=/portainer yarn build
```

Change `PUBLIC_URL` and `REACT_APP_PORTAINER_URL` to match your server configuration.

## Nginx

Serve production at http://localhost:9001 with wrappings to portainer (port 9000):

```
http {
    server {
        listen 9001;
        server_name localhost;

        location /portainer/ {
            proxy_pass   http://127.0.0.1:9000/;
        }

        location / {
            alias /path/to/d2-portainer/build;
        }
    }
}
```

Make sure nginx user (typically `www-data`) can access the build folder.

## Apache

```
<VirtualHost *:9001>
    Proxypass /portainer/ http://localhost:9000/
    ProxypassReverse /portainer/ http://localhost:9000/
    Alias / /path/to/d2-portainer/build/

    <Directory /path/to/d2-portainer/build>
      DirectoryIndex index.html
      AllowOverride All
      Options FollowSymlinks SymLinksIfOwnerMatch
      Order allow,deny
      Allow from all
    </Directory>
</VirtualHost>
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
