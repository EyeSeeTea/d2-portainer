import axios, { AxiosRequestConfig } from "axios";
import _ from "lodash";
import { Either, StringEither } from "../utils/Either";
import { ContainerApi, PostStackRequest, PostStackResponse, Permission } from "./PortainerApiTypes";

type Token = string;
type LoginResponseSuccess = { jwt: Token };
type LoginResponseError = { message: string; details: string };
type LoginResponse = LoginResponseSuccess | LoginResponseError;

type ApiRes<T> = StringEither<T>;

export class PortainerApi {
    private apiUrl: string;

    constructor(public options: { baseUrl: string; token: string }) {
        this.apiUrl = `${options.baseUrl}/api`;
    }

    static async login(options: {
        baseUrl: string;
        username: string;
        password: string;
    }): Promise<ApiRes<PortainerApi>> {
        const { baseUrl, username, password } = options;
        const data = { Username: username, Password: password };
        const apiUrl = `${baseUrl}/api`;
        const response = await axios({
            method: "POST",
            url: `${apiUrl}/auth`,
            data,
            validateStatus: status => status >= 200 && status < 500,
        });
        const loginResponse = response.data as LoginResponse;

        if (isSuccessfulLogin(loginResponse)) {
            const api = new PortainerApi({ baseUrl, token: loginResponse.jwt });
            return Either.success(api);
        } else {
            const parts = [loginResponse.message, loginResponse.details];
            const msg = _.compact(parts).join(" - ") || "Cannot login";
            return Either.error(msg);
        }
    }

    private async request<T>(request: AxiosRequestConfig) {
        const response = await axios({
            method: "GET",
            headers: { Authorization: `Bearer ${this.options.token}` },
            validateStatus: _status => true,
            ...request,
        });
        const { status } = response;

        if ((status >= 200 && status < 300) || [304].includes(status)) {
            return Either.success(response.data as T);
        } else {
            const msg = _.compact([status, JSON.stringify(response.data)]).join(" - ");
            return Either.error(msg);
        }
    }

    async startContainer(containerId: string): Promise<ApiRes<void>> {
        return this.request({
            method: "POST",
            url: `${this.apiUrl}/endpoints/1/docker/containers/${containerId}/start`,
        });
    }

    async stopContainer(containerId: string): Promise<ApiRes<void>> {
        return this.request({
            method: "POST",
            url: `${this.apiUrl}/endpoints/1/docker/containers/${containerId}/stop`,
        });
    }

    async createStack(
        endpointId: number,
        newStackApi: PostStackRequest
    ): Promise<ApiRes<PostStackResponse>> {
        return this.request({
            method: "POST",
            url: `${this.apiUrl}/stacks?endpointId=${endpointId}&method=repository&type=2`,
            data: newStackApi,
        });
    }

    async setPermission(resourceId: number, permission: Permission): Promise<ApiRes<void>> {
        return this.request({
            method: "PUT",
            url: `${this.apiUrl}/resource_controls/${resourceId}`,
            data: permission,
        });
    }

    async getContainers(options: {
        endpointId: number;
        all: boolean;
    }): Promise<ApiRes<ContainerApi[]>> {
        return this.request({
            method: "GET",
            url: `${this.apiUrl}/endpoints/${options.endpointId}/docker/containers/json`,
            params: { all: options.all },
        });
    }
}

function isSuccessfulLogin(loginResponse: LoginResponse): loginResponse is LoginResponseSuccess {
    return (loginResponse as LoginResponseSuccess).jwt !== undefined;
}
