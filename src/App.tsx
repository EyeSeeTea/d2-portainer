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

    const [userSession, setUserSession] = React.useState<UserSession | null | undefined>();

    const reloadSession = React.useCallback(
        (userSession: UserSession | undefined) => {
            if (userSession) {
                compositionRoot.dataSource.session(userSession);
                setUserSession(userSession);
            } else {
                setUserSession(null);
            }
        },
        [setUserSession, compositionRoot]
    );
    React.useEffect(() => {
        const userSession = compositionRoot.session.load();
        reloadSession(userSession);
    }, [reloadSession, compositionRoot]);

    const setUserSessionAndPersist = React.useCallback(
        userSession => {
            compositionRoot.session.store(userSession);
            reloadSession(userSession);
        },
        [compositionRoot, reloadSession]
    );

    const logout = React.useCallback(() => {
        compositionRoot.session.store(undefined);
        reloadSession(undefined);
    }, [compositionRoot, reloadSession]);

    if (userSession === undefined) return null;

    const value = { compositionRoot, userSession };

    return (
        <AppContextProvider value={value}>
            <SnackbarProvider>
                {userSession ? (
                    <RootPage logout={logout} />
                ) : (
                    <LoginPage setUserSession={setUserSessionAndPersist} />
                )}
            </SnackbarProvider>
        </AppContextProvider>
    );
});

export default React.memo(App);
