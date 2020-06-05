import { ContainersPortainerRepository } from "./data/ContainersPortainerRepository";
import { User } from "./domain/entities/User";
import { LoginUser } from "./domain/usecases/LoginUser";
import { UsersPortainerRepository } from "./data/UsersPortainerRepository";
import { GetContainers } from "./domain/usecases/GetContainers";

export class CompositionRoot {
    constructor(public options: { portainerUrl: string; currentUser?: User }) {}

    private get usersRepository() {
        return new UsersPortainerRepository({
            baseUrl: this.options.portainerUrl,
            currentUser: this.options.currentUser,
        });
    }

    private get containersRepository() {
        const { portainerUrl, currentUser } = this.options;
        if (!currentUser) throw new Error("Cannot use containers repostiory without current user");

        return new ContainersPortainerRepository({
            baseUrl: portainerUrl,
            user: currentUser,
        });
    }

    public get users() {
        const login = new LoginUser(this.usersRepository);
        return {
            login: login.execute.bind(login),
        };
    }

    public get containers() {
        const getContainers = new GetContainers(this.containersRepository);
        return {
            get: getContainers.execute.bind(getContainers),
        };
    }
}
