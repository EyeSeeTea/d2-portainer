import React from "react";
import { Button } from "@material-ui/core";
import { HashRouter, Route, Switch } from "react-router-dom";

import { useLoggedAppContext } from "../AppContext";
import { StacksList } from "../stacks-list/StacksList";
import { i18n } from "../../i18n";
import { NewStackPage } from "./new-stack/NewStackPage";
import { EditStackPage } from "./edit-stack/EditStackPage";
import logoImage from "../../images/D2-Docker-Logo.png";

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
                <img
                    style={{ marginRight: 10 }}
                    src={logoImage}
                    alt="Logo"
                    width="25"
                    height="25"
                />
                <div style={{ display: "inline", verticalAlign: "super" }}>
                    {i18n.t("Logged in as")} <b>{userSession.username}</b>
                    <Button onClick={logoutSession}>{i18n.t("logout")}</Button>
                </div>
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
