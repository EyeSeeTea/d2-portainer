import { Acl } from "./Acl";
import _ from "lodash";
import { Config, UrlMapping } from "./Config";

export interface D2NewStack extends Acl {
    url: string | undefined;
    dataImage: string;
    coreImage: string;
}

function getMappingByUrl(config: Config): Record<string, UrlMapping | undefined> {
    return _(config.urlMappings)
        .map(mapping => [mapping.url, mapping] as [string, UrlMapping])
        .fromPairs()
        .value();
}

export function getPort(config: Config, stack: D2NewStack): number | undefined {
    const mappingByUrl = getMappingByUrl(config);
    return stack.url ? _(mappingByUrl).get(stack.url, undefined)?.port : undefined;
}

export function getBranch(config: Config, stack: D2NewStack): string | undefined {
    const { defaultBranch } = config.dockerComposeRepository;
    if (!stack.url) return;
    const mappingByUrl = getMappingByUrl(config);
    const mapping = _(mappingByUrl).get(stack.url, undefined);
    return mapping ? mapping.branch || defaultBranch || mapping.name : undefined;
}

export function getUrlFromStringPort(config: Config, port: string): string | undefined {
    return _(config.urlMappings)
        .map(mapping => [mapping.port, mapping.url] as [number, string])
        .fromPairs()
        .get(port, undefined);
}

export function getContext(stack: D2NewStack): string | undefined {
    return stack.url
        ? new URL(stack.url).pathname.replace(/^\/*/, "").replace(/\/*$/, "")
        : undefined;
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
