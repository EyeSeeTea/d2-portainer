import React from "react";
import { CompositionRoot } from "../CompositionRoot";
import { Config } from "../domain/entities/Config";
import { UserSession } from "../domain/entities/UserSession";

export const AppContext = React.createContext<AppContextValue | undefined>(undefined);

export interface AppContextValue {
    compositionRoot: CompositionRoot;
    userSession: UserSession | null;
    isDev: boolean;
    config: Config;
}

export type AppContextLoggedValue = AppContextValue & { userSession: UserSession };

type AppContextProps = Pick<AppContextValue, "compositionRoot" | "userSession" | "config">;

export const AppContextProvider: React.FC<AppContextProps> = React.memo(props => {
    const { children, ...other } = props;
    const providerValue = { ...other, isDev: getIsDev() };
    return <AppContext.Provider value={providerValue}>{children}</AppContext.Provider>;
});

export function useAppContext(): AppContextValue {
    const appContext = React.useContext(AppContext);
    if (!appContext) throw new Error("Composition root not initialized");
    return appContext;
}

export function useLoggedAppContext(): AppContextLoggedValue {
    const appContext = React.useContext(AppContext);
    if (!appContext) throw new Error("Composition root not initialized");

    const { userSession } = appContext;
    if (!userSession) throw new Error("No user logged");

    return { ...appContext, userSession: userSession };
}

function getIsDev(): boolean {
    return !!sessionStorage.getItem("debug");
}
