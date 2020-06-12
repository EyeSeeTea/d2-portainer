import { GetMembershipsMetadata } from "./domain/usecases/GetMembershipsMetadata";
import { TeamsRepository } from "./domain/repositories/MemberShipRepository";
import { GetDataSourceInfo } from "./domain/usecases/GetDataSourceInfo";
import { SessionBrowserStorageRepository } from "./data/SessionBrowserStorageRepository";
import { StartD2Stacks } from "./domain/usecases/StartD2Stacks";
import { CreateD2Stacks } from "./domain/usecases/CreateD2Stack";
import { StopD2Stacks } from "./domain/usecases/StopD2Stacks";
import { LoginUser } from "./domain/usecases/LoginUser";
import { GetD2Stacks } from "./domain/usecases/GetD2Stacks";
import { GetD2NewStack } from "./domain/usecases/GetD2Stack";
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
    membershipsRepository: TeamsRepository;

    constructor(public options: { portainerApi: PortainerApi }) {
        this.dataSourceRepository = new DataSourcePortainerRepository(this.options.portainerApi);
        this.stacksRepository = new D2StacksPortainerRepository(this.options.portainerApi);
        this.membershipsRepository = new MembershipPortainerRepository(this.options.portainerApi);
        this.sessionRepository = new SessionBrowserStorageRepository();
    }

    public get dataSource() {
        return {
            login: execute(new LoginUser(this.dataSourceRepository, this.sessionRepository)),
            loginFromSession: execute(
                new LoginUserFromSession(this.dataSourceRepository, this.sessionRepository)
            ),
            logout: execute(new LogoutUser(this.sessionRepository)),
            info: execute(new GetDataSourceInfo(this.dataSourceRepository)),
        };
    }

    public get stacks() {
        return {
            get: execute(new GetD2Stacks(this.stacksRepository)),
            getForm: execute(new GetD2NewStack(this.stacksRepository)),
            start: execute(new StartD2Stacks(this.stacksRepository)),
            stop: execute(new StopD2Stacks(this.stacksRepository)),
            create: execute(new CreateD2Stacks(this.stacksRepository)),
            update: execute(new UpdateD2Stacks(this.stacksRepository)),
            getStats: execute(new GetD2StackStats(this.stacksRepository)),
        };
    }

    public get memberships() {
        return {
            get: execute(new GetMembershipsMetadata(this.membershipsRepository)),
        };
    }
}

function execute<T extends { execute: Function }>(obj: T) {
    return obj.execute.bind(obj) as T["execute"];
}
