import React from "react";
import { useLoggedAppContext } from "../AppContext";

interface PortainerLoginProps {
    onLogin: () => void;
}

export const PortainerLogin: React.FC<PortainerLoginProps> = React.memo(props => {
    const { onLogin } = props;
    const iframeRef = React.useRef<HTMLIFrameElement>(null);
    const { compositionRoot, userSession: currentUser } = useLoggedAppContext();
    const portainerUrl = React.useMemo(() => compositionRoot.dataSource.info().url, [
        compositionRoot,
    ]);

    const login = React.useCallback(async () => {
        const iframe = iframeRef.current;
        const idocument = iframe?.contentWindow?.document;
        if (!iframe || !iframe.contentWindow || !idocument) return;
        const sideview = idocument.querySelector("#sideview");

        if (!sideview) {
            setTimeout(login, 1000);
        } else {
            const isLoginPage = !!idocument.querySelector(
                '[ng-show="!ctrl.state.loginInProgress"]'
            );
            console.debug("isLoginPage", isLoginPage);

            if (isLoginPage) {
                const { localStorage } = iframe.contentWindow;
                console.debug("Set portainer session variables");
                localStorage["portainer.JWT"] = JSON.stringify(currentUser.token);
                localStorage["portainer.ENDPOINT_ID"] = JSON.stringify(currentUser.endpointId);
            }

            onLogin();
        }
    }, [currentUser, onLogin]);

    return (
        <iframe
            style={{ display: "none" }}
            ref={iframeRef}
            title="Portainer login"
            src={portainerUrl}
            width="100%"
            height="800"
            onLoad={login}
        />
    );
});
