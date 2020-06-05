import React from "react";
import { CompositionRoot } from "../CompositionRoot";
import { User } from "../domain/entities/User";

export const AppContext = React.createContext<AppContextValue | undefined>(undefined);

export interface AppContextValue {
    compositionRoot: CompositionRoot;
    currentUser?: User;
}

export type AppContextLoggedValue = AppContextValue & { currentUser: User };

interface AppContextProps {
    value: { portainerUrl: string; currentUser?: User };
}

export const AppContextProvider: React.FC<AppContextProps> = React.memo(props => {
    const { value, children } = props;
    const { portainerUrl, currentUser } = value;
    const appContext = React.useMemo(() => {
        const compositionRoot = new CompositionRoot({ portainerUrl, currentUser });
        return { compositionRoot, currentUser };
    }, [portainerUrl, currentUser]);

    return <AppContext.Provider value={appContext}>{children}</AppContext.Provider>;
});

export function useAppContext(): AppContextValue {
    const appContext = React.useContext(AppContext);
    if (!appContext) throw new Error("Composition root not initialized");
    return appContext;
}

export function useLoggedAppContext(): AppContextLoggedValue {
    const appContext = React.useContext(AppContext);
    if (!appContext) throw new Error("Composition root not initialized");

    const { currentUser } = appContext;
    if (!currentUser) throw new Error("No user logged");

    return { ...appContext, currentUser };
}
