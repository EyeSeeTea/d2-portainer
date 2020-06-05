import _ from "lodash";
import { D2Container } from "./../domain/entities/D2Container";
import { ContainersRepository } from "./../domain/repositories/ContainersRepository";
import { User } from "./../domain/entities/User";
import { PortainerApi } from "./PortainerApi";
import { StringEither } from "../utils/Either";

export class ContainersPortainerRepository implements ContainersRepository {
    constructor(public options: { baseUrl: string; user: User }) {}

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
                .groupBy(c => c.Labels["com.eyeseetea.image-name"])
                .omit(["undefined"])
                .value();
            console.log({ groups });

            return _.map(groups, (apiContainersForGroup, groupName) => {
                const state = _(apiContainersForGroup).every(c => c.State === "running")
                    ? "running"
                    : "stopped";

                const coreContainer = apiContainersForGroup.find(
                    c => !!c.Image.match(/dhis2-core/)
                );

                const d2Container: D2Container = {
                    id: groupName,
                    name: groupName,
                    port: coreContainer?.Ports[0]?.PrivatePort,
                    state,
                    status: coreContainer?.Status || "Unknown",
                };
                return d2Container;
            });
        });
    }
}
