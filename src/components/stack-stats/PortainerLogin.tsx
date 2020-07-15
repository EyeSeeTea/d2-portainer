import React from "react";
import { useLoggedAppContext } from "../AppContext";
import { LinearProgress } from "@material-ui/core";

export const PortainerLogin: React.FC<{}> = React.memo(props => {
    const iframeRef = React.useRef<HTMLIFrameElement>(null);
    const { compositionRoot, userSession: currentUser } = useLoggedAppContext();
    const portainerUrl = React.useMemo(() => compositionRoot.dataSource.info().url, [
        compositionRoot,
    ]);
    const [isLoggedIn, setLoggedIn] = React.useState(false);

    const login = React.useCallback(async () => {
        const iframe = iframeRef.current;
        const idocument = iframe?.contentWindow?.document;
        if (!iframe || !iframe.contentWindow || !idocument) throw new Error("Cannot get iframe");
        const isLoginPage = !!idocument.querySelector('[ng-show="!ctrl.state.loginInProgress"]');
        const isHomePage = !!idocument.querySelector('a[ui-sref="portainer.account"]');
        console.debug({ isLoginPage, isHomePage });

        if (isHomePage || isLoginPage) {
            const { localStorage } = iframe.contentWindow;
            console.debug("Login: Set portainer session variables");
            localStorage["portainer.JWT"] = JSON.stringify(currentUser.token);
            localStorage["portainer.ENDPOINT_ID"] = JSON.stringify(currentUser.endpointId);
            setLoggedIn(true);
        } else {
            setTimeout(login, 1000);
        }
    }, [currentUser, setLoggedIn]);

    if (isLoggedIn) {
        return <React.Fragment>{props.children}</React.Fragment>;
    } else {
        return (
            <React.Fragment>
                <LinearProgress />

                <iframe
                    style={{ display: "none" }}
                    ref={iframeRef}
                    title="Portainer login"
                    src={portainerUrl}
                    width="100%"
                    height="800"
                    onLoad={login}
                />
            </React.Fragment>
        );
    }
});
