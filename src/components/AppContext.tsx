import React from "react";
import { CompositionRoot } from "../CompositionRoot";
import { UserSession } from "../domain/entities/UserSession";

export const AppContext = React.createContext<AppContextValue | undefined>(undefined);

export interface AppContextValue {
    compositionRoot: CompositionRoot;
    userSession: UserSession | null;
}

export type AppContextLoggedValue = AppContextValue & { userSession: UserSession };

interface AppContextProps {
    value: AppContextValue;
}

export const AppContextProvider: React.FC<AppContextProps> = React.memo(props => {
    const { value, children } = props;

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
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
