import React from "react";
import { AppContextProvider } from "./components/AppContext";
import { LoginPage } from "./components/pages/LoginPage";
import { UserSession } from "./domain/entities/UserSession";
import { RootPage } from "./components/pages/RootPage";
import { SnackbarProvider } from "d2-ui-components";
import { getDefaultCompositionRoot } from "./CompositionRoot";
import { PortainerApi } from "./data/PortainerApi";
import { match } from "./utils/tagged-union";
import { CircularProgress, MuiThemeProvider } from "@material-ui/core";
import config from "./config";
import { initFeedbackTool } from "./utils/feedback-tool";
import { muiTheme } from "./dhis2.theme";

interface AppProps {
    portainerUrl: string;
}

type State =
    | { type: "getFromSession" }
    | { type: "askAuth" }
    | { type: "loggedIn"; userSession: UserSession };

const App: React.FC<AppProps> = React.memo(props => {
    const { portainerUrl } = props;

    const compositionRoot = React.useMemo(() => {
        const portainerApi = new PortainerApi({ baseUrl: portainerUrl });
        return getDefaultCompositionRoot({ portainerApi });
    }, [portainerUrl]);

    const [state, setState] = React.useState<State>({ type: "getFromSession" });

    React.useEffect(() => initFeedbackTool(config.feedback, window as any), []);

    React.useEffect(() => {
        if (state.type === "getFromSession") {
            const userSession = compositionRoot.dataSource.loginFromSession();
            setState(userSession ? { type: "loggedIn", userSession } : { type: "askAuth" });
        }
    }, [compositionRoot, state, setState]);

    const logout = React.useCallback(() => setState({ type: "askAuth" }), [setState]);

    const setUserSession = React.useCallback(
        userSession => setState({ type: "loggedIn", userSession }),
        [setState]
    );

    const userSession = state.type === "loggedIn" ? state.userSession : null;

    return (
        <MuiThemeProvider theme={muiTheme}>
            <AppContextProvider compositionRoot={compositionRoot} userSession={userSession}>
                <SnackbarProvider>
                    {match(state, {
                        getFromSession: () => <CircularProgress />,
                        askAuth: () => <LoginPage setUserSession={setUserSession} />,
                        loggedIn: () => <RootPage onLogout={logout} />,
                    })}
                </SnackbarProvider>
            </AppContextProvider>
        </MuiThemeProvider>
    );
});

export default React.memo(App);
