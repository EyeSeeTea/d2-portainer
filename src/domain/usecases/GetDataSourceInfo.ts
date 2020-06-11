import { DataSourceRepository, Info } from "../repositories/DataSourceRepository";

export class GetDataSourceInfo {
    constructor(private dataSourceRepository: DataSourceRepository) {}

    public execute(): Info {
        return this.dataSourceRepository.info();
    }
}
