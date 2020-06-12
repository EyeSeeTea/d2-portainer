import { D2NewStack } from "../domain/entities/D2NewStack";
import { PostStackRequest, Permission, Stack, Container } from "./PortainerApiTypes";
import _ from "lodash";
import { D2Stack } from "./../domain/entities/D2Stack";
import { D2StacksRepository, D2StackStats } from "../domain/repositories/D2StacksRepository";
import { PortainerApi } from "./PortainerApi";
import { Either } from "../utils/Either";
import config from "../config";
import { PromiseRes } from "../utils/types";

export class D2StacksPortainerRepository implements D2StacksRepository {
    constructor(public api: PortainerApi) {}

    async stop(stack: D2Stack): PromiseRes<void> {
        for (const container of _.values(stack.containers)) {
            const res = await this.api.stopContainer(container.id);
            if (res.isError()) return res;
        }
        return Either.success(undefined);
    }

    async start(stack: D2Stack): PromiseRes<void> {
        for (const container of _.values(stack.containers)) {
            const res = await this.api.startContainer(container.id);
            if (res.isError()) return res;
        }
        return Either.success(undefined);
    }

    async create(d2NewStack: D2NewStack): PromiseRes<void> {
        const baseName = "d2-docker" + d2NewStack.dataInstance.replace(/dhis2-data/, "");
        const name = baseName.replace(/[^\w]/g, "");
        const { dockerComposeRepository: repo } = config;
        const newStackApi: PostStackRequest = {
            Name: name,
            RepositoryURL: repo.url,
            RepositoryReferenceName: `refs/heads/${d2NewStack.branch}`,
            ComposeFilePathInRepository: repo.path,
            Env: [
                { name: "DHIS2_DATA_IMAGE", value: d2NewStack.dataInstance },
                { name: "DHIS2_CORE_IMAGE", value: d2NewStack.coreInstance },
                { name: "PORT", value: d2NewStack.port.toString() },
            ],
        };

        const res = await this.api.createStack(newStackApi);

        return res.match({
            error: msg => Promise.resolve(Either.error(msg)),
            success: res => {
                const permission: Permission = {
                    AdministratorsOnly: false,
                    Public: false,
                    Users: [],
                    Teams: d2NewStack.teamIds,
                };

                return this.api.setPermission(res.ResourceControl.Id, permission);
            },
        });
    }

    getStatsUrls(stack: D2Stack): D2StackStats {
        const baseUrl = this.api.baseUrl;
        return _.mapValues(
            stack.containers,
            container => `${baseUrl}/#/containers/${container.id}/stats`
        );
    }

    async get(): PromiseRes<D2Stack[]> {
        const [stacksRes, containersRes] = await Promise.all([
            this.api.getStacks(),
            this.api.getContainers({ all: true }),
        ]);

        return Either.map2([stacksRes, containersRes], (apiStacks, apiContainers) => {
            return _(apiStacks)
                .map(apiStack => buildD2Stack(apiContainers, apiStack))
                .compact()
                .value();
        });
    }
}

function buildD2Stack(apiContainers: Container[], apiStack: Stack): D2Stack | undefined {
    const apiContainersForGroup = _(apiContainers)
        .filter(c => c.Labels["com.docker.compose.project"] === apiStack.Name)
        .value();

    const containersByService = _(apiContainersForGroup)
        .keyBy(c => c.Labels["com.docker.compose.service"])
        .value();

    const containers = {
        core: containersByService["core"],
        gateway: containersByService["gateway"],
        db: containersByService["db"],
    };

    if (!_.every(containers)) return;

    const state = _(containers).some(c => c.State === "running") ? "running" : "stopped";
    console.log(containers);

    const stack: D2Stack = {
        id: apiStack.Id.toString(),
        name: apiStack.Name,
        port: containers.gateway.Ports[0]?.PublicPort,
        state,
        status: containers.core.Status || "Unknown",
        containers: _.mapValues(containers, c => ({ id: c.Id, image: c.Image })),
    };

    return stack;
}
