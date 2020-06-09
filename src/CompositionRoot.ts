import { StartD2Containers } from "./domain/usecases/StartD2Containers";
import { CreateD2Container } from "./domain/usecases/CreateD2Container";
import { StopD2Containers } from "./domain/usecases/StopD2Containers";
import { ContainersPortainerRepository } from "./data/ContainersPortainerRepository";
import { User } from "./domain/entities/User";
import { LoginUser } from "./domain/usecases/LoginUser";
import { UsersPortainerRepository } from "./data/UsersPortainerRepository";
import { GetD2Containers } from "./domain/usecases/GetD2Containers";

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
        const get = new GetD2Containers(this.containersRepository);
        const start = new StartD2Containers(this.containersRepository);
        const stop = new StopD2Containers(this.containersRepository);
        const create = new CreateD2Container(this.containersRepository);

        return {
            get: get.execute.bind(get),
            start: start.execute.bind(start),
            stop: stop.execute.bind(stop),
            create: create.execute.bind(create),
        };
    }
}
