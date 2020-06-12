export interface D2NewStack {
    dataImage: string;
    coreImage: string;
    port: number;
    access: "restricted" | "admin";
    teamIds: number[];
    userIds: number[];
}

export function setCoreImageFromData<S extends D2NewStack>(stack: S, newDataImage: string): S {
    // eyeseetea/dhis2-data:2.30-who -> eyeseetea/dhis2-core:2.30-who
    const [org, rest1] = newDataImage.split("/", 2);
    const [, rest2] = (rest1 || "").split(":", 2);

    let newCoreImage;
    if (rest2 === undefined) {
        newCoreImage = org;
    } else {
        const [version] = (rest2 || "").split("-", 2);
        newCoreImage = `${org}/dhis2-core:${version}`;
    }

    return { ...stack, dataImage: newDataImage, coreImage: newCoreImage };
}
