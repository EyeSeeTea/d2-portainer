import { D2NewContainer } from "./../domain/entities/D2NewContainer";
import { ContainerApi, PostStackRequest, Permission } from "./PortainerApiTypes";
import _ from "lodash";
import { D2Container } from "./../domain/entities/D2Container";
import {
    ContainersRepository,
    D2ContainerStats,
} from "./../domain/repositories/ContainersRepository";
import { User } from "./../domain/entities/User";
import { PortainerApi } from "./PortainerApi";
import { StringEither, Either } from "../utils/Either";

export class ContainersPortainerRepository implements ContainersRepository {
    constructor(public options: { baseUrl: string; user: User }) {}

    async stop(d2Container: D2Container): Promise<StringEither<void>> {
        const { baseUrl, user } = this.options;
        const api = new PortainerApi({ baseUrl, token: user.token });
        for (const container of _.values(d2Container.containers)) {
            const res = await api.stopContainer(container.id);
            if (res.isFailure()) return res;
        }
        return Either.success(undefined);
    }

    async start(d2Container: D2Container): Promise<StringEither<void>> {
        const { baseUrl, user } = this.options;
        const api = new PortainerApi({ baseUrl, token: user.token });
        for (const container of _.values(d2Container.containers)) {
            const res = await api.startContainer(container.id);
            if (res.isFailure()) return res;
        }
        return Either.success(undefined);
    }

    async create(d2NewContainer: D2NewContainer): Promise<StringEither<void>> {
        const { baseUrl, user } = this.options;
        const api = new PortainerApi({ baseUrl, token: user.token });
        const name = "d2-docker" + d2NewContainer.dataInstance.replace(/dhis2-data/, "");
        const newStackApi: PostStackRequest = {
            Name: name,
            RepositoryURL: "https://github.com/tokland/tests",
            RepositoryReferenceName: "refs/heads/master",
            ComposeFilePathInRepository: "docker-compose.yml",
            Env: [
                { name: "DHIS2_DATA_IMAGE", value: d2NewContainer.dataInstance },
                { name: "DHIS2_CORE_IMAGE", value: d2NewContainer.coreInstance },
                { name: "PORT", value: d2NewContainer.port.toString() },
            ],
        };

        const res = await api.createStack(d2NewContainer.endpointId, newStackApi);

        return res.match({
            error: msg => Promise.resolve(Either.error(msg)),
            success: res => {
                const permission: Permission = {
                    AdministratorsOnly: false,
                    Public: false,
                    Users: [],
                    Teams: d2NewContainer.teamIds,
                };

                return api.setPermission(res.ResourceControl.Id, permission);
            },
        });
    }

    getStatsUrls(d2Container: D2Container): D2ContainerStats {
        const { baseUrl } = this.options;
        return _.mapValues(
            d2Container.containers,
            container => `${baseUrl}/#/containers/${container.id}/stats`
        );
    }

    async get(options: { endpointId: number }): Promise<StringEither<D2Container[]>> {
        const { baseUrl, user } = this.options;
        const api = new PortainerApi({ baseUrl, token: user.token });

        return (
            await api.getContainers({
                endpointId: options.endpointId,
                all: true,
            })
        ).map(apiContainers => {
            const groups = _(apiContainers)
                .filter(c => !!c.Labels["com.eyeseetea.image-name"])
                .groupBy(c => c.Labels["com.eyeseetea.image-name"])
                .value();

            const d2Containers = _.map(groups, (apiContainersForGroup, groupName) => {
                const containersByService = _.keyBy(
                    apiContainersForGroup,
                    c => c.Labels["com.docker.compose.service"]
                );

                const containers = {
                    core: containersByService["core"],
                    gateway: containersByService["gateway"],
                    db: containersByService["db"],
                };

                if (!_.every(containers)) return;

                const state = _(containers).some(c => c.State === "running")
                    ? "running"
                    : "stopped";

                const d2Container: D2Container = {
                    id: groupName,
                    name: groupName,
                    port: containers.core.Ports[0]?.PrivatePort,
                    state,
                    status: containers.core.Status || "Unknown",
                    containers: _.mapValues(containers, c => ({ id: c.Id, image: c.Image })),
                };

                return d2Container;
            });

            return _.compact(d2Containers);
        });
    }
}
