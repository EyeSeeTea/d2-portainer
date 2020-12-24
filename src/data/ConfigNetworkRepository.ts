import baseConfig from "../config";
import { BaseConfig, Config, RemoteConfig as ExtraConfig } from "../domain/entities/Config";
import { ConfigRepository } from "../domain/repositories/ConfigRepository";
import { Either } from "../utils/Either";
import { PromiseRes } from "../utils/types";

export class ConfigNetworkRepository implements ConfigRepository {
    async get(): PromiseRes<Config> {
        const urlMappingsSource: BaseConfig["urlMappingsSource"] = baseConfig.urlMappingsSource || {
            type: "static",
        };

        const extraConfig: ExtraConfig | undefined = await (() => {
            switch (urlMappingsSource.type) {
                case "static":
                    return { urlMappings: baseConfig.urlMappings };
                case "url":
                    return fetch(urlMappingsSource.url)
                        .then(res => res.json() as Promise<ExtraConfig>)
                        .catch(() => undefined);
            }
        })();

        return extraConfig
            ? Either.success({ ...baseConfig, ...extraConfig })
            : Either.error("Cannot get remote config");
    }
}
