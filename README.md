Control d2-docker containers using portainer

## Setup

### Portainer

Download and start a portainer instance on http://localhost:9000 (agent at :8000) with user `admin/123123123` (`htpasswd` is an Apache helper tool):

```
# create a separate folder for portainer, and inside...
$ wget https://github.com/portainer/portainer/releases/latest/download/portainer-1.24.0-linux-amd64.tar.gz
$ tar -xvzf portainer-1.24.0-linux-amd64.tar.gz
# (use a user with permissions for /var/run/docker.sock or root)
$ sudo ./portainer --bind :9000 --tunnel-port 8000 --data data --assets . --template-file templates.json --admin-password=$(htpasswd -nb -B admin 123123123 | cut -d ":" -f2)
```

Start on boot-up, using supervisor:

Create the following file in `/path/to/portainer-folder/portainer.ini`:

```
[program:portainer]
user = user
directory = /path/to/portainer-folder/portainer
command = /path/to/portainer-folder/portainer --bind :9000 --tunnel-port 8000 --data data --assets . --template-file templates.json
autostart = true
autorestart = true
stdout_capture_maxbytes = 50MB
stderr_capture_maxbytes = 50MB
stdout_logfile = /path/to/portainer-folder/logs/stdout.log
stderr_logfile = /path/to/portainer-folder/logs/stderr.log
#environment=http_proxy="yourproxy",https_proxy="yourproxy",no_proxy="localhost,127.0.0.1"
```

```
$ sudo mkdir /path/to/portainer-folder/logs
$ chown -R user:user /path/to/portainer-folder
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
$ sudo supervisorctl status
```

Should answer with status as follows:
```
# supervisorctl status
portainer                        RUNNING   pid 1162, uptime 0:00:07
```

Note that we cannot use docker _portainer/portainer_ because stack creations using docker-compose won't be able to access files inside the docker where the repo is checked out from the host docker.

Now create the required metadata. To do so, please connect using a browser to localhost:9000. Then:
-   Create users.
-   Create teams.
-   Create a local Docker endpoint (name: `local`) and assign to those teams with access rights.
-   Registries -> DockerHub: Configure auth.

### Webapp

First edit the available URLs for the given server in 
src/config.ts


Being sure that we have node in 8+ version...
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

## Apache

```
<VirtualHost *:9003>
    Proxypass /portainer/ http://localhost:9000/
    ProxypassReverse /portainer/ http://localhost:9000/
    Alias / /path/to/d2-portainer-folder/build/
    <Directory /path/to/d2-portainer-folder/build>
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
