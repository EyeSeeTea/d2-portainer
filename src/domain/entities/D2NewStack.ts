import { UrlMapping } from "./../../config";
import { Acl } from "./Acl";
import _ from "lodash";
import config from "../../config";

export interface D2NewStack extends Acl {
    url: string | undefined;
    dataImage: string;
    coreImage: string;
}

const mappingFomUrl = _(config.urlMappings)
    .map(mapping => [mapping.url, mapping] as [string, UrlMapping])
    .fromPairs()
    .value();

const urlFromPort = _(config.urlMappings)
    .map(mapping => [mapping.port, mapping.url] as [number, string])
    .fromPairs()
    .value();

export function getPort(stack: D2NewStack): number | undefined {
    return stack.url ? _(mappingFomUrl).get(stack.url, undefined)?.port : undefined;
}

export function getBranch(stack: D2NewStack): string | undefined {
    return stack.url ? _(mappingFomUrl).get(stack.url, undefined)?.name : undefined;
}

export function getUrlFromStringPort(port: string): string | undefined {
    return _(urlFromPort).get(port, undefined);
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
