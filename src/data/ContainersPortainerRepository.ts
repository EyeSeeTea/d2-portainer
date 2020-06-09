import { D2NewContainer } from "./../domain/entities/D2NewContainer";
import { ContainerApi, NewStackApi } from "./PortainerApiTypes";
import _ from "lodash";
import { D2Container } from "./../domain/entities/D2Container";
import { ContainersRepository } from "./../domain/repositories/ContainersRepository";
import { User } from "./../domain/entities/User";
import { PortainerApi } from "./PortainerApi";
import { StringEither, Either } from "../utils/Either";

export class ContainersPortainerRepository implements ContainersRepository {
    constructor(public options: { baseUrl: string; user: User }) {}

    async stop(d2Container: D2Container): Promise<StringEither<void>> {
        const { baseUrl, user } = this.options;
        const api = new PortainerApi({ baseUrl, token: user.token });
        for (const container of d2Container.containers) {
            const res = await api.stopContainer(container.id);
            if (res.isFailure()) return res;
        }
        return Either.success(undefined);
    }

    async start(d2Container: D2Container): Promise<StringEither<void>> {
        const { baseUrl, user } = this.options;
        const api = new PortainerApi({ baseUrl, token: user.token });
        for (const container of d2Container.containers) {
            const res = await api.startContainer(container.id);
            if (res.isFailure()) return res;
        }
        return Either.success(undefined);
    }

    async create(d2NewContainer: D2NewContainer): Promise<StringEither<void>> {
        const { baseUrl, user } = this.options;
        const api = new PortainerApi({ baseUrl, token: user.token });
        const name = "d2-docker" + d2NewContainer.dataInstance.replace(/dhis2-data/, "");
        const newStackApi: NewStackApi = {
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

        return api.createStack(d2NewContainer.endpointId, newStackApi);
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
            console.log(apiContainers);
            const groups = _(apiContainers)
                .filter(c => !!c.Labels["com.eyeseetea.image-name"])
                .groupBy(c => c.Labels["com.eyeseetea.image-name"])
                .value();
            console.log(groups);

            return _.map(groups, (apiContainersForGroup, groupName) => {
                console.log(apiContainersForGroup.map(c => c.State));
                const state = _(apiContainersForGroup).every(c => c.State === "running")
                    ? "running"
                    : "stopped";

                const coreContainer = apiContainersForGroup.find(
                    c => !!c.Image.match(/dhis2-core/)
                );

                const containers = apiContainersForGroup.map(c => ({ id: c.Id, image: c.Image }));

                const d2Container: D2Container = {
                    id: groupName,
                    name: groupName,
                    port: coreContainer?.Ports[0]?.PrivatePort,
                    state,
                    status: coreContainer?.Status || "Unknown",
                    containers,
                };

                return d2Container;
            });
        });
    }
}
