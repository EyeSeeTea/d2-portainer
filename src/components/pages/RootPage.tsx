import React from "react";
import { useLoggedAppContext } from "../AppContext";
import { StacksList } from "../stacks-list/StacksList";
import { i18n } from "../../i18n";
import { HashRouter, Route, Switch } from "react-router-dom";
import { NewStackPage } from "./new-stack/NewStackPage";
import { EditStackPage } from "./edit-stack/EditStackPage";

interface RootPageProps {
    onLogout: () => void;
}

export const RootPage: React.FC<RootPageProps> = React.memo(props => {
    const { onLogout } = props;
    const { compositionRoot, userSession } = useLoggedAppContext();

    const logoutSession = React.useCallback(() => {
        compositionRoot.dataSource.logout();
        onLogout();
    }, [compositionRoot, onLogout]);

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
                    <Route render={() => <StacksList />} />
                </Switch>
            </HashRouter>
        </div>
    );
});
