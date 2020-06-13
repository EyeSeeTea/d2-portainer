import { D2NewStack } from "../domain/entities/D2NewStack";
import { PostStackRequest, Permission, Stack, Container } from "./PortainerApiTypes";
import _ from "lodash";
import { D2Stack } from "./../domain/entities/D2Stack";
import { D2StacksRepository, D2StackStats } from "../domain/repositories/D2StacksRepository";
import { PortainerApi } from "./PortainerApi";
import { Either } from "../utils/Either";
import config from "../config";
import { PromiseRes } from "../utils/types";
import { D2EditStack } from "../domain/entities/D2EditStack";

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
        const baseName = "d2-docker" + d2NewStack.dataImage.replace(/dhis2-data/, "");
        const name = baseName.replace(/[^\w]/g, "");
        const { dockerComposeRepository: repo } = config;
        const branchFromPort = _(config.urlMappings)
            .map(mapping => [mapping.port, mapping.name] as [number, string])
            .fromPairs()
            .value();
        const branch = branchFromPort[d2NewStack.port];
        if (!branch) return Either.error("Cannot get granch");

        const newStackApi: PostStackRequest = {
            Name: name,
            RepositoryURL: repo.url,
            RepositoryReferenceName: `refs/heads/${branch}`,
            ComposeFilePathInRepository: repo.path,
            Env: [
                { name: "DHIS2_DATA_IMAGE", value: d2NewStack.dataImage },
                { name: "DHIS2_CORE_IMAGE", value: d2NewStack.coreImage },
                { name: "PORT", value: d2NewStack.port.toString() },
            ],
        };

        const res = await this.api.createStack(newStackApi);

        return res.match({
            error: msg => Promise.resolve(Either.error(msg)),
            success: res => {
                const d2EditStack = { ...d2NewStack, resourceId: res.ResourceControl.Id };
                return this.setPermissions(d2EditStack);
            },
        });
    }

    async update(d2EditStack: D2EditStack): PromiseRes<void> {
        return this.setPermissions(d2EditStack);
    }

    private async setPermissions(d2EditStack: D2EditStack): PromiseRes<void> {
        const adminOnly = d2EditStack.access === "admin";
        const permission: Permission = {
            AdministratorsOnly: adminOnly,
            Public: false,
            Users: adminOnly ? [] : d2EditStack.userIds,
            Teams: adminOnly ? [] : d2EditStack.teamIds,
        };

        return this.api.setPermission(d2EditStack.resourceId, permission);
    }

    getStatsUrls(stack: D2Stack): D2StackStats {
        const baseUrl = this.api.baseUrl;
        return _.mapValues(
            stack.containers,
            container => `${baseUrl}/#/containers/${container.id}/stats`
        );
    }

    async getEditStack(id: string): PromiseRes<D2EditStack> {
        const res = await this.api.getStack(parseInt(id));
        return res.map(stackApi => {
            const env = _(stackApi.Env)
                .map(env => [env.name, env.value] as [string, string])
                .fromPairs()
                .value();
            const userIds = _(stackApi.ResourceControl.UserAccesses)
                .filter(ua => ua.AccessLevel === 1)
                .map(ua => ua.UserId)
                .compact()
                .value();
            const teamIds = _(stackApi.ResourceControl.TeamAccesses)
                .filter(ua => ua.AccessLevel === 1)
                .map(ua => ua.TeamId)
                .compact()
                .value();

            const stack: D2EditStack = {
                resourceId: stackApi.ResourceControl.Id,
                dataImage: env["DHIS2_DATA_IMAGE"],
                coreImage: env["DHIS2_CORE_IMAGE"],
                port: env["PORT"] ? parseInt(env["PORT"]) : 8080,
                access: stackApi.ResourceControl.AdministratorsOnly ? "admin" : "restricted",
                userIds,
                teamIds,
            };

            return stack;
        });
    }

    async getById(id: string): PromiseRes<D2Stack> {
        const [stackRes, containersRes] = await Promise.all([
            this.api.getStack(parseInt(id)),
            this.api.getContainers({ all: true }),
        ]);

        return Either.flatMap2([stackRes, containersRes], (apiStack, apiContainers) => {
            const stack = buildD2Stack(apiContainers, apiStack);
            return stack
                ? Either.success<string, D2Stack>(stack)
                : Either.error("Cannot get stack");
        });
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

    const stack: D2Stack = {
        id: apiStack.Id.toString(),
        name: apiStack.Name,
        port: containers.gateway.Ports[0]?.PublicPort,
        state: _(containers).some(c => c.State === "running") ? "running" : "stopped",
        status: containers.core.Status || "Unknown",
        containers: _.mapValues(containers, c => ({ id: c.Id, image: c.Image })),
    };

    return stack;
}
