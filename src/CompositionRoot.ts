import { GetMembershipsMetadata } from "./domain/usecases/GetMembershipsMetadata";
import { MembershipRepository } from "./domain/repositories/MembershipRepository";
import { GetDataSourceInfo } from "./domain/usecases/GetDataSourceInfo";
import { SessionBrowserStorageRepository } from "./data/SessionBrowserStorageRepository";
import { StartD2Stacks } from "./domain/usecases/StartD2Stacks";
import { CreateD2Stacks } from "./domain/usecases/CreateD2Stack";
import { StopD2Stacks } from "./domain/usecases/StopD2Stacks";
import { LoginUser } from "./domain/usecases/LoginUser";
import { GetD2Stacks } from "./domain/usecases/GetD2Stacks";
import { GetD2Stack } from "./domain/usecases/GetD2Stack";
import { GetD2StackStats } from "./domain/usecases/GetD2StackStats";
import { PortainerApi } from "./data/PortainerApi";
import { DataSourcePortainerRepository } from "./data/DataSourcePortainerRepository";
import { D2StacksPortainerRepository } from "./data/D2StacksPortainerRepository";
import { MembershipPortainerRepository } from "./data/MembershipPortainerRepository";
import { SessionRepository } from "./domain/repositories/SessionRepository";
import { DataSourceRepository } from "./domain/repositories/DataSourceRepository";
import { D2StacksRepository } from "./domain/repositories/D2StacksRepository";
import { LogoutUser } from "./domain/usecases/LogoutUser";
import { LoginUserFromSession } from "./domain/usecases/LoginUserFromSession";
import { UpdateD2Stacks } from "./domain/usecases/UpdateD2Stack";

export class CompositionRoot {
    dataSourceRepository: DataSourceRepository;
    stacksRepository: D2StacksRepository;
    sessionRepository: SessionRepository;
    membershipsRepository: MembershipRepository;

    constructor(public options: { portainerApi: PortainerApi }) {
        this.dataSourceRepository = new DataSourcePortainerRepository(this.options.portainerApi);
        this.stacksRepository = new D2StacksPortainerRepository(this.options.portainerApi);
        this.membershipsRepository = new MembershipPortainerRepository(this.options.portainerApi);
        this.sessionRepository = new SessionBrowserStorageRepository();
    }

    public get dataSource() {
        return getExecute({
            login: new LoginUser(this.dataSourceRepository, this.sessionRepository),
            loginFromSession: new LoginUserFromSession(
                this.dataSourceRepository,
                this.sessionRepository
            ),
            logout: new LogoutUser(this.sessionRepository),
            info: new GetDataSourceInfo(this.dataSourceRepository),
        });
    }

    public get stacks() {
        return getExecute({
            get: new GetD2Stacks(this.stacksRepository),
            getById: new GetD2Stack(this.stacksRepository),
            start: new StartD2Stacks(this.stacksRepository),
            stop: new StopD2Stacks(this.stacksRepository),
            create: new CreateD2Stacks(this.stacksRepository),
            update: new UpdateD2Stacks(this.stacksRepository),
            getStats: new GetD2StackStats(this.stacksRepository),
        });
    }

    public get memberships() {
        return getExecute({
            get: new GetMembershipsMetadata(this.membershipsRepository),
        });
    }
}

interface UseCase {
    execute: Function;
}

function getExecute<UseCases extends Record<Key, UseCase>, Key extends keyof UseCases>(
    useCases: UseCases
): { [K in Key]: UseCases[K]["execute"] } {
    const keys = Object.keys(useCases) as Key[];
    const initialOutput = {} as { [K in Key]: UseCases[K]["execute"] };

    return keys.reduce((output, key) => {
        const useCase = useCases[key];
        const execute = useCase.execute.bind(useCase) as UseCases[typeof key]["execute"];
        output[key] = execute;
        return output;
    }, initialOutput);
}
