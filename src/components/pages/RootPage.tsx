import React from "react";
import { useLoggedAppContext } from "../AppContext";
import { D2Stack } from "../../domain/entities/D2Stack";
import { StacksList } from "../stacks-list/StacksList";
import { i18n } from "../../i18n";
import { useSnackbar } from "d2-ui-components";
import { HashRouter, Route, Switch } from "react-router-dom";
import { NewStackPage } from "./new-stack/NewStackPage";
import { EditStackPage } from "./edit-stack/EditStackPage";

interface RootPageProps {
    onLogout: () => void;
}

// const refreshRate = 10;

export const RootPage: React.FC<RootPageProps> = React.memo(props => {
    const { onLogout } = props;
    const { compositionRoot, userSession } = useLoggedAppContext();
    const [stacks, setStacks] = React.useState<D2Stack[]>([]);
    const snackbar = useSnackbar();

    const getStacks = React.useCallback(() => {
        compositionRoot.stacks.get().then(res => {
            res.match({
                success: setStacks,
                error: snackbar.error,
            });
        });
    }, [compositionRoot, snackbar]);

    const logoutSession = React.useCallback(() => {
        compositionRoot.dataSource.logout();
        onLogout();
    }, [compositionRoot, onLogout]);

    React.useEffect(() => {
        getStacks();
        //const intervalId = setInterval(getStacks, refreshRate * 1000);
        //return () => clearInterval(intervalId);
    }, [getStacks]);

    return (
        <div>
            <div style={{ float: "right", margin: 5 }}>
                {i18n.t("Logged in as")} <b>{userSession.username}</b>
                <button style={{ marginLeft: 5 }} onClick={logoutSession}>
                    {i18n.t("logout")}
                </button>
            </div>

            <div style={{ clear: "both" }}></div>

            <HashRouter>
                <Switch>
                    <Route
                        path="/edit/:id"
                        render={({ match }) => <EditStackPage id={match.params.id} />}
                    />
                    <Route path="/new/" render={() => <NewStackPage />} />
                    <Route render={() => <StacksList stacks={stacks} onRefresh={getStacks} />} />
                </Switch>
            </HashRouter>
        </div>
    );
});
