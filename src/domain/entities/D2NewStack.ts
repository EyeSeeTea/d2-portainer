export interface D2NewStack {
    branch: string;
    dataImage: string;
    coreInstance: string;
    port: number;
    access: "restricted" | "admin";
    teamIds: number[];
}

export class D2NewStackMethods {
    constructor(public stack: D2NewStack) {}

    setCoreImageFromData(newDataInstance: string): D2NewStack {
        // eyeseetea/dhis2-data:2.30-who -> eyeseetea/dhis2-core:2.30-who
        const [org, rest1] = newDataInstance.split("/", 2);
        const [, rest2] = (rest1 || "").split(":", 2);

        let newCoreInstance;
        if (rest2 === undefined) {
            newCoreInstance = org;
        } else {
            const [version] = (rest2 || "").split("-", 2);
            newCoreInstance = `${org}/dhis2-core:${version}`;
        }
        return {
            ...this.stack,
            dataImage: newDataInstance,
            coreInstance: newCoreInstance,
        };
    }
}
