import axios from "axios";
import _ from "lodash";
import { Either, StringEither } from "../utils/Either";
import { ContainerApi } from "./PortainerApiTypes";

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
            const msg = `${loginResponse.message}: ${loginResponse.details}`;
            return Either.error(msg);
        }
    }

    async getContainers(options: {
        endpointId: number;
        all: boolean;
    }): Promise<ApiRes<ContainerApi[]>> {
        const response = await axios({
            method: "GET",
            url: `${this.apiUrl}/endpoints/${options.endpointId}/docker/containers/json`,
            params: { all: options.all },
            validateStatus: _status => true,
        });

        if (response.status === 200) {
            return Either.success(response.data as ContainerApi[]);
        } else {
            const msg = _.compact([response.status, JSON.stringify(response.data)]).join(" - ");
            return Either.error(msg);
        }
    }
}

function isSuccessfulLogin(loginResponse: LoginResponse): loginResponse is LoginResponseSuccess {
    return (loginResponse as LoginResponseSuccess).jwt !== undefined;
}
