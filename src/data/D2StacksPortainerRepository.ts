import { D2NewStack } from "../domain/entities/D2NewStack";
import { PostStackRequest, Permission } from "./PortainerApiTypes";
import _ from "lodash";
import { D2Stack } from "./../domain/entities/D2Stack";
import { D2StacksRepository, D2StackStats } from "../domain/repositories/D2StacksRepository";
import { PortainerApi } from "./PortainerApi";
import { StringEither, Either } from "../utils/Either";
import config from "../config";

export class D2StacksPortainerRepository implements D2StacksRepository {
    constructor(public api: PortainerApi) {}

    async stop(stack: D2Stack): Promise<StringEither<void>> {
        for (const container of _.values(stack.containers)) {
            const res = await this.api.stopContainer(container.id);
            if (res.isFailure()) return res;
        }
        return Either.success(undefined);
    }

    async start(stack: D2Stack): Promise<StringEither<void>> {
        for (const container of _.values(stack.containers)) {
            const res = await this.api.startContainer(container.id);
            if (res.isFailure()) return res;
        }
        return Either.success(undefined);
    }

    async create(d2NewStack: D2NewStack): Promise<StringEither<void>> {
        const name = "d2-docker" + d2NewStack.dataInstance.replace(/dhis2-data/, "");
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

    async get(): Promise<StringEither<D2Stack[]>> {
        const [stacksRes, containersRes] = await Promise.all([
            this.api.getStacks(),
            this.api.getContainers({ all: true }),
        ]);

        return Either.map2([stacksRes, containersRes], (apiStacks, apiContainers) => {
            const stacks: Array<D2Stack | undefined> = apiStacks.map(apiStack => {
                const apiContainersForGroup = _(apiContainers)
                    .filter(c => c.Labels["com.docker.compose.project"] == apiStack.Name)
                    .value();

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

                const stack: D2Stack = {
                    id: apiStack.Id.toString(),
                    name: apiStack.Name,
                    port: containers.core.Ports[0]?.PrivatePort,
                    state,
                    status: containers.core.Status || "Unknown",
                    containers: _.mapValues(containers, c => ({ id: c.Id, image: c.Image })),
                };

                return stack;
            });

            return _.compact(stacks);
        });
    }
}
