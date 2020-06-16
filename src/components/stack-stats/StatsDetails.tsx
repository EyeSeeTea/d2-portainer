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
                localStorage["portainer.ENDPOINT_ID"] = JSON.stringify(currentUser.endpointId);
                const location = iframe.contentWindow.location;
                setTimeout(() => {
                    location.replace(url + "#" + new Date().getTime());
                    login();
                }, 1000);
            } else {
                on(idocument, "#sideview", el => remove(el));
                on(idocument, "#page-wrapper", el => (el.style.paddingLeft = "0px"));
                on(idocument, ".row.ng-scope", el => remove(el));
                onAll(idocument, ".row.header", el => remove(el));
            }
        }
    }, [currentUser, url]);

    return (
        <ExpansionPanel className={classes.panel} defaultExpanded={initialOpen}>
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <Typography className={classes.heading}>{title}</Typography>
            </ExpansionPanelSummary>

            <ExpansionPanelDetails>
                <iframe
                    title={title}
                    ref={iframeRef}
                    src={url}
                    width="100%"
                    height="600"
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

function remove<T extends HTMLElement>(element: T): void {
    element.style.display = "none";
}

function on(document: Document, selector: string, action: (el: HTMLElement) => void): void {
    const element = document.querySelector<HTMLElement>(selector);
    if (element) action(element);
}

function onAll<T extends Element>(
    document: Document,
    selector: string,
    action: (el: HTMLElement) => void
): void {
    const elements = document.querySelectorAll<HTMLElement>(selector);
    Array.from(elements).forEach(el => action(el));
}
