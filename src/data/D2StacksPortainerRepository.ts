import {
    D2NewStack,
    getUrlFromStringPort,
    getBranch,
    getPort,
} from "../domain/entities/D2NewStack";
import { PostStackRequest, Permission, Stack, Container } from "./PortainerApiTypes";
import _ from "lodash";
import { D2Stack } from "./../domain/entities/D2Stack";
import { D2StacksRepository, D2StackStats } from "../domain/repositories/D2StacksRepository";
import { PortainerApi } from "./PortainerApi";
import { Either } from "../utils/Either";
import config from "../config";
import { PromiseRes } from "../utils/types";
import { Acl } from "../domain/entities/Acl";

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
        const branch = getBranch(d2NewStack);
        if (!branch) return Either.error("Url not specified");
        const port = getPort(d2NewStack);
        if (!port) return Either.error("Cannot get port");

        const postStackRequest: PostStackRequest = {
            Name: name,
            RepositoryURL: repo.url,
            RepositoryReferenceName: `refs/heads/${branch}`,
            ComposeFilePathInRepository: repo.path,
            Env: [
                { name: "DHIS2_DATA_IMAGE", value: d2NewStack.dataImage },
                { name: "DHIS2_CORE_IMAGE", value: d2NewStack.coreImage },
                { name: "PORT", value: port.toString() },
            ],
        };

        const res = await this.api.createStack(postStackRequest);

        return res.match({
            error: msg => Promise.resolve(Either.error(msg)),
            success: res => {
                return this.saveAcl(res.ResourceControl.Id, d2NewStack);
            },
        });
    }

    async update(d2EditStack: D2Stack): PromiseRes<void> {
        return this.saveAcl(d2EditStack.resourceId, d2EditStack);
    }

    private async saveAcl(resourceId: number, acl: Acl): PromiseRes<void> {
        const noUserNowTeams = _(acl.userIds).isEmpty() && _(acl.teamIds).isEmpty();
        const adminOnly = acl.access === "admin" || noUserNowTeams;
        const permission: Permission = {
            AdministratorsOnly: adminOnly,
            Public: false,
            Users: adminOnly ? [] : acl.userIds,
            Teams: adminOnly ? [] : acl.teamIds,
        };

        return this.api.setPermission(resourceId, permission);
    }

    getStatsUrls(stack: D2Stack): D2StackStats {
        const baseUrl = this.api.baseUrl;
        return _.mapValues(
            stack.containers,
            container => `${baseUrl}/#/containers/${container.id}/stats`
        );
    }

    async delete(ids: string[]): PromiseRes<void> {
        return this.api.deleteStacks(ids.map(id => parseInt(id)));
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

function getAcl(apiStack: Stack) {
    const userIds = _(apiStack.ResourceControl.UserAccesses)
        .filter(ua => ua.AccessLevel === 1)
        .map(ua => ua.UserId)
        .compact()
        .value();
    const teamIds = _(apiStack.ResourceControl.TeamAccesses)
        .filter(ua => ua.AccessLevel === 1)
        .map(ua => ua.TeamId)
        .compact()
        .value();

    const acl: Acl = {
        access: apiStack.ResourceControl.AdministratorsOnly ? "admin" : "restricted",
        userIds,
        teamIds,
    };

    return acl;
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

    const env = _(apiStack.Env)
        .map(env => [env.name, env.value] as [string, string])
        .fromPairs()
        .value();

    const acl = getAcl(apiStack);
    const url = getUrlFromStringPort(env["PORT"]);

    if (!_.every(containers) || !url) return;

    const stack: D2Stack = {
        resourceId: apiStack.ResourceControl.Id,
        id: apiStack.Id.toString(),
        dataImage: env["DHIS2_DATA_IMAGE"],
        coreImage: env["DHIS2_CORE_IMAGE"],
        url,
        state: _(containers).some(c => c.State === "running") ? "running" : "stopped",
        status: containers.core.Status || "Unknown",
        containers: _.mapValues(containers, c => ({ id: c.Id, image: c.Image })),
        ...acl,
    };

    return stack;
}
