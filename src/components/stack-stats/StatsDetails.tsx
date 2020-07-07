import React from "react";
import {
    ExpansionPanel,
    Typography,
    ExpansionPanelSummary,
    ExpansionPanelDetails,
    makeStyles,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

interface StatsDetailsProps {
    title: string;
    url: string;
    initialOpen?: boolean;
}

export const StatsDetails: React.FC<StatsDetailsProps> = React.memo(props => {
    const { title, url, initialOpen } = props;
    const classes = useStyles();
    const iframeRef = React.useRef<HTMLIFrameElement>(null);

    const cleanPage = React.useCallback(() => {
        const idocument = iframeRef.current?.contentWindow?.document;

        if (!idocument) {
            return;
        } else if (!idocument.querySelector(".row.header")) {
            setTimeout(cleanPage, 1000);
        } else {
            on(idocument, "#sideview", el => hide(el));
            on(idocument, "#page-wrapper", el => (el.style.paddingLeft = "0px"));
            on(idocument, ".row.ng-scope", el => hide(el));
            onAll(idocument, ".row.header", el => hide(el));
        }
    }, []);

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
                    onLoad={cleanPage}
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

function hide<T extends HTMLElement>(element: T): void {
    element.style.display = "none";
}

function on(document: Document, selector: string, action: (el: HTMLElement) => void): void {
    const element = document.querySelector<HTMLElement>(selector);
    if (element) action(element);
}

function onAll(document: Document, selector: string, action: (el: HTMLElement) => void): void {
    const elements = document.querySelectorAll<HTMLElement>(selector);
    Array.from(elements).forEach(el => action(el));
}
