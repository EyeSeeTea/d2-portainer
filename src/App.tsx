import React from "react";
import { AppContextProvider } from "./components/AppContext";
import { LoginPage } from "./components/pages/LoginPage";
import { UserSession } from "./domain/entities/UserSession";
import { RootPage } from "./components/pages/RootPage";
import { SnackbarProvider } from "d2-ui-components";
import { CompositionRoot } from "./CompositionRoot";
import { PortainerApi } from "./data/PortainerApi";

interface AppProps {
    portainerUrl: string;
}

const App: React.FC<AppProps> = React.memo(props => {
    const { portainerUrl } = props;

    const compositionRoot = React.useMemo(() => {
        const api = new PortainerApi({ baseUrl: portainerUrl });
        return new CompositionRoot({ portainerApi: api });
    }, [portainerUrl]);

    const [userSession, setUserSession] = React.useState<UserSession | null | undefined>(undefined);

    React.useEffect(() => {
        const userSession = compositionRoot.dataSource.loginFromSession();
        setUserSession(userSession || null);
    }, [compositionRoot]);

    const logout = React.useCallback(() => setUserSession(null), [setUserSession]);

    if (userSession === undefined) return <p>...</p>;

    const value = { compositionRoot, userSession };

    return (
        <AppContextProvider value={value}>
            <SnackbarProvider>
                {userSession ? (
                    <RootPage logout={logout} />
                ) : (
                    <LoginPage setUserSession={setUserSession} />
                )}
            </SnackbarProvider>
        </AppContextProvider>
    );
});

export default React.memo(App);
