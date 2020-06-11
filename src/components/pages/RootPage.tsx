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

const refreshRate = 10;

export const RootPage: React.FC<RootPageProps> = React.memo(props => {
    const { logout } = props;
    const { compositionRoot, userSession: currentUser } = useLoggedAppContext();
    const [containers, setContainers] = React.useState<D2Container[]>([]);
    const snackbar = useSnackbar();

    const getContainers = React.useCallback(() => {
        compositionRoot.containers.get({ endpointId }).then(res => {
            res.match({ success: setContainers, error: error => snackbar.error(error) });
        });
    }, [compositionRoot]);

    React.useEffect(() => {
        getContainers();
        //const intervalId = setInterval(getContainers, refreshRate * 1000);
        //return () => clearInterval(intervalId);
    }, [getContainers]);

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
                    <Route path="/new" render={() => <NewContainerPage />} />
                    <Route
                        render={() => (
                            <ContainersList containers={containers} onRefresh={getContainers} />
                        )}
                    />
                </Switch>
            </HashRouter>
        </div>
    );
});
