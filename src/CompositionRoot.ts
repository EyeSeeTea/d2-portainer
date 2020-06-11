import { GetDataSourceInfo } from "./domain/usecases/GetDataSourceInfo";
import { SessionBrowserStorageRepository } from "./data/SessionBrowserStorageRepository";
import { StartD2Containers } from "./domain/usecases/StartD2Containers";
import { CreateD2Container } from "./domain/usecases/CreateD2Container";
import { StopD2Containers } from "./domain/usecases/StopD2Containers";
import { ContainersPortainerRepository } from "./data/ContainersPortainerRepository";
import { LoginUser } from "./domain/usecases/LoginUser";
import { GetD2Containers } from "./domain/usecases/GetD2Containers";
import { GetD2ContainerStats } from "./domain/usecases/GetD2ContainerStats";
import { PortainerApi } from "./data/PortainerApi";
import { LoadSession } from "./domain/usecases/LoadSession";
import { StoreSession } from "./domain/usecases/StoreSession";
import { SetDataSourceSession } from "./domain/usecases/SetDataSourceSession";
import { DataSourcePortainerRepository } from "./data/DataSourcePortainerRepository";

export class CompositionRoot {
    dataSourceRepository: DataSourcePortainerRepository;
    containersRepository: ContainersPortainerRepository;
    sessionRepository: SessionBrowserStorageRepository;

    constructor(public options: { portainerApi: PortainerApi }) {
        this.dataSourceRepository = new DataSourcePortainerRepository(this.options.portainerApi);
        this.containersRepository = new ContainersPortainerRepository(this.options.portainerApi);
        this.sessionRepository = new SessionBrowserStorageRepository();
    }

    public get dataSource() {
        return {
            login: execute(new LoginUser(this.dataSourceRepository)),
            info: execute(new GetDataSourceInfo(this.dataSourceRepository)),
            session: execute(new SetDataSourceSession(this.dataSourceRepository)),
        };
    }

    public get containers() {
        return {
            get: execute(new GetD2Containers(this.containersRepository)),
            start: execute(new StartD2Containers(this.containersRepository)),
            stop: execute(new StopD2Containers(this.containersRepository)),
            create: execute(new CreateD2Container(this.containersRepository)),
            getStats: execute(new GetD2ContainerStats(this.containersRepository)),
        };
    }

    public get session() {
        return {
            load: execute(new LoadSession(this.sessionRepository)),
            store: execute(new StoreSession(this.sessionRepository)),
        };
    }
}

function execute<T extends { execute: Function }>(obj: T) {
    return obj.execute.bind(obj) as T["execute"];
}
