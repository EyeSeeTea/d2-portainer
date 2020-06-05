import React from "react";
import { useLoggedAppContext } from "../AppContext";
import { D2Container } from "../../domain/entities/D2Container";
import { ContainersList } from "../containers-list/ContainersList";
import { i18n } from "../../i18n";

const endpointId = 1;

interface RootPageProps {
    logout: () => void;
}

export const RootPage: React.FC<RootPageProps> = React.memo(props => {
    const { logout } = props;
    const { compositionRoot, currentUser } = useLoggedAppContext();
    const [containers, setContainers] = React.useState<D2Container[] | undefined>();

    React.useEffect(() => {
        compositionRoot.containers.get({ endpointId }).then(res => {
            res.match({ success: setContainers, error: alert });
        });
    }, [compositionRoot]);

    return (
        <div>
            <div style={{ float: "right" }}>
                <b>{currentUser.username}</b>
                <button onClick={logout}>{i18n.t("[logout]")}</button>
            </div>

            <ContainersList containers={containers || []} />
        </div>
    );
});
