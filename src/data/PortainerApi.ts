import axios, { AxiosRequestConfig } from "axios";
import _ from "lodash";
import { Either, StringEither } from "../utils/Either";
import {
    ContainerApi,
    PostStackRequest,
    PostStackResponse,
    Permission,
    Endpoint,
} from "./PortainerApiTypes";

type Token = string;
type LoginResponseSuccess = { jwt: Token };
type LoginResponseError = { message: string; details: string };
type LoginResponse = LoginResponseSuccess | LoginResponseError;

type ApiRes<T> = StringEither<T>;

export interface ConstructorOptions {
    baseUrl: string;
}

type State = { type: "not-logged" } | { type: "logged"; endpointId: number; token: string };

export class PortainerApi {
    public apiUrl: string;
    public state: State;

    constructor(public options: ConstructorOptions, state?: State) {
        this.apiUrl = `${options.baseUrl}/api`;
        this.state = state || { type: "not-logged" };
    }

    private getLoggedInData() {
        if (this.state.type != "logged") {
            throw new Error("Not logged in");
        } else {
            return this.state;
        }
    }

    private async request<T>(
        method: AxiosRequestConfig["method"],
        url: string,
        baseRequest: AxiosRequestConfig = {},
        token?: string
    ) {
        const token2 = token || this.token;
        const request = { ...baseRequest, method, url: this.getUrl(url) };

        const response = await axios({
            method: "GET",
            headers: { Authorization: `Bearer ${token2}` },
            validateStatus: _status => true,
            ...request,
        });
        const { status } = response;

        if ((status >= 200 && status < 300) || [304].includes(status)) {
            return Either.success<string, T>(response.data as T);
        } else {
            const msg = _.compact([status, JSON.stringify(response.data)]).join(" - ");
            return Either.error(msg);
        }
    }

    private getUrl(path: string): string {
        const path2 = path.startsWith("/") ? path : `/${path}`;
        return this.apiUrl + path2;
    }

    /* Public interface */

    get baseUrl() {
        return this.options.baseUrl;
    }

    get token() {
        return this.getLoggedInData().token;
    }

    get endpointId() {
        return this.getLoggedInData().endpointId;
    }

    session(options: { token: string; endpointId: number }) {
        this.state = { type: "logged", ...options };
    }

    async login(options: {
        username: string;
        password: string;
        endpointName: string;
    }): Promise<ApiRes<PortainerApi>> {
        const { username, password, endpointName } = options;
        const { baseUrl } = this.options;
        const data = { Username: username, Password: password };
        const response = await axios({
            method: "POST",
            url: `${baseUrl}/api/auth`,
            data,
            validateStatus: status => status >= 200 && status < 500,
        });
        const loginResponse = response.data as LoginResponse;

        if (isSuccessfulLogin(loginResponse)) {
            const token = loginResponse.jwt;
            const endpointsRes = await this.request<Endpoint[]>("GET", "/endpoints", {}, token);
            return endpointsRes.flatMap(endpoints => {
                const endpoint = endpoints.find(endpoint => endpoint.Name === endpointName);
                if (endpoint) {
                    const newState: State = { type: "logged", token, endpointId: endpoint.Id };
                    const newApi = new PortainerApi(this.options, newState);
                    return Either.success(newApi);
                } else {
                    return Either.error(`Cannot find endpoint: name=${endpointName}`);
                }
            });
        } else {
            const parts = [loginResponse.message, loginResponse.details];
            const msg = _.compact(parts).join(" - ") || "Cannot login";
            return Either.error(msg);
        }
    }

    async startContainer(containerId: string): Promise<ApiRes<void>> {
        return this.request("POST", `/endpoints/1/docker/containers/${containerId}/start`);
    }

    async stopContainer(containerId: string): Promise<ApiRes<void>> {
        return this.request("POST", `/endpoints/1/docker/containers/${containerId}/stop`);
    }

    async createStack(newStackApi: PostStackRequest): Promise<ApiRes<PostStackResponse>> {
        const url = `/stacks?endpointId=${this.endpointId}&method=repository&type=2`;
        return this.request("POST", url, {
            data: newStackApi,
        });
    }

    async setPermission(resourceId: number, permission: Permission): Promise<ApiRes<void>> {
        return this.request("PUT", `/resource_controls/${resourceId}`, {
            data: permission,
        });
    }

    async getContainers(options: { all: boolean }): Promise<ApiRes<ContainerApi[]>> {
        return this.request("GET", `/endpoints/${this.endpointId}/docker/containers/json`, {
            params: { all: options.all },
        });
    }
}

function isSuccessfulLogin(loginResponse: LoginResponse): loginResponse is LoginResponseSuccess {
    return (loginResponse as LoginResponseSuccess).jwt !== undefined;
}
