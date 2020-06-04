export class CompositionRoot {
    private repositories: {};

    constructor(options: { apiUrl: string }) {
        this.repositories = {};
    }

    /*
    public get experiments() {
        const get = new GetExperi ments(this.repositories.experiment);
        return {
            get: get.execute.bind(get),
        };
    }
    */
}
