import React from "react";
import { ConfirmationDialog } from "d2-ui-components";
import { i18n } from "../../i18n";
import { D2Stack } from "../../domain/entities/D2Stack";
import { useLoggedAppContext } from "../AppContext";
import { makeStyles } from "@material-ui/core";
import { StatsDetails } from "./StatsDetails";

interface StackStatsProps {
    stack: D2Stack;
    onClose: () => void;
}

export const StackStats: React.FC<StackStatsProps> = React.memo(props => {
    const { stack, onClose } = props;
    const { compositionRoot } = useLoggedAppContext();
    const classes = useStyles();
    const title = i18n.t("Stats: ") + stack.dataImage;
    const stats = compositionRoot.stacks.getStats(stack);

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
