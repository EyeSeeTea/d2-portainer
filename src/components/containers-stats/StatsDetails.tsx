import React from "react";
import {
    ExpansionPanel,
    Typography,
    ExpansionPanelSummary,
    ExpansionPanelDetails,
    makeStyles,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { useLoggedAppContext } from "../AppContext";

interface StatsDetailsProps {
    title: string;
    url: string;
    initialOpen?: boolean;
}

export const StatsDetails: React.FC<StatsDetailsProps> = React.memo(props => {
    const { title, url, initialOpen } = props;
    const classes = useStyles();
    const { userSession: currentUser } = useLoggedAppContext();
    const iframeRef = React.useRef<HTMLIFrameElement>(null);

    const login = React.useCallback(() => {
        console.log("onLoad");
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
            if (isLoginPage) {
                const { localStorage } = iframe.contentWindow;
                localStorage["portainer.JWT"] = JSON.stringify(currentUser.token);
                localStorage["portainer.ENDPOINT_ID"] = 1;
                iframe.contentWindow.location.replace(url);
            } else {
                on(idocument.querySelector("#sideview"), el => el.remove());
                on(
                    idocument.querySelector<HTMLElement>("#page-wrapper"),
                    el => (el.style.paddingLeft = "0px")
                );
                onAll(idocument.querySelectorAll(".row.header"), el => el.remove());
                on(idocument.querySelector(".row.ng-scope"), el => el.remove());
            }
        }
    }, []);

    return (
        <ExpansionPanel className={classes.panel} defaultExpanded={initialOpen}>
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <Typography className={classes.heading}>{title}</Typography>
            </ExpansionPanelSummary>

            <ExpansionPanelDetails>
                <iframe
                    ref={iframeRef}
                    src={url}
                    width="100%"
                    height="1000"
                    frameBorder="0"
                    marginHeight={0}
                    marginWidth={0}
                    onLoad={login}
                />
            </ExpansionPanelDetails>
        </ExpansionPanel>
    );
});

const useStyles = makeStyles(theme => ({
    heading: {
        fontSize: theme.typography.pxToRem(18),
        fontWeight: theme.typography.fontWeightMedium,
    },
    panel: {
        marginBottom: 10,
    },
}));

function on<T extends Element>(element: T | undefined | null, action: (el: T) => void): void {
    if (element) action(element);
}

function onAll<T extends Element>(elements: NodeListOf<T>, action: (el: T) => void): void {
    Array.from(elements).forEach(el => action(el));
}
