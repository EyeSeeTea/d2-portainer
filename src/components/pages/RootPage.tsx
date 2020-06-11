import React from "react";
import { useLoggedAppContext } from "../AppContext";
import { D2Stack } from "../../domain/entities/D2Stack";
import { StacksList } from "../stacks-list/StacksList";
import { i18n } from "../../i18n";
import { useSnackbar } from "d2-ui-components";
import { HashRouter, Route, Switch } from "react-router-dom";
import { NewStackPage } from "./new-stack/NewStackPage";

interface RootPageProps {
    logout: () => void;
}

// const refreshRate = 10;

export const RootPage: React.FC<RootPageProps> = React.memo(props => {
    const { logout } = props;
    const { compositionRoot, userSession: currentUser } = useLoggedAppContext();
    const [stacks, setStacks] = React.useState<D2Stack[]>([]);
    const snackbar = useSnackbar();

    const getStacks = React.useCallback(() => {
        compositionRoot.stacks.get().then(res => {
            res.match({ success: setStacks, error: error => snackbar.error(error) });
        });
    }, [compositionRoot, snackbar]);

    React.useEffect(() => {
        getStacks();
        //const intervalId = setInterval(getStacks, refreshRate * 1000);
        //return () => clearInterval(intervalId);
    }, [getStacks]);

    return (
        <div>
            <div style={{ float: "right", margin: 5 }}>
                {i18n.t("Logged in as")} <b>{currentUser.username}</b>
                <button style={{ marginLeft: 5 }} onClick={logout}>
                    {i18n.t("logout")}
                </button>
            </div>
            <div style={{ clear: "both" }}></div>

            <HashRouter>
                <Switch>
                    <Route path="/new" render={() => <NewStackPage />} />
                    <Route render={() => <StacksList stacks={stacks} onRefresh={getStacks} />} />
                </Switch>
            </HashRouter>
        </div>
    );
});
