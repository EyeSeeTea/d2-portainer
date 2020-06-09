import React from "react";
import { useLoggedAppContext } from "../AppContext";
import { D2Container } from "../../domain/entities/D2Container";
import { ContainersList } from "../containers-list/ContainersList";
import { i18n } from "../../i18n";
import { useSnackbar } from "d2-ui-components";
import { HashRouter, Route, Switch } from "react-router-dom";
import { NewContainerPage } from "./new-container/NewContainerPage";

const endpointId = 1;

interface RootPageProps {
    logout: () => void;
}

export const RootPage: React.FC<RootPageProps> = React.memo(props => {
    const { logout } = props;
    const { compositionRoot, currentUser } = useLoggedAppContext();
    const [containers, setContainers] = React.useState<D2Container[] | undefined>();
    const snackbar = useSnackbar();

    React.useEffect(() => {
        compositionRoot.containers.get({ endpointId }).then(res => {
            res.match({ success: setContainers, error: error => snackbar.error(error) });
        });
    }, [compositionRoot]);

    return (
        <div>
            <div style={{ float: "right", margin: 5 }}>
                Logged in as <b>{currentUser.username}</b>{" "}
                <button onClick={logout}>{i18n.t("logout")}</button>
            </div>
            <div style={{ clear: "both" }}></div>

            <HashRouter>
                <Switch>
                    <Route path="/new" render={() => <NewContainerPage />} />
                    <Route render={() => <ContainersList containers={containers || []} />} />
                </Switch>
            </HashRouter>
        </div>
    );
});
