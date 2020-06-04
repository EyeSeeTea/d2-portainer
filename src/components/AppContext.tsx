import React from "react";
import { CompositionRoot } from "../CompositionRoot";

export const AppContext = React.createContext<AppContextValue | undefined>(undefined);

export interface AppContextValue {
    compositionRoot: CompositionRoot;
}

interface AppContextProps {
    apiUrl: string;
}

export const AppContextProvider: React.FC<AppContextProps> = React.memo(props => {
    const { apiUrl, children } = props;
    const appContext = React.useMemo(() => {
        const compositionRoot = new CompositionRoot({ apiUrl });
        return { compositionRoot };
    }, [apiUrl]);

    return <AppContext.Provider value={appContext}>{children}</AppContext.Provider>;
});

export function useAppContext(): AppContextValue {
    const appContext = React.useContext(AppContext);
    if (!appContext) throw new Error("Composition root not initialized");
    return appContext;
}
