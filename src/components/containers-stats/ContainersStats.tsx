import React from "react";
import { ConfirmationDialog } from "d2-ui-components";
import { i18n } from "../../i18n";
import { D2Container } from "../../domain/entities/D2Container";
import { useLoggedAppContext } from "../AppContext";
import { makeStyles } from "@material-ui/core";
import { StatsDetails } from "./StatsDetails";

interface ContainersStatsProps {
    d2Container: D2Container;
    onClose: () => void;
}

export const ContainersStats: React.FC<ContainersStatsProps> = React.memo(props => {
    const { d2Container, onClose } = props;
    const { compositionRoot } = useLoggedAppContext();
    const classes = useStyles();
    const title = i18n.t("Stats: ") + d2Container.name;
    const stats = compositionRoot.containers.getStats(d2Container);

    return (
        <ConfirmationDialog
            isOpen={true}
            onCancel={onClose}
            title={title}
            cancelText={i18n.t("Close")}
            fullWidth={true}
            maxWidth="xl"
        >
            <div className={classes.root}>
                <StatsDetails title={i18n.t("Core")} url={stats.core} initialOpen={true} />
                <StatsDetails title={i18n.t("Database")} url={stats.db} />
                <StatsDetails title={i18n.t("Nginx")} url={stats.gateway} />
            </div>
        </ConfirmationDialog>
    );
});

const useStyles = makeStyles(theme => ({
    root: {
        width: "100%",
    },
}));
